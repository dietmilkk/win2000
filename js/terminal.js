(function() {
    'use strict';

    var termWin = document.getElementById('termWindow');
    var termBody = document.getElementById('termBody');
    var termDragHandle = document.getElementById('termDragHandle');
    var termOutput = document.getElementById('termOutput');
    var termInput = document.getElementById('termInput');
    var termBtnClose = document.getElementById('termBtnClose');
    var termBtnMinimize = document.getElementById('termBtnMinimize');
    var termBtnMaximize = document.getElementById('termBtnMaximize');

    var currentDir = 'C:\\';
    var cmdHistory = [];
    var historyIndex = -1;
    var terminalFirstOpen = true;
    var _pageLoad = Date.now();
    var _gameHandler = null;

    function getHostname() {
        return window.location.hostname || 'localhost';
    }

    function getUptime() {
        var elapsed = Math.floor((Date.now() - _pageLoad) / 1000);
        var h = Math.floor(elapsed / 3600);
        var m = Math.floor((elapsed % 3600) / 60);
        var s = elapsed % 60;
        return h + 'h ' + m + 'm ' + s + 's';
    }

    function getOS() {
        var ua = navigator.userAgent;
        if (ua.indexOf('Windows NT 10') !== -1) return 'Windows 10';
        if (ua.indexOf('Windows NT 6.3') !== -1) return 'Windows 8.1';
        if (ua.indexOf('Windows NT 6.2') !== -1) return 'Windows 8';
        if (ua.indexOf('Windows NT 6.1') !== -1) return 'Windows 7';
        if (ua.indexOf('Windows NT 6.0') !== -1) return 'Windows Vista';
        if (ua.indexOf('Windows NT 5.1') !== -1) return 'Windows XP';
        if (ua.indexOf('Windows NT 5.0') !== -1) return 'Windows 2000';
        if (ua.indexOf('Mac') !== -1) return 'macOS';
        if (ua.indexOf('Linux') !== -1) return 'Linux';
        if (ua.indexOf('Android') !== -1) return 'Android';
        if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) return 'iOS';
        return 'Desconhecido';
    }

    var commands = {
        help: function() {
            return 'Available commands:\n' +
                '  anims      ASCII animations (16 available)\n' +
                '  ascii      ASCII art from the internet\n' +
                '  cd         Change directory\n' +
                '  clear      Clear the screen\n' +
                '  data       Detailed system information\n' +
                '  games      List of games\n' +
                '  help       Show this help\n' +
                '  hostname   Computer name\n' +
                '  ipconfig   Network configuration\n' +
                '  ping       Test connection\n' +
                '  uptime     System uptime';
        },
        clear: function() {
            termOutput.innerHTML = '';
            return '';
        },
        ipconfig: function() {
            var host = getHostname().toUpperCase();
            return '\nWindows 2000 IP Configuration\n\n' +
                '        Host Name . . . . . . . : ' + host + '\n' +
                '        Primary DNS Suffix  . . : \n' +
                '        Node Type . . . . . . : Hybrid\n' +
                '        IP Routing Enabled. . . : No\n' +
                '        WINS Proxy Enabled. . . : No\n\n' +
                'Ethernet Adapter Local Connection:\n\n' +
                '        Connection-specific DNS Suffix  . : \n' +
                '        Description . . . . . . : AMD PCNET Family PCI Ethernet Adapter\n' +
                '        Physical Address . . . . : 00-1A-2B-3C-4D-5E\n' +
                '        DHCP Enabled. . . . . . : Yes\n' +
                '        IP Address . . . . . . . : 175.45.176.1\n' +
                '        Subnet Mask . . . . . . : 255.255.255.0\n' +
                '        Default Gateway . . . . : 192.168.1.1\n' +
                '        DNS Servers . . . . . . : 8.8.8.8\n' +
                '                                         8.8.4.4';
        },
        ping: function(args) {
            var target = args || 'localhost';
            var results = [];
            results.push('\nPinging ' + target + ' with 32 bytes of data:');
            var times = [];
            for (var i = 0; i < 4; i++) {
                times.push(Math.floor(Math.random() * 40 + 5));
            }
            for (var i = 0; i < 4; i++) {
                results.push('Reply from ' + target + ': bytes=32 time=' + times[i] + 'ms TTL=128');
            }
            var min = Math.min.apply(null, times);
            var max = Math.max.apply(null, times);
            var avg = Math.floor(times.reduce(function(a, b) { return a + b; }, 0) / times.length);
            results.push('\nPing statistics for ' + target + ':');
            results.push('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),');
            results.push('Approximate round trip times in milliseconds:');
            results.push('    Minimum = ' + min + 'ms, Maximum = ' + max + 'ms, Average = ' + avg + 'ms');
            return results.join('\n');
        },
        ascii: function() {
            var complexArts = [
                '       __----__\n    _-~          ~-_\n  /     __    __     \\\n |    / _ \\  / _ \\    |\n  \\   | | | || | |   /\n   \\  | | | || | |  /\n    \\ |_| |_||_| |_| /\n     \\_____________/\n      \\_         _/\n        \\       /\n         |  _  |\n         | | | |\n         |_| |_|',
                '         __====-_  _-====___\n   _--^^^#####//      \\\\\\#####^^^--_\n_-^##########// (    ) \\\\\\##########^-_\n-############//  |\\^^/|  \\\\\\############-\n_/############//   (@::@)   \\\\\\############\\_\n/#############((     \\\\//     ))#############\\\n\\############/    \\\\||||//    \\############/\n \\############/  \\\\/ || \\\\/  \\############/\n  \\############\\  \\\\_||_//  /############/\n   \\###########\\    \\\\//    /###########/\n    \\##########\\     \\//     /##########/\n     \\#########\\     ||     /#########/\n      \\########\\    |||    /########/',
                '     .---.\n    /     \\\n   | () () |\n    \\  ^  /\n     |||||\n     |||||\n   __|||||__\n  /   |||   \\\n /    |||    \\\n|     |||     |\n \\    |||    /\n  \\   |||   /\n   \\  |||  /\n    \\_____/',
                '    ________________________\n  /        \\/       \\/       \\\n /   /\\    ||   /\\   ||  /\\    \\\n|   /  \\   ||  /  \\  || /  \\    |\n|  |    |  || |    | |||    |   |\n|   \\  /   ||  \\  /  || \\  /    |\n \\   \\/    ||   \\/   ||  \\/    /\n  \\________||________||_______/\n   |  ___  ||  ___  ||  ___  |\n   | |   | || |   | || |   | |\n   | |___| || |___| || |___| |\n   |_______||_______||_______|',
                '         /\\\n        /  \\\n       / /\\ \\\n      / /  \\ \\\n     / /    \\ \\\n    / / _____\\ \\\n   / /_/     \\_\\ \\\n  /_/___________\\_\\\n  |    _____     |\n  |   /     \\    |\n  |  |  o o |   |\n  |   \\_____/    |\n  |_______________|\n       |||||\n       |||||',
                '      .---.\n     /     \\\n    | . . . |\n     \\  ^  /\n      |||||\n      |||||\n   ___|||||___\n  /  |||||||  \\\n /   |||||||   \\\n|    |||||||    |\n \\   |||||||   /\n  \\  |||||||  /\n   \\_________/',
                '  ,---.  ,---.\n /     \\/     \\\n|  o  o  o  o  |\n \\    ()    /\n  \\        /\n   \\  __  /\n    | |  |\n    | |  |\n   /| |  |\\\n  / | |  | \\\n /  | |  |  \\\n    |_|  |_|',
                '  __      ___ _    _ ____  _____ ___   ___  \n  \\ \\    / (_) |  | / ___|| ____/ _ \\ / _ \\ \n   \\ \\  / / _| |  | \\___ \\|  __| | | | | | |\n    \\ \\/ / | | |__| |___) | |___| |_| | |_| |\n     \\__/  |_|\\____/|____/|_____|\\___/ \\___/ \n  __        ___   ___ _   _ _   _ \n  \\ \\      / / | |_ _| \\ | | \\ | |\n   \\ \\ /\\ / /| |  | ||  \\| |  \\| |\n    \\ V  V / | |  | || |\\  | |\\  |\n     \\_/\\_/  |_| |___|_| \\_|_| \\_|',
                '      .-.\n     /   \\\n    | . .|\n    |  _ |\n    |/   \\|\n   /|     |\\\n  / |  _  | \\\n /  | | | |  \\\n    |_| |_|',
                '    /\\_/\\\n   ( o.o )\n    > ^ <\n   /|   |\\\n  (_|   |_)\n    |   |\n   /     \\\n  /       \\\n /         \\',
                '      ___           ___\n     /  \\\\         /  \\\\\n    /    \\\\       /    \\\\\n   /  ()  \\\\     /  ()  \\\\\n  /________\\\\   /________\\\\\n  |        |   |        |\n  |  ____  |   |  ____  |\n  | |    | |   | |    | |\n  | |____| |   | |____| |\n  |________|   |________|',
                '         ___\n        /   \\\n       /     \\\n      /  ---  \\\n     /  |   |  \\\n    /   |___|   \\\n   /    _____    \\\n  /    /     \\    \\\n /    /       \\    \\\n|    |  o   o  |    |\n|     \\_____/     |\n \\________________/',
                '     _______       _______\n   /       \\\\   /       \\\\\n  /    o    \\\\ /    o    \\\\\n |   (___)   | |   (___)   |\n  \\    |    /   \\    |    /\n   \\___|___/     \\___|___/\n       |             |\n      / \\           / \\\n     /   \\         /   \\',
                '    /\\---------/\\\n   /  \\_______/  \\\n  /               \\\n |   ___     ___   |\n |  |   |   |   |  |\n |  |___|   |___|  |\n |               |\n  \\             /\n   \\    ___    /\n    \\  /   \\  /\n     \\/     \\/',
                '    _______________\n   /               \\\n  /     _     _     \\\n |     |_|   |_|    |\n |      _     _     |\n |     |_|   |_|    |\n |                 |\n  \\      ___      /\n   \\    /   \\    /\n    \\  /     \\  /\n     \\/       \\/',
            ];
            var fonts = ['acrobatic', 'alligator', 'caligraphy', 'catwalk', 'colossal', 'contessa', 'cosmic', 'doh', 'doom', 'fraktur', 'funface', 'goofy', 'graffiti', 'hollywood', 'isometric1', 'isometric2', 'isometric3', 'isometric4', 'jazmine', 'katakana', 'larry3d', 'marquee', 'nancyj', 'nancyj-fancy', 'nipples', 'ogre', 'poison', 'puffy', 'pyramid', 'relief', 'rounded', 'rozzo', 'runic', 'sblood', 'shadow', 'slide', 'starwars', 'stellar', 'stop', 'trek', 'usaflag', 'varsity', 'wavy', 'weird', 'whimsy'];
            var font = fonts[Math.floor(Math.random() * fonts.length)];
            var words = ['win2000', 'Windows', 'Retro', 'Terminal', 'Hacker', 'Byte', 'Pixel', 'Vintage', 'Matrix', 'Cyber', 'Neon', 'Digital', 'System', 'Computer', 'Blue Screen'];
            var word = words[Math.floor(Math.random() * words.length)];
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://artii.herokuapp.com/make?text=' + word + '&font=' + font);
            xhr.timeout = 7000;
            xhr.onload = function() {
                if (xhr.status === 200 && xhr.responseText && xhr.responseText.trim().length > 10) {
                    printPre('\n' + xhr.responseText);
                } else {
                    printPre('\n' + complexArts[Math.floor(Math.random() * complexArts.length)] + '\n');
                }
            };
            xhr.onerror = function() { printPre('\n' + complexArts[Math.floor(Math.random() * complexArts.length)] + '\n'); };
            xhr.ontimeout = function() { printPre('\n' + complexArts[Math.floor(Math.random() * complexArts.length)] + '\n'); };
            xhr.send();
            return 'Fetching ASCII art...';
        },
        games: function() {
            return 'Available games:\n' +
                '  hangman      Hangman (guess the word)\n' +
                '  tictactoe    Tic-Tac-Toe (2 players)\n' +
                '  snake        Snake game (popup window)\n' +
                '  reaction     Reaction time test\n\n' +
                'Type the game name to start. During a game,\ntype QUIT to exit.';
        },
        hangman: function() {
            _gs = {
                word: _palavras[Math.floor(Math.random() * _palavras.length)],
                guessed: [],
                attempts: 6
            };
            _gameHandler = hangmanHandler;
            return '\n' + drawGallows(6) + '\n' + makeForcaDisplay() + '\n\nType a letter or QUIT.';
        },
        tictactoe: function() {
            _gs = {
                board: ['1','2','3','4','5','6','7','8','9'],
                turn: 'X'
            };
            _gameHandler = velhaHandler;
            return drawVelhaBoard();
        },
        snake: function() {
            return startSnake();
        },
        reaction: function() {
            return startReaction();
        },
        anims: function(args) {
            if (!window.animations) return '\nAnimations not loaded.';
            if (args) {
                var a = args.trim().toLowerCase();
                if (window.animations[a]) {
                    window.playAnimation(a);
                    return '\nPlaying: ' + window.animations[a].name + ' (ESC to stop)';
                }
                return '\nAnimation "' + a + '" not found.';
            }
            var list = Object.keys(window.animations);
            var out = '\nAvailable animations (' + list.length + '):\n\n';
            for (var i = 0; i < list.length; i++) {
                out += '  ' + list[i] + '    ' + window.animations[list[i]].name + '\n';
            }
            out += '\nType "anims <name>" to play, or ESC to stop.';
            return out;
        },
        hostname: function() {
            return getHostname();
        },
        uptime: function() {
            return 'System uptime: ' + getUptime() + '\n' +
                'The system is running perfectly.';
        },
        data: function() {
            var now = new Date();
            var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var tz = '';
            try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch(e) {}
            var conn = '';
            try { conn = navigator.connection ? navigator.connection.effectiveType : ''; } catch(e) {}
            var mem = '';
            try { mem = navigator.deviceMemory ? navigator.deviceMemory + 'GB' : ''; } catch(e) {}
            var cpu = '';
            try { cpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + ' cores' : ''; } catch(e) {}
            var info = '=== System Information ===\n\n' +
                '  Date: ' + days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear() + '\n' +
                '  Time: ' + now.toLocaleTimeString() + '\n' +
                '  Timezone: ' + (tz || 'unknown') + '\n' +
                '  Hostname: ' + getHostname() + '\n' +
                '  User: user\n' +
                '  OS: ' + getOS() + '\n' +
                '  Architecture: ' + (navigator.platform || 'unknown') + '\n' +
                '  Browser: ' + navigator.userAgent.replace(/[\/][^\s]*/g, '').substring(0, 60) + '\n' +
                '  Language: ' + (navigator.language || '') + '\n' +
                '  Resolution: ' + screen.width + 'x' + screen.height + '\n' +
                '  Available Resolution: ' + screen.availWidth + 'x' + screen.availHeight + '\n' +
                '  Color Depth: ' + screen.colorDepth + '-bit\n' +
                '  Session Time: ' + getUptime() + '\n' +
                '  CPU: ' + (cpu || 'unknown') + '\n' +
                '  RAM: ' + (mem || 'unknown') + '\n' +
                '  Connection: ' + (conn || 'unknown') + '\n';
            printPre(info);
            printPre('  Fetching external IP...');
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://api.ipify.org');
            xhr.timeout = 5000;
            xhr.onload = function() {
                if (xhr.status === 200 && xhr.responseText) {
                    printPre('  External IP: ' + xhr.responseText);
                }
            };
            xhr.send();
            return '';
        }
    };

    function printLine(text) {
        var div = document.createElement('div');
        div.className = 'term-line';
        div.textContent = text;
        termOutput.appendChild(div);
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    function printPre(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            printLine(lines[i]);
        }
    }

    function printHTML(html) {
        var div = document.createElement('div');
        div.className = 'term-line';
        div.innerHTML = html;
        termOutput.appendChild(div);
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    function processCommand(cmd) {
        cmd = cmd.trim();
        if (!cmd) return;

        cmdHistory.push(cmd);
        historyIndex = cmdHistory.length;

        var parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [cmd];
        var command = parts[0].toLowerCase();
        var args = parts.slice(1).join(' ').replace(/"/g, '');

        printLine(currentDir + '>' + cmd);

        if (command === 'exit' || command === 'quit') {
            termBehavior.hide();
            return;
        }

        if (command === 'cd') {
            if (!args) {
                printLine(currentDir);
            } else if (args === '..') {
                if (currentDir !== 'C:\\') {
                    var parts2 = currentDir.split('\\');
                    parts2.pop();
                    currentDir = parts2.join('\\') + '\\';
                }
            } else {
                var newDir = args.toUpperCase();
                if (newDir.indexOf(':') === -1) {
                    newDir = currentDir + newDir;
                }
                if (!newDir.endsWith('\\')) newDir += '\\';
                printLine('Directory changed.');
                currentDir = newDir;
            }
            return;
        }

        if (command === 'cd.') {
            currentDir = 'C:\\';
            return;
        }

        if (_gameHandler) {
            _gameHandler(cmd);
            return;
        }

        var handler = commands[command];
        if (handler) {
            var result = handler(args);
            if (result) printPre(result);
        } else {
            printLine('"' + command + '" is not recognized as an internal or external command,\noperable program or batch file.');
        }
    }

    /* ===== Games ===== */
    var _gs = {};

    /* ---- Hangman ---- */
    var _palavras = ['TERMINAL','WINDOWS','COMPUTADOR','PROGRAMAR','ASCII','RETRO','PIXEL','HACKER','BYTE','VINTAGE','SISTEMA','INTERNET','CODIGO','MOUSE','TECLADO','MONITOR','PROCESSADOR','MEMORIA','DISCO','REDE','GRAFICO','KERNEL','DRIVER','SERVIDOR','JANELA'];

    function drawGallows(n) {
        var g = [
            '  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\\\  |\n      |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\\\  |\n /    |\n      |\n=========',
            '  +---+\n  |   |\n  O   |\n /|\\\\  |\n / \\\\  |\n      |\n=========',
            '  +---+\n  |   |\n [O]  |\n /|\\\\  |\n / \\\\  |\n      |\n========='
        ];
        return g[n] || g[6];
    }

    function makeForcaDisplay() {
        var d = '';
        for (var i = 0; i < _gs.word.length; i++) {
            var ch = _gs.word[i];
            if (_gs.guessed.indexOf(ch) !== -1) {
                d += '<span style="color:#0c0;font-weight:bold">' + ch + '</span> ';
            } else {
                d += '<span style="color:#888">_</span> ';
            }
        }
        var kb = makeKeyboard();
        return d + '<br><br><span style="color:#888">Attempts: ' + _gs.attempts + '/6</span><br><br>' + kb;
    }

    function makeKeyboard() {
        var rows = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
        var html = '<span style="color:#888">Keyboard:</span><br>';
        for (var r = 0; r < rows.length; r++) {
            for (var c = 0; c < rows[r].length; c++) {
                var ch = rows[r][c];
                var guessed = _gs.guessed.indexOf(ch) !== -1;
                var correct = guessed && _gs.word.indexOf(ch) !== -1;
                var wrong = guessed && _gs.word.indexOf(ch) === -1;
                if (correct) {
                    html += '<span style="color:#0c0;font-weight:bold">' + ch + '</span> ';
                } else if (wrong) {
                    html += '<span style="color:#c33;text-decoration:line-through">' + ch + '</span> ';
                } else {
                    html += '<span style="color:#555">' + ch + '</span> ';
                }
            }
            html += '<br>';
        }
        return html;
    }

    function hangmanHandler(input) {
        var cmd = input.trim().toUpperCase();
        if (cmd === 'QUIT' || cmd === 'EXIT' || cmd === 'CANCEL') {
            _gameHandler = null;
            printPre('Game ended.');
            return;
        }
        if (cmd.length !== 1 || cmd < 'A' || cmd > 'Z') {
            printPre('Type ONE letter (A-Z).');
            return;
        }
        if (_gs.guessed.indexOf(cmd) !== -1) {
            printPre('Letter "' + cmd + '" already used!');
            return;
        }
        _gs.guessed.push(cmd);
        if (_gs.word.indexOf(cmd) === -1) _gs.attempts--;

        var won = true;
        for (var i = 0; i < _gs.word.length; i++) {
            if (_gs.guessed.indexOf(_gs.word[i]) === -1) { won = false; break; }
        }
        if (won) {
            _gameHandler = null;
            var winArt = '\n  \\o/  You got it!\n   |\n  / \\\n';
            printPre(winArt);
            printPre(drawGallows(6 - _gs.attempts));
            var finalWord = '';
            for (var i = 0; i < _gs.word.length; i++) {
                finalWord += '<span style="color:#0c0;font-weight:bold">' + _gs.word[i] + '</span> ';
            }
            printHTML(finalWord);
            printPre('You won!');
            return;
        }
        if (_gs.attempts <= 0) {
            _gameHandler = null;
            printPre(drawGallows(7));
            printPre('  The word was: ' + _gs.word);
            printPre('  You lost...');
            return;
        }
        printPre('\n' + drawGallows(6 - _gs.attempts));
        printHTML(makeForcaDisplay());
    }

    /* ---- Tic-Tac-Toe ---- */
    function drawVelhaBoard(suppressTurn) {
        var b = _gs.board;
        function cell(v) {
            if (v === 'X') return '<span style="color:#cc3333;font-weight:bold">X</span>';
            if (v === 'O') return '<span style="color:#2255cc;font-weight:bold">O</span>';
            return '<span style="color:#888">' + v + '</span>';
        }
        var hl = _gs._winLine || [];
        function wrap(i, content) {
            var isHl = hl.indexOf(i) !== -1;
            return isHl ? '<span style="background:#ffd700;color:#000;font-weight:bold">' + content + '</span>' : content;
        }
        var html = '\n\u250C\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u252C\u2500\u2500\u2500\u2510\n';
        html += '\u2502 ' + wrap(0, cell(b[0])) + ' \u2502 ' + wrap(1, cell(b[1])) + ' \u2502 ' + wrap(2, cell(b[2])) + ' \u2502\n';
        html += '\u251C\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2524\n';
        html += '\u2502 ' + wrap(3, cell(b[3])) + ' \u2502 ' + wrap(4, cell(b[4])) + ' \u2502 ' + wrap(5, cell(b[5])) + ' \u2502\n';
        html += '\u251C\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u253C\u2500\u2500\u2500\u2524\n';
        html += '\u2502 ' + wrap(6, cell(b[6])) + ' \u2502 ' + wrap(7, cell(b[7])) + ' \u2502 ' + wrap(8, cell(b[8])) + ' \u2502\n';
        html += '\u2514\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2518\n';
        if (!suppressTurn) {
            html += '<br>Turn: ' + cell(_gs.turn) + ' &mdash; type 1-9 or QUIT.';
        }
        return html;
    }

    function velhaHandler(input) {
        var cmd = input.trim();
        if (cmd === 'QUIT' || cmd === 'EXIT' || cmd === 'CANCEL') {
            _gameHandler = null;
            printPre('Game ended.');
            return;
        }
        var pos = parseInt(cmd, 10);
        if (isNaN(pos) || pos < 1 || pos > 9) {
            printPre('Type a number from 1 to 9.');
            return;
        }
        var idx = pos - 1;
        var b = _gs.board;
        if (b[idx] === 'X' || b[idx] === 'O') {
            printPre('Position already taken!');
            return;
        }
        b[idx] = _gs.turn;
        _gs._winLine = [];

        var wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        var won = false;
        var winningCombo = null;
        for (var i = 0; i < wins.length; i++) {
            if (b[wins[i][0]] === b[wins[i][1]] && b[wins[i][1]] === b[wins[i][2]]) { won = true; winningCombo = wins[i]; break; }
        }
        if (won) {
            _gameHandler = null;
            _gs._winLine = winningCombo;
            printHTML(drawVelhaBoard(true));
            printPre('Player ' + _gs.turn + ' wins!');
            return;
        }
        var tie = true;
        for (var i = 0; i < 9; i++) { if (b[i] !== 'X' && b[i] !== 'O') { tie = false; break; } }
        if (tie) {
            _gameHandler = null;
            printHTML(drawVelhaBoard(true));
            printPre('Draw!');
            return;
        }
        _gs.turn = (_gs.turn === 'X') ? 'O' : 'X';
        printHTML(drawVelhaBoard());
    }

    /* ---- Snake popup ---- */
    var _snakeInterval = null;

    function startSnake() {
        var overlay = document.createElement('div');
        overlay.id = 'snakeOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:99999;display:flex;align-items:center;justify-content:center;';
        var box = document.createElement('div');
        box.style.cssText = 'background:#ece9e0;border:2px solid;border-color:#fff #5a5a5a #5a5a5a #fff;padding:14px;font-family:monospace;text-align:center;box-shadow:4px 4px 8px rgba(0,0,0,0.3);';
        box.innerHTML = '<div style="font-weight:bold;font-size:15px;margin-bottom:6px;color:#000;font-family:Tahoma,sans-serif;">SNAKE &mdash; Score: <span id="snakeScore">0</span></div><pre id="snakeBoard" style="background:#111;color:#0f0;padding:8px;font-size:15px;line-height:1.15;margin:0;border:1px solid #555;"></pre><div style="margin-top:6px;font-size:11px;color:#666;font-family:Tahoma,sans-serif;">Arrow keys to move &middot; ESC to quit</div>';
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        var size = 14;
        var snake = [{x:7,y:7}];
        var dir = {x:1,y:0};
        var nextDir = {x:1,y:0};
        var food = {x:3,y:3};
        var score = 0;
        var highScore = parseInt(localStorage.getItem('snakeHigh') || '0', 10);
        var running = true;

        function placeFood() {
            var free = [];
            for (var y = 0; y < size; y++) {
                for (var x = 0; x < size; x++) {
                    var occupied = false;
                    for (var s = 0; s < snake.length; s++) {
                        if (snake[s].x === x && snake[s].y === y) { occupied = true; break; }
                    }
                    if (!occupied) free.push({x:x,y:y});
                }
            }
            if (free.length > 0) {
                var f = free[Math.floor(Math.random() * free.length)];
                food = f;
            }
        }

        function render() {
            var board = '';
            for (var y = 0; y < size; y++) {
                for (var x = 0; x < size; x++) {
                    var isSnake = false;
                    var isHead = x === snake[0].x && y === snake[0].y;
                    for (var s = 0; s < snake.length; s++) {
                        if (snake[s].x === x && snake[s].y === y) { isSnake = true; break; }
                    }
                    if (isHead) board += '<span style="color:#0f0;font-weight:bold">@</span>';
                    else if (isSnake) board += '<span style="color:#0a0">O</span>';
                    else if (x === food.x && y === food.y) board += '<span style="color:#f33;font-weight:bold">*</span>';
                    else board += '<span style="color:#222">.</span>';
                }
                board += '\n';
            }
            var el = document.getElementById('snakeBoard');
            var sc = document.getElementById('snakeScore');
            if (el) el.innerHTML = board;
            if (sc) sc.textContent = score;
        }

        function tick() {
            if (!running) return;
            dir = {x:nextDir.x, y:nextDir.y};
            var head = {x:snake[0].x + dir.x, y:snake[0].y + dir.y};
            if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size) {
                gameOver(); return;
            }
            for (var i = 0; i < snake.length; i++) {
                if (snake[i].x === head.x && snake[i].y === head.y) {
                    gameOver(); return;
                }
            }
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score++;
                placeFood();
            } else {
                snake.pop();
            }
            render();
        }

        function gameOver() {
            running = false;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHigh', score);
            }
            var el = document.getElementById('snakeBoard');
            var board = '  .  .  .  .  .  .  .  .\n' +
                '  .  .  .  .  .  .  .  .\n' +
                '   _   _   _   _   _\n' +
                '  / \\ / \\ / \\ / \\ / \\\n' +
                ' ( G A M E   O V E R )\n' +
                '  \\_/ \\_/ \\_/ \\_/ \\_/\n' +
                '  .  .  .  .  .  .  .  .\n\n' +
                '  Score: ' + score + '\n' +
                '  High: ' + highScore + '\n\n  Press ESC to close';
            if (el) el.innerHTML = board;
        }

        function keyHandler(e) {
            if (e.key === 'Escape') {
                cleanup();
                return;
            }
            if (!running) return;
            switch (e.key) {
                case 'ArrowUp': if (dir.y !== 1) { nextDir = {x:0,y:-1}; } e.preventDefault(); break;
                case 'ArrowDown': if (dir.y !== -1) { nextDir = {x:0,y:1}; } e.preventDefault(); break;
                case 'ArrowLeft': if (dir.x !== 1) { nextDir = {x:-1,y:0}; } e.preventDefault(); break;
                case 'ArrowRight': if (dir.x !== -1) { nextDir = {x:1,y:0}; } e.preventDefault(); break;
            }
        }

        function cleanup() {
            if (_snakeInterval) { clearInterval(_snakeInterval); _snakeInterval = null; }
            document.removeEventListener('keydown', keyHandler);
            var ov = document.getElementById('snakeOverlay');
            if (ov) ov.remove();
        }

        document.addEventListener('keydown', keyHandler);
        placeFood();
        render();
        _snakeInterval = setInterval(function() { tick(); }, Math.max(60, 180 - score * 4));
        // speed-up each point
        var speedCheck = setInterval(function() {
            if (!running && _snakeInterval) { clearInterval(speedCheck); return; }
            if (_snakeInterval) {
                clearInterval(_snakeInterval);
                _snakeInterval = setInterval(function() { tick(); }, Math.max(60, 180 - score * 4));
            }
        }, 500);

        return 'Snake game opened in popup. Press ESC to close.';
    }

    /* ---- Reaction time test ---- */
    var _reactionRound = 0;
    var _reactionTimes = [];

    function startReaction() {
        _reactionRound = 0;
        _reactionTimes = [];
        nextReactionRound();
        return '';
    }

    function nextReactionRound() {
        _reactionRound++;
        _gs = { phase: 'wait', ready: false, round: _reactionRound };
        _gameHandler = reactionHandler;
        var delay = 1500 + Math.random() * 3000;
        if (_reactionRound === 1) {
            printPre('\n=== REACTION TIME TEST ===');
            printPre('Press ENTER when you see GO!');
            printPre('3 rounds &middot; ESC or QUIT to exit\n');
        }
        printPre('Round ' + _reactionRound + '/3 &mdash; Get ready...');
        _gs.timer = setTimeout(function() {
            if (_gameHandler !== reactionHandler) return;
            _gs.ready = true;
            printHTML('<span style="color:#0f0;font-weight:bold;font-size:16px">=== GO! ===</span>');
            _gs.startTime = Date.now();
        }, delay);
    }

    function reactionHandler(input) {
        var cmd = input.trim().toUpperCase();
        if (cmd === 'QUIT' || cmd === 'EXIT' || cmd === 'CANCEL') {
            _gameHandler = null;
            clearTimeout(_gs.timer);
            printPre('Game ended.');
            return;
        }
        if (_gs.phase === 'wait') {
            if (_gs.ready) {
                var ms = Date.now() - _gs.startTime;
                _reactionTimes.push(ms);
                clearTimeout(_gs.timer);

                var color = ms < 200 ? '#0c0' : ms < 300 ? '#cc0' : '#c33';
                var label = ms < 150 ? 'Superhuman!' : ms < 200 ? 'Excellent!' : ms < 250 ? 'Great!' : ms < 300 ? 'Good!' : ms < 400 ? 'Average.' : 'Slow...';
                printHTML('<span style="color:' + color + ';font-weight:bold">' + ms + ' ms</span> &mdash; ' + label);

                if (_reactionRound >= 3) {
                    _gameHandler = null;
                    var sum = 0;
                    for (var i = 0; i < _reactionTimes.length; i++) sum += _reactionTimes[i];
                    var avg = Math.round(sum / _reactionTimes.length);
                    var best = Math.min.apply(null, _reactionTimes);
                    printPre('\nResults (3 rounds):');
                    for (var i = 0; i < _reactionTimes.length; i++) {
                        printPre('  Round ' + (i+1) + ': ' + _reactionTimes[i] + ' ms');
                    }
                    printHTML('<br>Average: <span style="color:#0cf;font-weight:bold">' + avg + ' ms</span>');
                    printHTML('Best: <span style="color:#0c0;font-weight:bold">' + best + ' ms</span>');
                    return;
                }
                nextReactionRound();
            } else {
                _gameHandler = null;
                clearTimeout(_gs.timer);
                printHTML('<span style="color:#c33">Too early! Wait for GO! Type REACTION to try again.</span>');
            }
        }
    }

    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            processCommand(termInput.value);
            termInput.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                termInput.value = cmdHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < cmdHistory.length - 1) {
                historyIndex++;
                termInput.value = cmdHistory[historyIndex];
            } else {
                historyIndex = cmdHistory.length;
                termInput.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            termInput.value += '  ';
        }
    });

    termInput.addEventListener('click', function() {
        termInput.focus();
    });

    var termBehavior = new WindowBehavior(termWin, {
        dragHandle: termDragHandle,
        btnClose: termBtnClose,
        btnMinimize: termBtnMinimize,
        btnMaximize: termBtnMaximize,
        minW: 500,
        minH: 300,
        taskbarIcon: '<svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;"><rect x="1" y="1" width="14" height="11" fill="#1a1a2e" stroke="#555" stroke-width="1.5"/><rect x="1" y="1" width="14" height="2.5" fill="#888"/><text x="8" y="10" text-anchor="middle" fill="#0f0" font-size="5" font-weight="bold">C:\\&gt;</text></svg>',
        taskbarLabel: 'Terminal',
        onShow: function() {
            termWin.style.width = '580px';
            termWin.style.height = '380px';
            termInput.focus();
            if (terminalFirstOpen) {
                terminalFirstOpen = false;
                termOutput.innerHTML = '';
                var bootText = 'Microsoft Windows 2000 [Version 5.00.2195]\n' +
                    '(C) Copyright 1985-2000 Microsoft Corp.\n\n' +
                    commands.help();
                var lines = bootText.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    var div = document.createElement('div');
                    div.className = 'term-line';
                    div.textContent = lines[i];
                    termOutput.appendChild(div);
                }
                termOutput.scrollTop = termOutput.scrollHeight;
            }
        },
    });

    window.termMinimizeWindow = function() { termBehavior.minimize(); };
    window.termShowWindow = termBehavior.show;
    window.termHasEntry = function() { return termBehavior.hasTaskbarEntry(); };
    window.showTerminal = function() { termBehavior.show(); };

    if (window.registerWindow) {
      registerWindow({
        minimize: function() { termBehavior.minimize(); },
        show: function() { termBehavior.show(); },
        hasEntry: function() { return termBehavior.hasTaskbarEntry(); },
      });
    }
})();
