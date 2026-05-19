(function () {
  "use strict";

  /* ================================================================
       MOBILE DETECTION — prompt desktop or simplified mode
       ================================================================ */

  (function () {
    var isMobile = window.innerWidth < 600;
    if (!isMobile) return;

    var overlay = document.getElementById("mobileOverlay");
    if (!overlay) return;

    var mode = sessionStorage.getItem("xpMobileMode");
    if (mode === "desktop") {
      document.querySelector("meta[name=viewport]").content = "width=1024";
      document.documentElement.style.minWidth = "1024px";
      document.documentElement.style.overflowX = "hidden";
      return;
    }
    if (mode === "simple") {
      document.body.classList.add("mobile-mode");
      document.querySelector("meta[name=viewport]").content =
        "width=device-width, initial-scale=1";
      return;
    }

    overlay.style.display = "";

    document
      .getElementById("mobileDesktopMode")
      .addEventListener("click", function () {
        overlay.style.display = "none";
        sessionStorage.setItem("xpMobileMode", "desktop");
        document.querySelector("meta[name=viewport]").content =
          "width=1024, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no";
        document.documentElement.style.minWidth = "1024px";
        document.documentElement.style.overflowX = "hidden";
        window.scrollTo(0, 0);
        goFullscreen();
      });

    document
      .getElementById("mobileSimpleMode")
      .addEventListener("click", function () {
        overlay.style.display = "none";
        sessionStorage.setItem("xpMobileMode", "simple");
        document.body.classList.add("mobile-mode");
        document.querySelector("meta[name=viewport]").content =
          "width=device-width, initial-scale=1";
        initMobileMode();
        goFullscreen();
      });

    function initMobileMode() {
      var mw = document.getElementById("mainWindow");
      var tw = document.getElementById("chatWindow");
      var te = document.getElementById("taskbarEntry");
      var ce = document.getElementById("chatTaskbarEntry");
      if (mw) mw.classList.add("active");
      if (te) te.classList.add("active");
      if (ce) ce.classList.remove("active");
      if (tw) tw.classList.remove("active");
    }

    if (mode === "simple") {
      initMobileMode();
    }
  })();

  function goFullscreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(function () {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  var fsActivated = false;

  document.addEventListener(
    "click",
    function fsFirst(e) {
      if (fsActivated) return;
      fsActivated = true;
      e.stopPropagation();
      goFullscreen();
    },
    true,
  );

  document.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var overlay = document.getElementById("mobileOverlay");
    if (overlay && overlay.style.display !== "none") return;
  });

  /* ================================================================
       WINDOW SETUP
       ================================================================ */

  var win = document.getElementById("mainWindow");
  var handle = document.getElementById("dragHandle");

  (function center() {
    var gap = 12;
    var margin = 16;
    var totalW = window.innerWidth;
    var totalH = window.innerHeight;

    var cw = Math.min(400, Math.max(280, totalW * 0.35));
    if (totalW < 600) cw = 0;

    var maxMainW = totalW - cw - gap - margin * 2;
    var w = Math.min(920, Math.max(280, maxMainW));
    var h = Math.min(totalH * 0.82, totalH - 60);
    if (totalW < 600) {
      w = totalW - 12;
      h = totalH - 50;
      cw = 0;
    }

    var leftPos = Math.round((totalW - w - cw - gap) / 2);
    if (leftPos < margin) leftPos = margin;

    win.style.left = leftPos + "px";
    win.style.top = "16px";
    win.style.width = w + "px";
    win.style.height = h + "px";
    win.dataset.centerX = leftPos;
    win.dataset.centerY = 16;
    win.dataset.centerW = w;
    win.dataset.centerH = h;

    var chatWin = document.getElementById("chatWindow");
    if (chatWin) {
      var chatW = cw || 360;
      var chatLeft = leftPos + w + gap;
      chatWin.style.left = chatLeft + "px";
      chatWin.style.top = "16px";
      chatWin.style.width = chatW + "px";
      chatWin.style.height = h + "px";
      if (totalW < 600) {
        chatWin.style.position = "relative";
        chatWin.style.left = "";
        chatWin.style.top = "";
        chatWin.style.width = "";
        chatWin.style.height = "";
      }
    }
  })();

  var winControls = createWindowControls(win, {
    dragHandle: handle,
    taskbarEntry: document.getElementById("taskbarEntry"),
    btnClose: document.getElementById("btnClose"),
    btnMinimize: document.getElementById("btnMinimize"),
    btnMaximize: document.getElementById("btnMaximize"),
    minW: 400,
    minH: 300,
  });

  var _showDesktop = false;

  function toggleShowDesktop() {
    _showDesktop = !_showDesktop;
    if (_showDesktop) {
      winControls.minimize();
      if (typeof chatMinimizeWindow !== "undefined") chatMinimizeWindow();
      if (typeof termMinimizeWindow !== "undefined") termMinimizeWindow();
    } else {
      winControls.restore();
      if (typeof chatShowWindow !== "undefined") chatShowWindow();
      if (typeof termShowWindow !== "undefined" && (!window.termHasEntry || window.termHasEntry())) termShowWindow();
    }
  }

  document.getElementById("qlShowDesktop").addEventListener("click", toggleShowDesktop);

  /* ================================================================
       DESKTOP ICONS — select, drag, double-click
       ================================================================ */

  var deskIcons = document.querySelectorAll(".desk-icon");
  var selectedIcon = null;
  var desktopIcons = document.querySelector(".desktop-icons");

  function deselectAllIcons() {
    for (var i = 0; i < deskIcons.length; i++) {
      deskIcons[i].classList.remove("selected");
    }
    selectedIcon = null;
  }

  function openDesktopIcon(action) {
    switch (action) {
      case "mycomputer":
        xpDialog({
          title: "My Computer",
          icon: "C",
          message:
            "My Computer\n\nLocal Disk (C:)\nCapacity: 40.0 GB\nFree: 12.5 GB\n\nFile System: NTFS",
        });
        break;
      case "email":
        xpDialog({
          title: "Email",
          icon: "@",
          message:
            "Contact: contato.endryo@gmail.com\n\nThis email is active and ready for professional contact.\nFeel free to reach out for business inquiries, collaborations, or opportunities.",
        });
        break;
      case "recycle":
        xpDialog({
          title: "Recycle Bin",
          icon: "R",
          message: "Recycle Bin\n\n0 items\n\nEmpty",
        });
        break;
      case "terminal":
        showTerminal();
        break;
      case "randomgif":
        openRandomGif();
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

  document.getElementById("startBtn").addEventListener("click", function (e) {
    e.stopPropagation();
    startMenu.classList.toggle("open");
  });

  /* ================================================================
       START MENU ITEMS
       ================================================================ */

  startMenu.addEventListener("click", function (e) {
    var item = e.target.closest(".start-menu-item");
    if (!item) return;
    startMenu.classList.remove("open");
    var action = item.getAttribute("data-action");
    switch (action) {
      case "portfolio":
        if (winControls.isMinimized() || win.style.display === "none") {
          winControls.restore();
        }
        winControls.bringToFront();
        break;
      case "chat":
        var ce = document.getElementById("chatTaskbarEntry");
        if (ce) ce.click();
        break;
      case "terminal":
        showTerminal();
        break;
      case "randomgif":
        openRandomGif();
        break;
      case "about":
        xpDialog({
          title: "About",
          icon: "i",
          width: "620px",
          message:
            "<b>Portifolio</b> — Endryo's showcase of digital work<br>" +
            "Built with clean, handcrafted code — no shortcuts, no drag-and-drop builders.<br><br>" +
            "<b>Quick Actions:</b><br>" +
            "<button class='xp-dialog-btn' style='margin:2px' onclick='document.getElementById(\"taskbarEntry\")?.click()'>Portfolio</button>" +
            "<button class='xp-dialog-btn' style='margin:2px' onclick='document.getElementById(\"chatTaskbarEntry\")?.click()'>AI Chat</button>" +
            "<button class='xp-dialog-btn' style='margin:2px' onclick='showTerminal()'>Terminal</button>" +
            "<button class='xp-dialog-btn' style='margin:2px' onclick='openRandomGif()'>GIF Gallery</button><br><br>" +
            "<details style='font-size:13px;cursor:pointer'>" +
            "<summary style='font-weight:600'>Behind the Scenes</summary>" +
            "<div style='margin:6px 0 0 4px;line-height:1.7;font-size:13px'>" +
            "This is not a template. It's a full Windows 2000 desktop recreated in the browser — from scratch, vanilla HTML/CSS/JS, zero frameworks. " +
            "Draggable windows, taskbar, start menu, desktop icons with context menu, retro CRT scanlines, custom cursors, XP-style dialogs, FPS locked at 10 for the authentic feel. " +
            "The AI chat knows Endryo inside out and can guide you around. The terminal runs real commands (help, dir, matrix, hack, doom...). " +
            "The GIF gallery auto-updates when you drop files in the folder. " +
            "Endryo builds this kind of work with AI agents in his editor — delivering fast, any tech needed. Contact: contato.endryo@gmail.com</div></details>",
        });
        break;
      case "shutdown":
        xpDialog({
          title: "Shut Down Windows",
          icon: "!",
          type: "confirm",
          message: "Are you sure you want to shut down your computer?",
          callback: function (ok) {
            if (ok) {
              document.body.innerHTML =
                '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:monospace;font-size:24px;">It is now safe to turn off your computer.</div>';
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
        document.querySelector(".desktop").style.opacity = "0.5";
        setTimeout(function () {
          document.querySelector(".desktop").style.opacity = "";
        }, 300);
        break;
      case "paste":
        xpDialog({
          title: "Desktop",
          icon: "i",
          message: "Clipboard is empty.\nNothing to paste.",
        });
        break;
      case "showdesktop":
        toggleShowDesktop();
        break;
      case "properties":
        xpDialog({
          title: "Desktop Properties",
          icon: "i",
          message: "Windows 2000 Portfolio Theme\n\n" + "Make with love ^^",
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
     STARTUP ERROR MESSAGE
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
})();
