const API_KEY = process.env.OPENROUTER_API_KEY;
const API_MODEL = process.env.API_MODEL || 'qwen3.5-35b-a3b';
const API_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const MAX_OUTPUTS_PER_IP = 50;
const ipCounts = {};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  ipCounts[ip] = (ipCounts[ip] || 0) + 1;
  if (ipCounts[ip] > MAX_OUTPUTS_PER_IP) {
    return res.status(429).json({ error: { message: 'Rate limit exceeded. Maximum 50 messages per session.' } });
  }

  const body = { ...req.body, model: API_MODEL };

  try {
    const dashRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!dashRes.ok) {
      const errBody = await dashRes.text();
      return res.status(dashRes.status).json(JSON.parse(errBody));
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = dashRes.body.getReader();
    const decoder = new TextDecoder();

    function pump() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          res.end();
          return;
        }
        const text = decoder.decode(value, { stream: true });
        res.write(text);
        return pump();
      });
    }

    return pump();
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
