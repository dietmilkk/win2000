import http.server
import json
import urllib.request
import urllib.error
import os
import sys
import socket

API_KEY = os.environ.get('OPENROUTER_API_KEY') or os.environ.get('DASHSCOPE_API_KEY', '')
if not API_KEY:
    print('WARNING: No API key set (OPENROUTER_API_KEY or DASHSCOPE_API_KEY). Chat will return 401.', file=sys.stderr)

PORT = int(os.environ.get('PORT', 8080))
API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
MAX_OUTPUTS_PER_IP = 50
_ip_counts = {}


class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path != '/api/chat':
            self.send_error(404)
            return

        ip = self.client_address[0]
        count = _ip_counts.get(ip, 0) + 1
        _ip_counts[ip] = count
        if count > MAX_OUTPUTS_PER_IP:
            self.send_response(429)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': {'message': 'Rate limit exceeded. Maximum 50 messages per session.'}
            }).encode('utf-8'))
            return

        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)

        # Forward the client's request body as-is (includes model)
        body_json = json.loads(body)
        body = json.dumps(body_json).encode('utf-8')

        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY,
        }

        req = urllib.request.Request(API_URL, data=body, headers=headers, method='POST')

        try:
            resp = urllib.request.urlopen(req)
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('X-Accel-Buffering', 'no')
            self.end_headers()

            while True:
                line = resp.readline()
                if not line:
                    break
                line = line.decode('utf-8', errors='replace').rstrip('\r\n')
                if not line.startswith('data: '):
                    continue
                self.wfile.write((line + '\n\n').encode('utf-8'))
                self.wfile.flush()

        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8', errors='replace')
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(error_body.encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({'error': {'message': str(e)}}).encode('utf-8'))

    def do_GET(self):
        if self.path == '/api/chat':
            self.send_error(405)
            return
        if self.path == '/api/gifs':
            gif_dir = os.path.join(os.path.dirname(__file__), 'assets', 'gifs', 'random')
            try:
                files = sorted([f for f in os.listdir(gif_dir) if os.path.isfile(os.path.join(gif_dir, f))])
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(files).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return
        return super().do_GET()


if __name__ == '__main__':
    server = http.server.HTTPServer(('0.0.0.0', PORT), ProxyHandler)
    server.socket.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
    print('Server running on http://localhost:' + str(PORT))
    server.serve_forever()
