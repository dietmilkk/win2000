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
    var commandsListed = false;
    var terminalFirstOpen = true;

    var commands = {
        help: function() {
            return 'Comandos disponíveis:\n' +
                '  cls        Limpa a tela\n' +
                '  time       Mostra a hora atual\n' +
                '  dir        Lista arquivos no diretório atual\n' +
                '  echo       Repete texto\n' +
                '  fortune    Mensagem aleatória\n' +
                '  cowsay     Vaca diz algo\n' +
                '  matrix     Entrar na Matrix\n' +
                '  8ball      Bola Mágica 8\n' +
                '  joke       Piada aleatória\n' +
                '  ascii      Mostra arte ASCII aleatória\n' +
                '  hack       Invadir o planeta\n' +
                '  rm -rf     Deletar tudo\n' +
                '  doom       Fim do mundo\n' +
                '  gif        Visualizador de GIF aleatório\n' +
                '  help       Mostra esta ajuda';
        },
        cls: function() {
            termOutput.innerHTML = '';
            return '';
        },
        date: function() {
            var d = new Date();
            var days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
            var months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
            return 'A data atual é: ' + days[d.getDay()] + ' ' + months[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear();
        },
        time: function() {
            var d = new Date();
            return 'A hora atual é: ' + d.toLocaleTimeString();
        },
        ver: function() {
            return '\nMicrosoft Windows 2000 [Version 5.00.2195]\n' +
                '(C) Copyright 1985-2000 Microsoft Corp.\n' +
                '\n' +
                'Este é um emulador de terminal retrô.\n' +
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
            return '\n Volume na unidade C não tem etiqueta.\n' +
                ' Número de Série do Volume é A8B3-C2D1\n\n' +
                ' Diretório de ' + currentDir + '\n\n' +
                files.join('\n') + '\n\n' +
                '              6 arquivo(s)          9,148 bytes\n' +
                '              3 diretório(s)     4,096.00 MB livres';
        },
        echo: function(args) {
            return args || 'ECHO está ativado.';
        },
        color: function(args) {
            if (!args) {
                return 'Define as cores padrão do console.\n\n' +
                    'COLOR [attr]\n\n  attr - Specifies color attribute of console output\n\n' +
                    'Atributos de cor:\n  0=Preto 1=Azul 2=Verde 3=Aqua 4=Vermelho\n  5=Roxo 6=Amarelo 7=Branco 8=Cinza\n 9=Azul Claro A=Verde Claro B=Aqua Claro\n C=Vermelho Claro D=Roxo Claro E=Amarelo Claro F=Branco Brilhante\n\nExemplo: color 0a (fundo preto, texto verde claro)';
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
            return 'Atributo de cor inválido: ' + args;
        },
        type: function(args) {
            if (!args) return 'A sintaxe do comando está incorreta.';
            var files = {
                'readme.txt': 'Bem-vindo ao Portifolio!\n\nEste é um site portfólio com tema Windows 2000.\n\nFique à vontade para explorar o sistema.\nDigite HELP para comandos disponíveis.\n\nObrigado pela visita!',
                'portfolio.html': '<html>\n<body>\n<h1>Portifolio</h1>\n<p>Welcome!</p>\n</body>\n</html>',
                'style.css': '/* Windows 2000 Classic Theme */\nbody {\n    font-family: "MS Sans Serif";\n    background: #327e32;\n}',
                'main.js': '// Portifolio main application\n// Version 5.00.2195'
            };
            var fn = args.toLowerCase().replace(/^c:\\/i, '');
            if (files[fn]) return files[fn];
            return 'O sistema não pode encontrar o arquivo especificado.';
        },
        tree: function() {
            return 'Listagem do CAMINHO da pasta para volume C:\\\n' +
                'C:\\\n' +
                '+---Documents\n|   +---Work\n|   +---Personal\n|   +---Downloads\n+---Projects\n|   +---Portifolio\n|   |   +---css\n|   |   +---js\n|   |   +---assets\n|   |       +---icons\n|   +---Experiments\n+---WINDOWS\n|   +---system32\n|   +---system\n|   +---Fonts\n+---Program Files\n    +---Internet Explorer\n    +---Accessories';
        },
        ipconfig: function() {
            return '\nConfiguração IP do Windows 2000\n\n' +
                '        Nome do Host . . . . . . . : ENDRYO-PC\n' +
                '        Sufixo DNS Primário  . . : \n' +
                '        Tipo de Nó . . . . . . . : Hybrid\n' +
                '        Roteamento IP Habilitado. . . : No\n' +
                '        Proxy WINS Habilitado. . . : No\n\n' +
                'Adaptador Ethernet Conexão Local:\n\n' +
                '        Sufixo DNS específico da conexão  . : \n' +
                '        Descrição . . . . . . . : AMD PCNET Family PCI Ethernet Adapter\n' +
                '        Endereço Físico. . . . . : 00-1A-2B-3C-4D-5E\n' +
                '        DHCP Habilitado. . . . . . . : Yes\n' +
                '        Endereço IP. . . . . . . . : 175.45.176.1\n' +
                '        Máscara de Sub-rede . . . . . . . : 255.255.255.0\n' +
                '        Gateway Padrão . . . . . : 192.168.1.1\n' +
                '        Servidores DNS . . . . . . . : 8.8.8.8\n' +
                '                                         8.8.4.4';
        },
        ping: function(args) {
            var target = args || 'localhost';
            var results = [];
            results.push('\nRespondendo de ' + target + ' [127.0.0.1] com 32 bytes de dados:');
            var times = [14, 22, 9, 18];
            for (var i = 0; i < 4; i++) {
                results.push('Resposta de 127.0.0.1: bytes=32 time=' + times[i] + 'ms TTL=128');
            }
            results.push('\nEstatísticas do ping para 127.0.0.1:');
            results.push('    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% perda),');
            results.push('Tempos aproximados de ida e volta em milissegundos:');
            results.push('    Mínimo = 9ms, Máximo = 22ms, Média = 15ms');
            return results.join('\n');
        },
        net: function(args) {
            if (!args) return 'A sintaxe deste comando é:\n\nNET [ HELP | START | STOP | USE | VIEW | SEND ]\n\nDigite NET HELP para mais informações.';
            if (args.toLowerCase() === 'send') {
                return 'Mensagem enviada com sucesso para ENDRYO-PC.';
            }
            if (args.toLowerCase() === 'view') {
                return '\nNome do Servidor    Observação\n\n' +
                    '-------------------------------------------------------------------------------\n' +
                    '\\\\ENDRYO-PC       Portifolio Workstation\n' +
                    '\\\\FILESERVER      Servidor de Arquivos (esta rede)\n' +
                    'O comando concluído com sucesso.';
            }
            if (args.toLowerCase() === 'start') {
                return 'Os seguintes serviços estão iniciando:\n  Workstation\n  Server\n  TCP/IP NetBIOS Helper\n\nOs serviços iniciaram com sucesso.';
            }
            return 'O comando concluído com sucesso.';
        },
        msg: function(args) {
            if (!args) return 'Uso: MSG {usuário | *} mensagem\n\nExemplo: MSG * Olá!';
            xpDialog({ title: 'Message', icon: 'i', message: args });
            return 'Mensagem enviada com sucesso.';
        },
        calc: function() {
            xpDialog({ title: 'Calculadora', icon: 'C', message: 'Calculadora\n\nCalculadora do Windows 2000\n\n0 + 0 = 0\n\n(Isto é uma demonstração. Use uma calculadora de verdade.)' });
            return 'Iniciando Calculadora...';
        },
        notepad: function() {
            xpDialog({ title: 'Bloco de Notas', icon: 'N', message: 'Bloco de Notas\n\nSem título - Bloco de Notas\n\nIsto é um Bloco de Notas de demonstração.\n\nDigite suas anotações em um editor de texto real.' });
            return 'Iniciando Bloco de Notas...';
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
                'Um lindo dia pela frente!',
                'A resposta é 42.',
                'Você terá uma ótima ideia hoje.',
                'Boas notícias virão até você.',
                'Hoje é seu dia de sorte.',
                'Um sábio disse: "Digite HELP"',
                'Olhe atrás de você. (Brincadeira)',
                'O comando é forte com este.',
                '404: Fortuna não encontrada.',
                'Seu código vai compilar de primeira.',
                'Erro de sintaxe na linha 1: Foda demais.',
                'Um bug foi encontrado: era uma funcionalidade.',
                'O sistema está rodando perfeitamente.',
                'Você está em um labirinto de pequenas passagens tortuosas, todas iguais.',
                'Elvis saiu do prédio.',
                'Penso, logo existo... confuso.',
                'Ser ou não ser? Eis a questão.',
                '42 é o sentido da vida, do universo, e de tudo.'
            ];
            return '\n' + fortunes[Math.floor(Math.random() * fortunes.length)] + '\n';
        },
        cowsay: function(args) {
            var msg = args || 'Muu!';
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
            document.body.innerHTML = '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:24px;">Agora é seguro desligar o computador.</div>';
            return '';
        },
        easter: function() {
            return '\nVocê encontrou um easter egg! \ud83e\udd5a\n\n' +
                'Sabia que?\n' +
                'Windows 2000 foi originalmente chamado de "Windows NT 5.0".\n' +
                'O nome foi mudado para Windows 2000 em Outubro de 1998.\n' +
                'Foi lançado em 17 de Fevereiro de 2000.\n' +
                'Windows 2000 tinha 4 edições: Professional, Server, Advanced Server, Datacenter Server.';
        },
        matrix: function() {
            var chars = '\u30a2\u30a4\u30a6\u30a8\u30aa\u30ab\u30ad\u30af\u30b1\u30b3\u30b5\u30b7\u30b9\u30bb\u30bd\u30bf\u30c1\u30c4\u30c6\u30c8\u30ca\u30cb\u30cc\u30cd\u30ce\u30cf\u30d2\u30d5\u30d8\u30db\u30de\u30df\u30e0\u30e1\u30e2\u30e4\u30e6\u30e8\u30e9\u30ea\u30eb\u30ec\u30ed\u30ef\u30f2\u30f3';
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
                'Sim!',
                'De jeito nenhum!',
                'Com certeza!',
                'Pergunte novamente mais tarde...',
                'Minhas fontes dizem não.',
                'Absolutamente!',
                'Não tenho certeza...',
                'Sem dúvida!',
                'Muito duvidoso.',
                'Perspectiva boa!',
                'Não conte com isso.',
                'Pode confiar!',
                'Resposta vaga, tente novamente.',
                'Os sinais dizem não!',
                'Sim - definitivamente!',
                'É certo!',
                'Minha resposta é não.',
                'Do meu ponto de vista, sim.'
            ];
            return '\n \u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0 \n  \u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0 \n   \u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0\u25a0 \n    ( 8 ) ball diz:\n\n    "' + answers[Math.floor(Math.random() * answers.length)] + '"';
        },
        joke: function() {
            var jokes = [
                'Por que programadores preferem modo escuro? Porque luz atrai bugs.',
                'Como se chama um macarrão falso? Um impasta!',
                'Por que o desenvolvedor faliu? Porque gastou todo o cache!',
                'Como se chama um pônei com tosse? Um cavalinho!',
                'Por que o computador foi ao médico? Porque pegou um vírus!',
                'HTML é como inglês - todo mundo reclama mas todo mundo usa.',
                'Só existem 10 tipos de pessoas no mundo: as que entendem binário e as que não entendem.',
                'Por que desenvolvedores Java usam óculos? Porque não enxergam C#!',
                'Uma query SQL entra num bar, vai até duas mesas e pergunta... "Posso me juntar a vocês?"',
                'Por que o desenvolvedor morreu no banho? Porque as instruções diziam "ensaboar, enxaguar, repetir"!'
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
            return '\nInicializando sequência de hack...\n' +
                '> Conectando ao mainframe... OK\n' +
                '> Contornando firewall... OK\n' +
                '> Injetando payload SQL... OK\n' +
                '> Acesso root obtido!\n\n' +
                'Parabéns! Você agora é um Hacker Nível 99!\n' +
                '(Isso foi uma piada. Vá lá fora.)';
        },
        'rm -rf': function() {
            var dirs = ['/bin', '/usr', '/home', '/etc', '/root', '/var', '/tmp', '/sys', '/proc'];
            var result = 'Removendo arquivos...\n';
            for (var i = 0; i < 10; i++) {
                result += 'rm: removendo ' + dirs[Math.floor(Math.random() * dirs.length)] + '\n';
            }
            result += '\nOh não! Erro crítico do sistema!\nTudo foi deletado!';
            document.body.innerHTML = '<div style="background:#000;color:#0f0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:20px;text-align:center;padding:20px;">' + result.replace(/\n/g, '<br>') + '<br><br><button onclick="location.reload()" style="background:#0f0;color:#000;padding:10px 20px;border:none;cursor:pointer;">Reiniciar Sistema</button></div>';
            return '';
        },
        doom: function() {
            document.body.innerHTML = '<img src="assets/end.gif" style="position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:999999;">';
            return '';
        },
        gif: function() {
            var output = '';
            if (typeof window.loadGifList !== 'function') return 'Visualizador de GIF não disponível.\n';
            window.loadGifList(function(gifs) {
                if (!gifs.length) return;
                var currentIndex = Math.floor(Math.random() * gifs.length);
                var overlayId = 'gifOverlay' + Date.now();
                var overlay = document.createElement('div');
                overlay.id = overlayId;
                function showGif(index) {
                  overlay.innerHTML = '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999998;display:flex;align-items:center;justify-content:center;"><img src="assets/gifs/random/' + encodeURIComponent(gifs[index]) + '" style="height:100vh;width:auto;max-width:100vw;"></div><div style="position:fixed;bottom:20px;left:20px;color:#fff;font-family:monospace;font-size:14px;background:rgba(0,0,0,0.7);padding:8px 12px;z-index:999999;">ESPAÇO para sair | \u2190 \u2192 para navegar (' + (index+1) + '/' + gifs.length + ')</div>';
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
                printLine('Diretório alterado.');
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
            printLine('"' + command + '" não é reconhecido como um comando interno ou externo,\num programa operável ou arquivo em lote.');
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
        minW: 350,
        minH: 250,
        taskbarIcon: '<svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;"><rect x="1" y="3" width="14" height="10" fill="#111" stroke="#333" stroke-width="2"/><rect x="1" y="3" width="14" height="3" fill="#666"/><rect x="3" y="6" width="10" height="6" fill="#080a08"/><text x="8" y="9" text-anchor="middle" fill="#22aa55" font-size="3" font-weight="bold">C:\\&gt;</text></svg>',
        taskbarLabel: 'Terminal',
        onShow: function() {
            termWin.style.left = '80px';
            termWin.style.top = '60px';
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
})();
