(function () {
  "use strict";

  // Mapeamento dos elementos do DOM
  var termWin = document.getElementById("termWindow");
  var termBody = document.getElementById("termBody");
  var termDragHandle = document.getElementById("termDragHandle");
  var termOutput = document.getElementById("termOutput");
  var termInput = document.getElementById("termInput");
  var termBtnClose = document.getElementById("termBtnClose");
  var termBtnMinimize = document.getElementById("termBtnMinimize");
  var termBtnMaximize = document.getElementById("termBtnMaximize");

  // Estado do Terminal
  var currentDir = "C:\\";
  var cmdHistory = [];
  var historyIndex = -1;
  var terminalFirstOpen = true;
  var _pageLoad = Date.now();

  function getHostname() {
    return window.location.hostname || "localhost";
  }

  // Detecta se o script está rodando incorretamente via arquivo local
  function checkProtocol() {
    if (window.location.protocol === "file:") {
      printPre("  [AVISO] Voce abriu o HTML direto do PC (file://).");
      printPre(
        "          Requisicoes de API podem ser bloqueadas pelo navegador.",
      );
      printPre(
        "          Recomenda-se usar um servidor local (ex: Live Server).",
      );
    }
  }

  function getUptime() {
    var elapsed = Math.floor((Date.now() - _pageLoad) / 1000);
    var h = Math.floor(elapsed / 3600);
    var m = Math.floor((elapsed % 3600) / 60);
    var s = elapsed % 60;
    return h + "h " + m + "m " + s + "s";
  }

  function getOS() {
    var ua = navigator.userAgent || "";
    if (ua.indexOf("Windows NT 10") !== -1) return "Windows 10";
    if (ua.indexOf("Windows NT 6.3") !== -1) return "Windows 8.1";
    if (ua.indexOf("Windows NT 6.2") !== -1) return "Windows 8";
    if (ua.indexOf("Windows NT 6.1") !== -1) return "Windows 7";
    if (ua.indexOf("Windows NT 6.0") !== -1) return "Windows Vista";
    if (ua.indexOf("Windows NT 5.1") !== -1) return "Windows XP";
    if (ua.indexOf("Windows NT 5.0") !== -1) return "Windows 2000";
    if (ua.indexOf("Mac") !== -1) return "macOS";
    if (ua.indexOf("Linux") !== -1) return "Linux";
    if (ua.indexOf("Android") !== -1) return "Android";
    if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) return "iOS";
    return "Desconhecido";
  }

  // Lista de comandos suportados
  var commands = {
    help: function () {
      return (
        "Comandos disponiveis:\n" +
        "  help       Mostra esta ajuda\n" +
        "  clear      Limpar a tela\n" +
        "  data       Informacoes do sistema\n" +
        "  uptime     Tempo de atividade"
      );
    },
    clear: function () {
      if (termOutput) termOutput.innerHTML = "";
      return "";
    },
    uptime: function () {
      return "Tempo de atividade: " + getUptime();
    },
    data: function () {
      const now = new Date();
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
      const months = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];

      const tz =
        Intl.DateTimeFormat().resolvedOptions()?.timeZone || "desconhecido";
      const conn = navigator.connection?.effectiveType || "desconhecida";
      const mem = navigator.deviceMemory
        ? `${navigator.deviceMemory}GB`
        : "desconhecida";
      const cpu = navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} nucleos`
        : "desconhecida";
      const uaClean = navigator.userAgent
        ? navigator.userAgent.replace(/[\/][^\s]*/g, "").substring(0, 60)
        : "desconhecido";

      const info = `\nInformacoes do Sistema

  Data: ${days[now.getDay()]} ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}
  Hora: ${now.toLocaleTimeString()}
  Fuso: ${tz}
  SO: ${getOS()}
  Arquitetura: ${navigator.platform || "desconhecida"}
  Navegador: ${uaClean}
  Idioma: ${navigator.language || ""}
  Resolucao: ${screen.width}x${screen.height}
  Resolucao Disponivel: ${screen.availWidth}x${screen.availHeight}
  Profundidade de Cor: ${screen.colorDepth}-bit
  Sessao: ${getUptime()}
  CPU: ${cpu}
  RAM: ${mem}
  Conexao: ${conn}`;

      printPre(info);
      checkProtocol(); // Avisa no terminal se estiver usando file://
      printPre("  Buscando dados externos (ipapi.co)...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      // Nova API altamente compatível e resiliente
      fetch("https://ipapi.co/json/", { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("HTTP Status " + response.status);
          return response.json();
        })
        .then((d) => {
          clearTimeout(timeoutId);
          if (d && !d.error) {
            printPre(`  IP Externo: ${d.ip || "Desconhecido"}
  Localizacao: ${d.city || "?"}, ${d.region || "?"}, ${d.country_name || "?"}
  ISP: ${d.org || "Desconhecido"}
  Fuso: ${d.timezone || "Desconhecido"}`);
          } else {
            printPre(
              `  IP Externo: indisponivel (${d.reason || "erro na API"})`,
            );
          }
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          if (err.name === "AbortError") {
            printPre("  IP Externo: tempo limite excedido (8s)");
          } else {
            // DIAGNÓSTICO: Mostra o erro real gerado pelo navegador na tela
            printPre("  IP Externo: Erro detectado -> " + err.toString());
          }
        });

      return "";
    },
  };

  // Funções de Renderização na Tela
  function printLine(text) {
    if (!termOutput) return;
    var div = document.createElement("div");
    div.className = "term-line";
    div.textContent = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function printPre(text) {
    if (!text) return;
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      printLine(lines[i]);
    }
  }

  function printHTML(html) {
    if (!termOutput) return;
    var div = document.createElement("div");
    div.className = "term-line";
    div.innerHTML = html;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  // Interpretador de comandos executados
  function processCommand(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;

    cmdHistory.push(cmd);
    historyIndex = cmdHistory.length;

    var parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [cmd];
    var command = parts[0].toLowerCase();
    var args = parts.slice(1).join(" ").replace(/"/g, "");

    printLine(currentDir + ">" + cmd);

    if (command === "exit" || command === "quit") {
      if (typeof termBehavior !== "undefined" && termBehavior.hide) {
        termBehavior.hide();
      }
      return;
    }

    var handler = commands[command];
    if (handler) {
      var result = handler(args);
      if (result) printPre(result);
    } else {
      printLine(
        '"' +
          command +
          '" nao e reconhecido como um comando interno\nexterno, programa ou arquivo batch.',
      );
    }
  }

  // Ouvintes de Eventos de Teclado e Foco
  if (termInput) {
    termInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        processCommand(termInput.value);
        termInput.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = cmdHistory[historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          termInput.value = cmdHistory[historyIndex];
        } else {
          historyIndex = cmdHistory.length;
          termInput.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        termInput.value += "  ";
      }
    });

    termInput.addEventListener("click", function () {
      termInput.focus();
    });
  }

  function termReset() {
    if (termOutput) termOutput.innerHTML = "";
    if (termInput) termInput.value = "";
    currentDir = "C:\\";
    cmdHistory = [];
    historyIndex = -1;
    terminalFirstOpen = true;
  }

  // Instanciação e controle da janela do terminal
  if (typeof WindowBehavior !== "undefined") {
    var termBehavior = new WindowBehavior(termWin, {
      dragHandle: termDragHandle,
      btnClose: termBtnClose,
      btnMinimize: termBtnMinimize,
      btnMaximize: termBtnMaximize,
      minW: 500,
      minH: 300,
      taskbarIcon:
        '<img src="assets/system/icons/tango2kde/16x16/apps/terminal.png" alt="" width="14" height="14" style="flex-shrink:0;">',
      taskbarLabel: "Terminal",
      onShow: function () {
        if (termWin) {
          termWin.style.width = "580px";
          termWin.style.height = "380px";
        }
        if (termInput) termInput.focus();
        if (terminalFirstOpen) {
          terminalFirstOpen = false;
          var bootText =
            "No Microsoft Windows 2000 [Version 5.00.2195]\n" +
            "(C) Copyright 1985-2000 No Microsoft Corp.\n\n" +
            commands.help();
          var lines = bootText.split("\n");
          for (var i = 0; i < lines.length; i++) {
            if (termOutput) {
              var div = document.createElement("div");
              div.className = "term-line";
              div.textContent = lines[i];
              termOutput.appendChild(div);
            }
          }
          if (termOutput) termOutput.scrollTop = termOutput.scrollHeight;
        }
      },
      onHide: function () {
        termReset();
      },
    });

    window.termMinimizeWindow = function () {
      termBehavior.minimize();
    };
    window.termShowWindow = termBehavior.show;
    window.termHasEntry = function () {
      return termBehavior.hasTaskbarEntry();
    };
    window.showTerminal = function () {
      termBehavior.show();
    };
  }

  // Registro no sistema operacional simulado W2K
  if (
    typeof W2K !== "undefined" &&
    W2K &&
    W2K.AppRegistry &&
    typeof termBehavior !== "undefined"
  ) {
    W2K.AppRegistry.register("terminal", {
      label: "Terminal",
      show: function () {
        termBehavior.show();
      },
      minimize: function () {
        termBehavior.minimize();
      },
      hasEntry: function () {
        return termBehavior.hasTaskbarEntry();
      },
    });
  }
})();
