(function () {
  "use strict";

  var termWin = document.getElementById("termWindow");
  var termBody = document.getElementById("termBody");
  var termDragHandle = document.getElementById("termDragHandle");
  var termOutput = document.getElementById("termOutput");
  var termInput = document.getElementById("termInput");
  var termBtnClose = document.getElementById("termBtnClose");
  var termBtnMinimize = document.getElementById("termBtnMinimize");
  var termBtnMaximize = document.getElementById("termBtnMaximize");

  var currentDir = "C:\\";
  var cmdHistory = [];
  var historyIndex = -1;
  var terminalFirstOpen = true;
  var _pageLoad = Date.now();
  function getHostname() {
    return window.location.hostname || "localhost";
  }

  function getUptime() {
    var elapsed = Math.floor((Date.now() - _pageLoad) / 1000);
    var h = Math.floor(elapsed / 3600);
    var m = Math.floor((elapsed % 3600) / 60);
    var s = elapsed % 60;
    return h + "h " + m + "m " + s + "s";
  }

  function getOS() {
    var ua = navigator.userAgent;
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

  var commands = {
    help: function () {
      return (
        "Comandos disponiveis:\n" +
        "  clear      Limpar a tela\n" +
        "  data       Informacoes do sistema\n" +
        "  help       Mostra esta ajuda\n" +
        "  ipconfig   Configuracao de rede\n" +
        "  ping       Testar conexao\n" +
        "  uptime     Tempo de atividade"
      );
    },
    clear: function () {
      termOutput.innerHTML = "";
      return "";
    },
    ipconfig: function () {
      var host = getHostname().toUpperCase();
      var os = getOS();
      var conn = "";
      try { conn = navigator.connection ? navigator.connection.effectiveType : ""; } catch (e) {}
      var cpu = "";
      try { cpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + " core" : ""; } catch (e) {}
      var mem = "";
      try { mem = navigator.deviceMemory ? navigator.deviceMemory + "GB" : ""; } catch (e) {}

      var base =
        "\n" +
        "Windows 2000 IP Configuration\n\n" +
        "        Host Name . . . . . . . . . : " + host + "\n" +
        "        Primary DNS Suffix . . . . : \n" +
        "        Node Type . . . . . . . . . : Hybrid\n" +
        "        IP Routing Enabled. . . . . : Yes\n" +
        "        WINS Proxy Enabled. . . . . : No\n\n" +
        "Ethernet adapter Local Area Connection:\n\n" +
        "        Connection-specific DNS Suffix. : \n" +
        "        Description . . . . . . . . . . : " + os + " | " + (cpu || "desconhecido") + "\n" +
        "        Physical Address. . . . . . . . : Nao disponivel via navegador\n" +
        "        DHCP Enabled. . . . . . . . . . : Yes\n" +
        "        Autoconfiguration Enabled . . . : Yes\n";
      printPre(base);
      printPre("  Obtendo configuracao externa...");
      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://ip-api.com/json/?fields=status,country,regionName,city,isp,org,as,query,lat,lon,timezone",
      );
      xhr.timeout = 8000;
      xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText) {
          try {
            var d = JSON.parse(xhr.responseText);
            if (d.status === "success") {
              var ext =
                "\n" +
                "External (WAN) Configuration:\n\n" +
                "        IPv4 Address. . . . . . . . : " + d.query + "\n" +
                "        Country . . . . . . . . . . : " + d.country + "\n" +
                "        Region . . . . . . . . . . : " + d.regionName + "\n" +
                "        City . . . . . . . . . . . : " + d.city + "\n" +
                "        ISP . . . . . . . . . . . : " + d.isp + "\n" +
                "        Organization . . . . . . . : " + d.org + "\n" +
                "        AS . . . . . . . . . . . . : " + d.as + "\n" +
                "        Timezone . . . . . . . . . : " + d.timezone + "\n" +
                "        Coordinates . . . . . . . : " + d.lat + ", " + d.lon + "\n";
              printPre(ext);
            } else {
              printPre("\nExternal IP: unavailable (" + (d.message || "error") + ")");
            }
          } catch (e) {
            printPre("\nExternal IP: error processing response");
          }
        } else {
          printPre("\nExternal IP: query failed");
        }
      };
      xhr.onerror = function () {
        printPre("\nExternal IP: server unreachable");
      };
      xhr.ontimeout = function () {
        printPre("\nExternal IP: timeout exceeded");
      };
      xhr.send();
      return "";
    },
    ping: function (args) {
      var target = args || "localhost";
      var results = [];
      results.push("\nPingando " + target + " com 32 bytes de dados:");
      var times = [];
      for (var i = 0; i < 4; i++) {
        times.push(Math.floor(Math.random() * 40 + 5));
      }
      for (var i = 0; i < 4; i++) {
        results.push(
          "Resposta de " +
            target +
            ": bytes=32 tempo=" +
            times[i] +
            "ms TTL=128",
        );
      }
      var min = Math.min.apply(null, times);
      var max = Math.max.apply(null, times);
      var avg = Math.floor(
        times.reduce(function (a, b) {
          return a + b;
        }, 0) / times.length,
      );
      results.push("\nEstatisticas do ping para " + target + ":");
      results.push(
        "    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda),",
      );
      results.push("Tempo aproximado em milissegundos:");
      results.push(
        "    Minimo = " +
          min +
          "ms, Maximo = " +
          max +
          "ms, Medio = " +
          avg +
          "ms",
      );
      return results.join("\n");
    },
    uptime: function () {
      return "Tempo de atividade: " + getUptime();
    },
    data: function () {
      var now = new Date();
      var days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
      var months = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
        "Jul", "Ago", "Set", "Out", "Nov", "Dez",
      ];
      var tz = "";
      try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
      var conn = "";
      try { conn = navigator.connection ? navigator.connection.effectiveType : ""; } catch (e) {}
      var mem = "";
      try { mem = navigator.deviceMemory ? navigator.deviceMemory + "GB" : ""; } catch (e) {}
      var cpu = "";
      try { cpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency + " core" : ""; } catch (e) {}
      var info =
        "Informacoes do Sistema\n\n" +
        "  Data: " + days[now.getDay()] + ", " + now.getDate() + " de " + months[now.getMonth()] + " de " + now.getFullYear() + "\n" +
        "  Hora: " + now.toLocaleTimeString() + "\n" +
        "  Fuso: " + (tz || "desconhecido") + "\n" +
        "  Usuario: user\n" +
        "  SO: " + getOS() + "\n" +
        "  Arquitetura: " + (navigator.platform || "desconhecida") + "\n" +
        "  Navegador: " + navigator.userAgent.replace(/[\/][^\s]*/g, "").substring(0, 60) + "\n" +
        "  Idioma: " + (navigator.language || "") + "\n" +
        "  Resolucao: " + screen.width + "x" + screen.height + "\n" +
        "  Resolucao Disponivel: " + screen.availWidth + "x" + screen.availHeight + "\n" +
        "  Profundidade de Cor: " + screen.colorDepth + "-bit\n" +
        "  Sessao: " + getUptime() + "\n" +
        "  CPU: " + (cpu || "desconhecida") + "\n" +
        "  RAM: " + (mem || "desconhecida") + "\n" +
        "  Conexao: " + (conn || "desconhecida") + "\n";
      printPre(info);
      printPre("  Buscando dados externos...");
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "https://ip-api.com/json/?fields=status,country,regionName,city,isp,org,as,query,lat,lon,timezone");
      xhr.timeout = 8000;
      xhr.onload = function () {
        if (xhr.status === 200 && xhr.responseText) {
          try {
            var d = JSON.parse(xhr.responseText);
            if (d.status === "success") {
              printPre(
                "  IP Externo: " + d.query + "\n" +
                "  Localizacao: " + d.city + ", " + d.regionName + ", " + d.country + "\n" +
                "  ISP: " + d.isp + "\n" +
                "  Fuso: " + d.timezone
              );
            } else {
              printPre("  IP Externo: indisponivel (" + (d.message || "erro") + ")");
            }
          } catch (e) {
            printPre("  IP Externo: erro ao processar resposta");
          }
        } else {
          printPre("  IP Externo: falha na consulta");
        }
      };
      xhr.onerror = function () { printPre("  IP Externo: servidor inacessivel"); };
      xhr.ontimeout = function () { printPre("  IP Externo: tempo limite excedido"); };
      xhr.send();
      return "";
    },
  };

  function printLine(text) {
    var div = document.createElement("div");
    div.className = "term-line";
    div.textContent = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function printPre(text) {
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      printLine(lines[i]);
    }
  }

  function printHTML(html) {
    var div = document.createElement("div");
    div.className = "term-line";
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
    var args = parts.slice(1).join(" ").replace(/"/g, "");

    printLine(currentDir + ">" + cmd);

    if (command === "exit" || command === "quit") {
      termBehavior.hide();
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

  function termReset() {
    termOutput.innerHTML = "";
    termInput.value = "";
    currentDir = "C:\\";
    cmdHistory = [];
    historyIndex = -1;
    terminalFirstOpen = true;
  }

  var termBehavior = new WindowBehavior(termWin, {
    dragHandle: termDragHandle,
    btnClose: termBtnClose,
    btnMinimize: termBtnMinimize,
    btnMaximize: termBtnMaximize,
    minW: 500,
    minH: 300,
    taskbarIcon:
      '<img src="assets/icons/tango2kde/16x16/apps/terminal.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: "Terminal",
    onShow: function () {
      termWin.style.width = "580px";
      termWin.style.height = "380px";
      termInput.focus();
      if (terminalFirstOpen) {
        terminalFirstOpen = false;
        var bootText =
          "Microsoft Windows 2000 [Version 5.00.2195]\n" +
          "(C) Copyright 1985-2000 Microsoft Corp.\n\n" +
          commands.help();
        var lines = bootText.split("\n");
        for (var i = 0; i < lines.length; i++) {
          var div = document.createElement("div");
          div.className = "term-line";
          div.textContent = lines[i];
          termOutput.appendChild(div);
        }
        termOutput.scrollTop = termOutput.scrollHeight;
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

  if (window.registerWindow) {
    registerWindow({
      minimize: function () {
        termBehavior.minimize();
      },
      show: function () {
        termBehavior.show();
      },
      hasEntry: function () {
        return termBehavior.hasTaskbarEntry();
      },
    });
  }
})();
