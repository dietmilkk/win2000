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
    var termTaskbarEntry = null;

    function createTaskbarEntry() {
      if (termTaskbarEntry) return;
      var container = document.querySelector('.taskbar-items');
      if (!container) return;
      termTaskbarEntry = document.createElement('div');
      termTaskbarEntry.className = 'taskbar-item';
      termTaskbarEntry.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;"><rect x="1" y="3" width="14" height="10" fill="#111" stroke="#333" stroke-width="2"/><text x="8" y="11" text-anchor="middle" fill="#0f0" font-size="7" font-weight="bold">C:\\</text></svg> Terminal';
      container.appendChild(termTaskbarEntry);
      termTaskbarEntry.addEventListener('click', function() {
        if (document.body.classList.contains('mobile-mode')) {
          if (termWin.classList.contains('active')) {
            termWin.classList.remove('active');
            termTaskbarEntry.classList.remove('active');
          } else {
            document.querySelectorAll('.window').forEach(function(w) { w.classList.remove('active'); });
            document.querySelectorAll('.taskbar-item').forEach(function(t) { t.classList.remove('active'); });
            termWin.classList.add('active');
            termTaskbarEntry.classList.add('active');
            termBringToFront();
          }
          return;
        }
        if (termMinimized || termWin.style.display === 'none') {
          showTerminal();
        } else {
          minimizeTerminal();
        }
      });
    }

    function removeTaskbarEntry() {
      if (termTaskbarEntry) {
        termTaskbarEntry.remove();
        termTaskbarEntry = null;
      }
    }

    var currentDir = 'C:\\';
    var cmdHistory = [];
    var historyIndex = -1;
    var commandsListed = false;

    var commands = {
        help: function() {
            return 'Available commands:\n' +
                '  cls        Clear the screen\n' +
                '  time       Show current time\n' +
                '  dir        List files in current directory\n' +
                '  echo       Echo text\n' +
                '  fortune    Random fortune\n' +
                '  cowsay     Cow says something\n' +
                '  matrix     Enter the Matrix\n' +
                '  8ball      Magic 8-Ball\n' +
                '  joke       Random joke\n' +
                '  ascii      Show random ASCII art\n' +
                '  hack       Hack the planet\n' +
                '  rm -rf     Delete everything\n' +
                '  doom       End of the world\n' +
                '  gif        Random GIF viewer\n' +
                '  help       Show this help';
        },
        cls: function() {
            termOutput.innerHTML = '';
            return '';
        },
        date: function() {
            var d = new Date();
            var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return 'The current date is: ' + days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
        },
        time: function() {
            var d = new Date();
            return 'The current time is: ' + d.toLocaleTimeString();
        },
        ver: function() {
            return '\nMicrosoft Windows 2000 [Version 5.00.2195]\n' +
                '(C) Copyright 1985-2000 Microsoft Corp.\n' +
                '\n' +
                'This is a retro portfolio terminal emulator.\n' +
                'Windows 2000 build 2195 (Service Pack 4)';
        },
        dir: function() {
            var files = [
                '12/10/2000  09:15 AM    <DIR>          Documents',
                '12/15/2000  02:30 PM    <DIR>          Projects',
                '01/05/2001  11:00 AM             1,024 portfolio.html',
                '02/20/2001  04:45 PM             2,560 style.css',
                '03/10/2001  08:20 AM             1,536 main.js',
                '04/01/2001  10:00 AM    <DIR>          assets',
                '04/15/2001  03:30 PM               420 README.txt',
                '05/01/2001  12:00 PM             2,048 index.html'
            ];
            return '\n Volume in drive C has no label.\n' +
                ' Volume Serial Number is A8B3-C2D1\n\n' +
                ' Directory of ' + currentDir + '\n\n' +
                files.join('\n') + '\n\n' +
                '              6 File(s)          9,148 bytes\n' +
                '              3 Dir(s)     4,096.00 MB free';
        },
        echo: function(args) {
            return args || 'ECHO is on.';
        },
        color: function(args) {
            if (!args) {
                return 'Sets the default console foreground and background colors.\n\n' +
                    'COLOR [attr]\n\n  attr - Specifies color attribute of console output\n\n' +
                    'Color attributes:\n  0=Black 1=Blue 2=Green 3=Aqua 4=Red\n  5=Purple 6=Yellow 7=White 8=Gray\n 9=Light Blue A=Light Green B=Light Aqua\n C=Light Red D=Light Purple E=Light Yellow F=Bright White\n\nExample: color 0a (black background, light green text)';
            }
            var bg = parseInt(args[0], 16);
            var fg = parseInt(args[1], 16);
            var colors = ['#000','#00a','#0a0','#0aa','#a00','#a0a','#aa0','#aaa','#555','#55f','#5f5','#5ff','#f55','#f5f','#ff5','#fff'];
            if (!isNaN(bg) && !isNaN(fg) && bg >= 0 && bg < 16 && fg >= 0 && fg < 16) {
                termWin.style.background = colors[bg];
                termWin.style.color = colors[fg];
                termOutput.style.color = colors[fg];
                return '';
            }
            return 'Invalid color attribute: ' + args;
        },
        type: function(args) {
            if (!args) return 'The syntax of the command is incorrect.';
            var files = {
                'readme.txt': 'Welcome to Portifolio!\n\nThis is a Windows 2000-themed portfolio website.\n\nFeel free to explore the system.\nType HELP for available commands.\n\nThank you for visiting!',
                'portfolio.html': '<html>\n<body>\n<h1>Portifolio</h1>\n<p>Welcome!</p>\n</body>\n</html>',
                'style.css': '/* Windows 2000 Classic Theme */\nbody {\n    font-family: "MS Sans Serif";\n    background: #327e32;\n}',
                'main.js': '// Portifolio main application\n// Version 5.00.2195'
            };
            var fn = args.toLowerCase().replace(/^c:\\/i, '');
            if (files[fn]) return files[fn];
            return 'The system cannot find the file specified.';
        },
        tree: function() {
            return 'Folder PATH listing for volume C:\\\n' +
                'C:\\\n' +
                '+---Documents\n|   +---Work\n|   +---Personal\n|   +---Downloads\n+---Projects\n|   +---Portifolio\n|   |   +---css\n|   |   +---js\n|   |   +---assets\n|   |       +---icons\n|   +---Experiments\n+---WINDOWS\n|   +---system32\n|   +---system\n|   +---Fonts\n+---Program Files\n    +---Internet Explorer\n    +---Accessories';
        },
        ipconfig: function() {
            return '\nWindows 2000 IP Configuration\n\n' +
                '        Host Name . . . . . . . : ENDRYO-PC\n' +
                '        Primary Dns Suffix  . . : \n' +
                '        Node Type . . . . . . . : Hybrid\n' +
                '        IP Routing Enabled. . . : No\n' +
                '        WINS Proxy Enabled. . . : No\n\n' +
                'Ethernet adapter Local Area Connection:\n\n' +
                '        Connection-specific DNS Suffix  . : \n' +
                '        Description . . . . . . . : AMD PCNET Family PCI Ethernet Adapter\n' +
                '        Physical Address. . . . . : 00-1A-2B-3C-4D-5E\n' +
                '        DHCP Enabled. . . . . . . : Yes\n' +
                '        IP Address. . . . . . . . : 175.45.176.1\n' +
                '        Subnet Mask . . . . . . . : 255.255.255.0\n' +
                '        Default Gateway . . . . . : 192.168.1.1\n' +
                '        DNS Servers . . . . . . . : 8.8.8.8\n' +
                '                                         8.8.4.4';
        },
        ping: function(args) {
            var target = args || 'localhost';
            var results = [];
            results.push('\nPinging ' + target + ' [127.0.0.1] with 32 bytes of data:');
            var times = [14, 22, 9, 18];
            for (var i = 0; i < 4; i++) {
                results.push('Reply from 127.0.0.1: bytes=32 time=' + times[i] + 'ms TTL=128');
            }
            results.push('\nPing statistics for 127.0.0.1:');
            results.push('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),');
            results.push('Approximate round trip times in milli-seconds:');
            results.push('    Minimum = 9ms, Maximum = 22ms, Average = 15ms');
            return results.join('\n');
        },
        net: function(args) {
            if (!args) return 'The syntax of this command is:\n\nNET [ HELP | START | STOP | USE | VIEW | SEND ]\n\nType NET HELP for more information.';
            if (args.toLowerCase() === 'send') {
                return 'Message sent successfully to ENDRYO-PC.';
            }
            if (args.toLowerCase() === 'view') {
                return '\nServer Name       Remark\n\n' +
                    '-------------------------------------------------------------------------------\n' +
                    '\\\\ENDRYO-PC       Portifolio Workstation\n' +
                    '\\\\FILESERVER      File Server (this network)\n' +
                    'The command completed successfully.';
            }
            if (args.toLowerCase() === 'start') {
                return 'The following services are starting:\n  Workstation\n  Server\n  TCP/IP NetBIOS Helper\n\nThe services started successfully.';
            }
            return 'The command completed successfully.';
        },
        msg: function(args) {
            if (!args) return 'Usage: MSG {username | *} message\n\nExample: MSG * Hello there!';
            xpDialog({ title: 'Message', icon: 'i', message: args });
            return 'Message sent successfully.';
        },
        calc: function() {
            xpDialog({ title: 'Calculator', icon: 'C', message: 'Calculator\n\nWindows 2000 Calculator\n\n0 + 0 = 0\n\n(This is a demo. Use a real calculator.)' });
            return 'Starting Calculator...';
        },
        notepad: function() {
            xpDialog({ title: 'Notepad', icon: 'N', message: 'Notepad\n\nUntitled - Notepad\n\nThis is a demo Notepad.\n\nType your notes in a real text editor.' });
            return 'Starting Notepad...';
        },
        beep: function() {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = 800;
            var gain = ctx.createGain();
            gain.gain.value = 0.1;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
            return 'Beep!';
        },
        logo: function() {
            return '\n' +
                '                              WINDOWS 2000\n' +
                '                                  *****\n' +
                '                                *********\n' +
                '                               ***********\n' +
                '                              *************\n' +
                '                               ***********\n' +
                '                                *********\n' +
                '                                  *****\n' +
                '                                    *\n' +
                '\n' +
                '                    Microsoft Windows 2000 Professional\n' +
                '                            Build 2195 (Service Pack 4)\n' +
                '\n' +
                '               This product is licensed to:\n' +
                '                      User\n' +
                '                      Workstation\n' +
                '\n' +
                '               Copyright (C) 1985-2000 Microsoft Corp.\n';
        },
        fortune: function() {
            var fortunes = [
                'A beautiful day ahead!',
                'The answer is 42.',
                'You will have a great idea today.',
                'Good news will come to you.',
                'Today is your lucky day.',
                'A wise person once said: "Type HELP"',
                'Look behind you. (Just kidding)',
                'The command is strong with this one.',
                '404: Fortune not found.',
                'Your code will compile on the first try.',
                'Syntax error at line 1: Too awesome.',
                'A bug has been found: it was a feature.',
                'The system is running smoothly.',
                'You are in a maze of twisty little passages, all alike.',
                'Elvis has left the building.',
                'I think, therefore I am... confused.',
                'To be or not to be? That is the question.',
                '42 is the meaning of life, the universe, and everything.'
            ];
            return '\n' + fortunes[Math.floor(Math.random() * fortunes.length)] + '\n';
        },
        cowsay: function(args) {
            var msg = args || 'Moo!';
            var len = msg.length;
            var top = '_' + new Array(len + 3).join('_');
            var bottom = '-' + new Array(len + 3).join('-');
            return '\n ' + top + '\n< ' + msg + ' >\n ' + bottom + '\n' +
                '        \\   ^__^\n' +
                '         \\  (oo)\\_______\n' +
                '            (__)\\       )\\/\\\n' +
                '                ||----w |\n' +
                '                ||     ||';
        },
        shutdown: function() {
            document.body.innerHTML = '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:24px;">It is now safe to turn off your computer.</div>';
            return '';
        },
        easter: function() {
            return '\nYou found an easter egg! 🥚\n\n' +
                'Did you know?\n' +
                'Windows 2000 was originally called "Windows NT 5.0".\n' +
                'The name was changed to Windows 2000 in October 1998.\n' +
                'It was released on February 17, 2000.\n' +
                'Windows 2000 had 4 editions: Professional, Server, Advanced Server, Datacenter Server.';
        },
        matrix: function() {
            var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
            var result = '';
            for (var i = 0; i < 15; i++) {
                var line = '';
                for (var j = 0; j < 50; j++) {
                    line += chars[Math.floor(Math.random() * chars.length)] + ' ';
                }
                result += line + '\n';
            }
            return '\n' + result + '\nThe Matrix has you...';
        },
        '8ball': function() {
            var answers = [
                'Yes!',
                'No way!',
                'Definitely!',
                'Ask again later...',
                'My sources say no.',
                'Absolutely!',
                'I\'m not sure...',
                'Without a doubt!',
                'Very doubtful.',
                'Outlook good!',
                'Don\'t count on it.',
                'You may rely on it!',
                'Reply hazy, try again.',
                'Sign says no!',
                'Yes - definitely!',
                'It is certain!',
                'My reply is no.',
                'As I see it, yes.'
            ];
            return '\n ■■■■■■■■■■■ \n  ■■■■■■■■■■ \n   ■■■■■■■■ \n    ( 8 ) ball says:\n\n    "' + answers[Math.floor(Math.random() * answers.length)] + '"';
        },
        joke: function() {
            var jokes = [
                'Why do programmers prefer dark mode? Because light attracts bugs.',
                'What do you call a fake noodle? An impasta!',
                'Why did the developer go broke? Because he used up all his cache!',
                'What do you call a pony with a cough? A little horse!',
                'Why did the computer go to the doctor? It had a virus!',
                'HTML is like English - everyone complains about it but everyone uses it.',
                'There are only 10 types of people in the world: those who understand binary and those who don\'t.',
                'Why do Java developers wear glasses? Because they can\'t C#!',
                'A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?"',
                'Why did the developer die in the shower? Because the instructions said "lather, rinse, repeat"!'
            ];
            return '\n' + jokes[Math.floor(Math.random() * jokes.length)] + '\n';
        },
        ascii: function() {
            var arts = [
                '    /\\_/\\  \n   ( o.o ) \n    > ^ <\n   /|   |\\\n  (_|   |_)',
                '   ___\n  /___\\\n  |o o|\n  | > |<\n  |___|',
                '    \n   \\\\//\n  ((@v@))\n   (///)\n    \\\\//\n     ||\n    /||\\',
                '   .--.\n  |o_o |\n  |:_/ |\n //   \\ \\\n(|     | )\n/\\\\_   /_\\\n  \\___)',
                '   (_\n   ( )_\n    (_(_)\n     (_)'
            ];
            return '\n' + arts[Math.floor(Math.random() * arts.length)] + '\n';
        },
        hack: function() {
            return '\nInitializing hack sequence...\n' +
                '> Connecting to mainframe... OK\n' +
                '> Bypassing firewall... OK\n' +
                '> Injecting SQL payload... OK\n' +
                '> Root access obtained!\n\n' +
                'Congratulations! You are now a Level 99 Hacker!\n' +
                '(This was a joke. Go outside.)';
        },
        'rm -rf': function() {
            var dirs = ['/bin', '/usr', '/home', '/etc', '/root', '/var', '/tmp', '/sys', '/proc'];
            var result = 'Removing files...\n';
            for (var i = 0; i < 10; i++) {
                result += 'rm: removing ' + dirs[Math.floor(Math.random() * dirs.length)] + '\n';
            }
            result += '\nOh no! System critical error!\nEverything is gone!';
            document.body.innerHTML = '<div style="background:#000;color:#0f0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:20px;text-align:center;padding:20px;">' + result.replace(/\n/g, '<br>') + '<br><br><button onclick="location.reload()" style="background:#0f0;color:#000;padding:10px 20px;border:none;cursor:pointer;">Reboot System</button></div>';
            return '';
        },
        doom: function() {
            document.body.innerHTML = '<img src="assets/end.gif" style="position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:999999;">';
            return '';
        },
        gif: function() {
            var output = '';
            if (typeof window.loadGifList !== 'function') return 'GIF viewer not available.\n';
            window.loadGifList(function(gifs) {
                if (!gifs.length) return;
                var currentIndex = Math.floor(Math.random() * gifs.length);
                var overlayId = 'gifOverlay' + Date.now();
                var overlay = document.createElement('div');
                overlay.id = overlayId;
                function showGif(index) {
                  overlay.innerHTML = '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999998;display:flex;align-items:center;justify-content:center;"><img src="assets/gifs/random/' + encodeURIComponent(gifs[index]) + '" style="height:100vh;width:auto;max-width:100vw;"></div><div style="position:fixed;bottom:20px;left:20px;color:#fff;font-family:monospace;font-size:14px;background:rgba(0,0,0,0.7);padding:8px 12px;z-index:999999;">SPACE to exit | ← → to navigate (' + (index+1) + '/' + gifs.length + ')</div>';
                }
                showGif(currentIndex);
                overlay.setAttribute('tabindex', '0');
                overlay.style.outline = 'none';
                document.body.appendChild(overlay);
                overlay.focus();
                var closeGif = function() { overlay.remove(); document.removeEventListener('keydown', keyHandler); };
                var keyHandler = function(e) {
                  if (e.key === ' ') { e.preventDefault(); closeGif(); }
                  else if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % gifs.length; showGif(currentIndex); }
                  else if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + gifs.length) % gifs.length; showGif(currentIndex); }
                };
                document.addEventListener('keydown', keyHandler);
                overlay.addEventListener('click', closeGif);
            });
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
            hideTerminal();
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
                printLine('Changed directory.');
                currentDir = newDir;
            }
            return;
        }

        if (command === 'cd.') {
            currentDir = 'C:\\';
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

    var termMinimized = true;
    var termMaximized = false;
    var termPrevRect = null;

    var termControls = createWindowControls(termWin, {
        dragHandle: termDragHandle,
        btnMinimize: termBtnMinimize,
        btnMaximize: termBtnMaximize,
        minW: 350,
        minH: 250,
    });

    termBtnClose.addEventListener('click', function() {
        if (termControls.isMinimized()) return;
        termControls.hide();
        removeTaskbarEntry();
    });

    window.termMinimizeWindow = function() { termControls.minimize(); };
    window.termShowWindow = termControls.restore;

    function createTaskbarEntry() {
        if (termTaskbarEntry) return;
        var container = document.querySelector('.taskbar-items');
        if (!container) return;
        termTaskbarEntry = document.createElement('div');
        termTaskbarEntry.className = 'taskbar-item';
        termTaskbarEntry.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;"><rect x="1" y="3" width="14" height="10" fill="#111" stroke="#333" stroke-width="2"/><text x="8" y="11" text-anchor="middle" fill="#0f0" font-size="7" font-weight="bold">C:\\</text></svg> Terminal';
        container.appendChild(termTaskbarEntry);
        termControls.setTaskbarEntry(termTaskbarEntry);
        termTaskbarEntry.addEventListener('click', function() {
            if (document.body.classList.contains('mobile-mode')) {
                if (termWin.classList.contains('active')) {
                    termWin.classList.remove('active');
                    termTaskbarEntry.classList.remove('active');
                } else {
                    document.querySelectorAll('.window').forEach(function(w) { w.classList.remove('active'); });
                    document.querySelectorAll('.taskbar-item').forEach(function(t) { t.classList.remove('active'); });
                    termWin.classList.add('active');
                    termTaskbarEntry.classList.add('active');
                    termControls.bringToFront();
                }
                return;
            }
            if (termControls.isMinimized() || termWin.style.display === 'none') {
                showTerminal();
            } else {
                termControls.minimize();
            }
        });
    }

    function removeTaskbarEntry() {
        if (termTaskbarEntry) {
            termTaskbarEntry.remove();
            termTaskbarEntry = null;
        }
    }

    var terminalFirstOpen = true;
    function showTerminal() {
        createTaskbarEntry();
        if (termControls.isMinimized() || termWin.style.display === 'none') {
            termWin.style.display = '';
            termWin.style.left = '80px';
            termWin.style.top = '60px';
            termWin.style.width = '580px';
            termWin.style.height = '380px';
            if (termTaskbarEntry) termTaskbarEntry.classList.add('active');
            termControls.bringToFront();
            termInput.focus();
            termControls.setMinimized(false);
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
        } else {
            termWin.style.display = '';
            if (termTaskbarEntry) termTaskbarEntry.classList.add('active');
            termControls.bringToFront();
            termInput.focus();
        }
    }

    window.showTerminal = showTerminal;
    window.termHasEntry = function() { return termTaskbarEntry !== null; };
    termWin.style.display = 'none';
    termControls.setMinimized(true);
})();
