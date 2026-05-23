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
      '<img src="assets/icons/tango2kde/16x16/apps/dolphin.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: "Repositório",
    onInit: function (controls) {
      // Ensure initial position
      controls.setMinimized(false);
    },
  });

  /* ================================================================
       SHOW DESKTOP
       ================================================================ */

  var _showDesktop = false;
  var _sdState = [];

  if (window.windowRegistry) {
    registerWindow({
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

  function toggleShowDesktop() {
    _showDesktop = !_showDesktop;
    var reg = window.windowRegistry || [];
    if (_showDesktop) {
      _sdState = reg.map(function (w) {
        return { wasOpen: w.hasEntry() };
      });
      reg.forEach(function (w) {
        w.minimize();
      });
    } else {
      reg.forEach(function (w, i) {
        if (_sdState[i] && _sdState[i].wasOpen) w.show();
      });
      _sdState = [];
    }
  }

  document
    .getElementById("qlShowDesktop")
    .addEventListener("click", toggleShowDesktop);

  /* ================================================================
       DESKTOP ICONS — select, drag, double-click
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
      case "terminal":
        showTerminal();
        break;
      case "games":
        if (typeof window.showGames !== "undefined") window.showGames();
        break;
      case "randomgif":
        if (typeof window.openGallery !== "undefined") window.openGallery();
        break;
      case "wakatime":
        window.open(
          "https://wakatime.com/@530e7be4-0c7e-40cf-9389-1017373810c3",
          "_blank",
        );
        break;
      case "soundcloud":
        if (typeof window.showSoundCloud !== "undefined") window.showSoundCloud();
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

  var mostUsed = JSON.parse(localStorage.getItem("w2kMostUsed") || "{}");

  function trackUse(action) {
    mostUsed[action] = (mostUsed[action] || 0) + 1;
    localStorage.setItem("w2kMostUsed", JSON.stringify(mostUsed));
  }

  function sortMostUsed() {
    var body = document.getElementById("startMenuBody");
    if (!body) return;
    var items = Array.from(body.querySelectorAll(".start-menu-item"));
    var grupos = body.querySelectorAll(".start-menu-separator, .start-menu-group-title");
    var sepIndex = -1;
    for (var i = 0; i < body.children.length; i++) {
      if (body.children[i].classList.contains("start-menu-separator")) {
        sepIndex = i;
        break;
      }
    }
    if (sepIndex < 0) return;
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
    var sep = body.querySelector(".start-menu-separator");
    if (!sep) return;
    appItems.forEach(function (el) { body.insertBefore(el, sep); });
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
      case "chat":
        showChat();
        break;
      case "terminal":
        showTerminal();
        break;
      case "games":
        if (typeof window.showGames !== "undefined") window.showGames();
        break;
      case "randomgif":
        if (typeof window.openGallery !== "undefined") window.openGallery();
        break;
      case "settings":
        if (typeof window.showSettings !== "undefined") window.showSettings();
        break;
      case "soundcloud":
        if (typeof window.showSoundCloud !== "undefined") window.showSoundCloud();
        break;
      case "fullscreen":
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(function(){});
        } else {
          document.exitFullscreen().catch(function(){});
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
       STARTUP ANIMATION
       ================================================================ */

  setTimeout(function () {
    var overlay = document.createElement("div");
    overlay.id = "gifOverlay";
    overlay.innerHTML =
      '<img src="assets/enter.gif" style="position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:999999;">';
    document.body.appendChild(overlay);
    setTimeout(function () {
      overlay.remove();
    }, 3000);
  }, 1500);

  /* ================================================================
       CHAT LAUNCHER
       ================================================================ */

  window.showChat = function () {
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
  };
})();
