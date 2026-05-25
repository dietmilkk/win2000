(function () {
  "use strict";

  /* ================================================================
       WINDOW SETUP
       ================================================================ */

  var win = document.getElementById("mainWindow");
  var handle = document.getElementById("dragHandle");

  (function center() {
    var w = Math.min(820, Math.max(520, window.innerWidth * 0.55));
    var h = Math.min(window.innerHeight * 0.82, window.innerHeight - 60);
    var leftPos = Math.round((window.innerWidth - w) / 2);
    win.style.left = leftPos + "px";
    win.style.top = "16px";
    win.style.width = w + "px";
    win.style.height = h + "px";
    win.dataset.centerX = leftPos;
    win.dataset.centerY = 16;
    win.dataset.centerW = w;
    win.dataset.centerH = h;
  })();

  var winBehavior = new WindowBehavior(win, {
    dragHandle: handle,
    btnClose: document.getElementById("btnClose"),
    btnMinimize: document.getElementById("btnMinimize"),
    btnMaximize: document.getElementById("btnMaximize"),
    minW: 500,
    minH: 500,
    startVisible: false,
    taskbarIcon:
      '<img src="assets/system/icons/tango2kde/16x16/apps/dolphin.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: "Repositório",
    onInit: function (controls) {
      // Ensure initial position
      controls.setMinimized(false);
    },
  });

  /* ================================================================
       SHOW DESKTOP
       ================================================================ */

  // Register main window for show-desktop
  if (W2K && W2K.AppRegistry) {
    W2K.AppRegistry.register("programs", {
      label: "Repositório",
      show: function () {
        winBehavior.show();
      },
      minimize: function () {
        winBehavior.minimize();
      },
      hasEntry: function () {
        return winBehavior.hasTaskbarEntry();
      },
    });
  }
  // Legacy registry (for showDesktop fallback path)
  if (window.windowRegistry) {
    window.windowRegistry.push({
      minimize: function () {
        winBehavior.minimize();
      },
      show: function () {
        winBehavior.show();
      },
      hasEntry: function () {
        return winBehavior.hasTaskbarEntry();
      },
    });
  }

  var _showDesktop = false;
  var _sdState = [];

  function toggleShowDesktop() {
    _showDesktop = !_showDesktop;
    if (_showDesktop) {
      _sdState = [];
      (W2K && W2K.AppRegistry
        ? W2K.AppRegistry.forEach
        : function (fn) {
            (window.windowRegistry || []).forEach(function (w, i) {
              fn({ hasEntry: w.hasEntry }, "reg" + i);
            });
          })(function (app, id) {
        _sdState.push({
          id: id,
          wasOpen: app.hasEntry ? app.hasEntry() : false,
        });
      });
      if (W2K && W2K.AppRegistry) W2K.AppRegistry.minimizeAll();
      else
        (window.windowRegistry || []).forEach(function (w) {
          w.minimize();
        });
    } else {
      _sdState.forEach(function (s) {
        if (!s.wasOpen) return;
        if (W2K && W2K.AppRegistry) {
          var app = W2K.AppRegistry.get(s.id);
          if (app) app.show();
        } else {
          var reg = window.windowRegistry || [];
          var idx = parseInt(s.id.replace("reg", ""));
          if (reg[idx]) reg[idx].show();
        }
      });
      _sdState = [];
    }
  }

  document
    .getElementById("qlShowDesktop")
    .addEventListener("click", toggleShowDesktop);

  /* ================================================================
       DESKTOP ICONS
       ================================================================ */

  var deskIcons = document.querySelectorAll(".desk-icon");
  var selectedIcon = null;

  function deselectAllIcons() {
    for (var i = 0; i < deskIcons.length; i++) {
      deskIcons[i].classList.remove("selected");
    }
    selectedIcon = null;
  }

  function openDesktopIcon(action) {
    trackUse(action);
    switch (action) {
      case "wakatime":
        window.open(
          "https://wakatime.com/@530e7be4-0c7e-40cf-9389-1017373810c3",
          "_blank",
        );
        break;
      default:
        if (W2K && W2K.AppRegistry) {
          W2K.AppRegistry.launch(action);
        }
        break;
    }
  }

  for (var i = 0; i < deskIcons.length; i++) {
    (function (icon) {
      icon.addEventListener("click", function (e) {
        deselectAllIcons();
        icon.classList.add("selected");
        selectedIcon = icon;
        e.stopPropagation();
      });
      icon.addEventListener("dblclick", function () {
        deselectAllIcons();
        openDesktopIcon(icon.getAttribute("data-action"));
      });
    })(deskIcons[i]);
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".desk-icon")) {
      deselectAllIcons();
    }
  });

  /* ================================================================
       START BUTTON
       ================================================================ */

  var startMenu = document.getElementById("startMenu");
  var startBtn = document.getElementById("startBtn");

  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    startMenu.classList.toggle("open");
    startBtn.classList.toggle("active", startMenu.classList.contains("open"));
    if (startMenu.classList.contains("open")) sortMostUsed();
  });

  /* ================================================================
       MOST USED (frequência de uso)
       ================================================================ */

  var mostUsed = {};
  try {
    mostUsed = JSON.parse(localStorage.getItem("w2kMostUsed") || "{}");
  } catch (e) {
    mostUsed = {};
  }

  function trackUse(action) {
    if (!action) return;
    mostUsed[action] = (mostUsed[action] || 0) + 1;
    try {
      localStorage.setItem("w2kMostUsed", JSON.stringify(mostUsed));
    } catch (e) {}
  }

  function sortMostUsed() {
    var body = document.getElementById("startMenuBody");
    if (!body) return;
    var sep = body.querySelector(".start-menu-separator");
    if (!sep) return;
    var items = Array.from(body.querySelectorAll(".start-menu-item"));
    var appItems = items.filter(function (el) {
      var action = el.getAttribute("data-action");
      return action && action !== "fullscreen" && action !== "shutdown";
    });
    appItems.sort(function (a, b) {
      var aFreq = mostUsed[a.getAttribute("data-action")] || 0;
      var bFreq = mostUsed[b.getAttribute("data-action")] || 0;
      if (bFreq !== aFreq) return bFreq - aFreq;
      var aLabel = (a.textContent || "").trim();
      var bLabel = (b.textContent || "").trim();
      return aLabel.localeCompare(bLabel, "pt");
    });
    var frag = document.createDocumentFragment();
    for (var i = 0; i < appItems.length; i++) {
      frag.appendChild(appItems[i]);
    }
    body.insertBefore(frag, sep);
  }

  /* ================================================================
       START MENU ITEMS
       ================================================================ */

  startMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".start-menu-item");
    if (!item) return;
    startMenu.classList.remove("open");
    startBtn.classList.remove("active");
    var action = item.getAttribute("data-action");
    trackUse(action);
    switch (action) {
      case "programs":
        if (winBehavior.isMinimized() || win.style.display === "none") {
          winBehavior.show();
        }
        winBehavior.bringToFront();
        break;
      case "fullscreen":
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(function () {});
        } else {
          document.exitFullscreen().catch(function () {});
        }
        break;
      case "shutdown":
        xpDialog({
          title: "Desligar",
          icon: "!",
          type: "confirm",
          message: "Tem certeza que deseja desligar o computador?",
          callback: function (ok) {
            if (ok) {
              document.body.innerHTML =
                '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:24px;">Agora é seguro desligar o computador.</div>';
            }
          },
        });
        break;
      default:
        if (W2K && W2K.AppRegistry) {
          W2K.AppRegistry.launch(action);
        }
        break;
    }
  });

  /* ================================================================
       DESKTOP RIGHT-CLICK CONTEXT MENU
       ================================================================ */

  var ctxMenu = document.getElementById("ctxMenu");

  document
    .querySelector(".desktop")
    .addEventListener("contextmenu", function (e) {
      e.preventDefault();
      ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + "px";
      ctxMenu.style.top = Math.min(e.clientY, window.innerHeight - 160) + "px";
      ctxMenu.style.display = "block";
    });

  ctxMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".ctx-menu-item");
    if (!item) return;
    ctxMenu.style.display = "none";
    var action = item.getAttribute("data-action");
    switch (action) {
      case "arrange":
        for (var i = 0; i < deskIcons.length; i++) {
          deskIcons[i].style.left = "";
          deskIcons[i].style.top = "";
          deskIcons[i].classList.remove("selected");
        }
        break;
      case "refresh":
        location.reload();
        break;
      case "paste":
        xpDialog({
          title: "Sistema",
          icon: "i",
          message: "Área de transferência vazia.\nNada para colar.",
        });
        break;
      case "showdesktop":
        toggleShowDesktop();
        break;
      case "properties":
        xpDialog({
          title: "Sistema",
          icon: "i",
          message:
            "Windows 2000 Desktop\n\n" +
            "Um projeto hobby feito com HTML, CSS e JavaScript puros.",
        });
        break;
    }
  });

  /* ================================================================
       TASKBAR RIGHT-CLICK CONTEXT
       ================================================================ */

  document
    .querySelector(".taskbar")
    .addEventListener("contextmenu", function (e) {
      e.preventDefault();
      ctxMenu.style.left = Math.min(e.clientX, window.innerWidth - 180) + "px";
      ctxMenu.style.top = Math.max(0, e.clientY - 160) + "px";
      ctxMenu.style.display = "block";
    });

  /* ================================================================
       CLOSE MENUS ON OUTSIDE CLICK
       ================================================================ */

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#startBtn") && !e.target.closest("#startMenu")) {
      startMenu.classList.remove("open");
      startBtn.classList.remove("active");
    }
    if (!e.target.closest("#ctxMenu")) {
      ctxMenu.style.display = "none";
    }
  });

  /* ================================================================
       RETRO SCROLL — stepped scrolling with mouse wheel
       ================================================================ */

  (function () {
    var body = document.querySelector(".window-body");
    if (!body) return;

    var STEP = 80;
    var ticking = false;
    var pendingScroll = 0;

    body.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        pendingScroll += e.deltaY > 0 ? STEP : -STEP;
        if (!ticking) {
          ticking = true;
          window.__addTick(function () {
            body.scrollTop += pendingScroll;
            pendingScroll = 0;
            ticking = false;
          });
        }
      },
      { passive: false },
    );
  })();

  /* ================================================================
       BOOT SCREEN
       ================================================================ */

  (function () {
    var boot = document.getElementById("bootScreen");
    if (!boot) return;

    var bar = document.getElementById("bootBarFill");
    var msg = document.getElementById("bootMsg");
    if (!bar || !msg) return;

    function tryFS() {
      try {
        document.documentElement.requestFullscreen();
      } catch (e) {}
    }
    boot.addEventListener("click", tryFS);

    var stages = [
      { pct: 8, txt: "Iniciando..." },
      { pct: 18, txt: "Carregando configurações..." },
      { pct: 33, txt: "Iniciando serviços..." },
      { pct: 54, txt: "Preparando interface..." },
      { pct: 90, txt: "Finalizando inicialização..." },
      { pct: 100, txt: "Pronto..." },
    ];

    var idx = 0;
    var done = false;

    function advance() {
      if (done) return;
      if (idx >= stages.length) {
        finish();
        return;
      }
      var s = stages[idx];
      bar.style.width = s.pct + "%";
      msg.textContent = s.txt;
      idx++;
      if (idx < stages.length) {
        setTimeout(advance, 100 + Math.random() * 3000);
      }
    }

    function fastForward() {
      idx = stages.length;
      bar.style.width = "100%";
      msg.textContent = "Pronto! ^^";
    }

    function finish() {
      if (done) return;
      done = true;
      fastForward();
      setTimeout(function () {
        boot.style.transition = "opacity 0.6s ease";
        boot.style.opacity = "0";
        setTimeout(function () {
          boot.remove();
        }, 1500);
      }, 1500);
    }

    var minTime = 5000;
    var loadTimer = setTimeout(finish, minTime);

    window.addEventListener("load", function () {
      clearTimeout(loadTimer);
      setTimeout(finish, 8000);
    });

    advance();
  })();

  /* ================================================================
       CHAT LAUNCHER
       ================================================================ */

  window.showChat = function () {
    if (W2K && W2K.AppRegistry) {
      W2K.AppRegistry.launch("chat");
    } else {
      // Fallback: direct call
      if (typeof window.chatShowWindow !== "undefined") {
        window.chatShowWindow();
      } else {
        xpDialog({
          title: "Chat IA",
          icon: "i",
          message: "Chat IA está carregando...\nAguarde um momento.",
          width: "400px",
        });
        var checkLoaded = setInterval(function () {
          if (typeof window.chatShowWindow !== "undefined") {
            clearInterval(checkLoaded);
            window.chatShowWindow();
          }
        }, 200);
        setTimeout(function () {
          clearInterval(checkLoaded);
        }, 10000);
      }
    }
  };
})();
