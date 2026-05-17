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
        document.querySelector("meta[name=viewport]").content = "width=1024";
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

  setTimeout(function () {
    goFullscreen();
  }, 100);

  document.addEventListener("click", function () {
    var overlay = document.getElementById("mobileOverlay");
    if (overlay && overlay.style.display !== "none") return;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      goFullscreen();
    }
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

  /* ================================================================
       DRAGGING — DOM writes batched at 10fps via __domWrite
       ================================================================ */

  var dragState = null;

  handle.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("win-btn")) return;
    var rect = win.getBoundingClientRect();
    dragState = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: rect.left,
      startY: rect.top,
    };
    win.style.cursor = "move";
  });

  handle.addEventListener("dblclick", function (e) {
    if (e.target.classList.contains("win-btn")) return;
    document.getElementById("btnMaximize").click();
  });

  document.addEventListener("mousemove", function (e) {
    if (!dragState) return;
    if (!maximized) {
      var snap = 12;
      if (e.clientY < snap) {
        document.getElementById("btnMaximize").click();
        dragState = null;
        win.style.cursor = "";
        return;
      }
    } else {
      if (e.clientY > dragState.offsetY + 8) {
        document.getElementById("btnMaximize").click();
        dragState.offsetX = e.clientX - parseInt(win.style.left);
        dragState.offsetY = e.clientY - parseInt(win.style.top);
      }
    }
    var l = e.clientX - dragState.offsetX;
    var t = e.clientY - dragState.offsetY;
    l = Math.max(-win.offsetWidth + 60, Math.min(l, window.innerWidth - 60));
    t = Math.max(0, Math.min(t, window.innerHeight - 50));
    window.__domWrite(function () {
      win.style.left = l + "px";
      win.style.top = t + "px";
    });
  });

  document.addEventListener("mouseup", function () {
    if (dragState) {
      dragState = null;
      win.style.cursor = "";
    }
  });

  /* ================================================================
       WINDOW CONTROLS
       ================================================================ */

  var minimized = false;
  var maximized = false;
  var prevRect = null;

  function saveRect() {
    prevRect = {
      left: win.style.left,
      top: win.style.top,
      width: win.style.width,
      height: win.style.height,
    };
  }

  document.getElementById("btnClose").addEventListener("click", function () {
    if (minimized) return;
    saveRect();
    minimized = true;
    win.style.display = "none";
    document.getElementById("taskbarEntry").classList.remove("active");
  });

  document.getElementById("btnMinimize").addEventListener("click", function () {
    if (maximized) {
      saveRect();
      minimized = true;
      win.style.display = "none";
      document.getElementById("taskbarEntry").classList.remove("active");
      return;
    }
    minimizeWindow();
  });

  function minimizeWindow() {
    if (minimized) return;
    var tbEntry = document.getElementById("taskbarEntry");
    if (!tbEntry) {
      minimized = true;
      win.style.display = "none";
      return;
    }
    var winRect = win.getBoundingClientRect();
    var tbRect = tbEntry.getBoundingClientRect();
    var sx = winRect.left,
      sy = winRect.top;
    var sw = winRect.width,
      sh = winRect.height;
    var tx = tbRect.left + 4,
      ty = tbRect.top + 2;
    var tw = Math.max(20, tbRect.width - 8),
      th = Math.max(4, tbRect.height - 4);
    minimized = true;
    saveRect();
    tbEntry.classList.remove("active");
    win.style.transition = "none";
    win.style.left = sx + "px";
    win.style.top = sy + "px";
    win.style.width = sw + "px";
    win.style.height = sh + "px";
    requestAnimationFrame(function () {
      win.style.transition = "all 0.2s steps(4)";
      win.style.left = tx + "px";
      win.style.top = ty + "px";
      win.style.width = tw + "px";
      win.style.height = th + "px";
      setTimeout(function () {
        win.style.display = "none";
        win.style.transition = "";
        win.style.left = sx + "px";
        win.style.top = sy + "px";
        win.style.width = sw + "px";
        win.style.height = sh + "px";
      }, 300);
    });
  }

  function restoreWindow() {
    if (!minimized) return;
    minimized = false;
    var tbEntry = document.getElementById("taskbarEntry");
    var tbRect = tbEntry.getBoundingClientRect();
    var tx = tbRect.left + 4,
      ty = tbRect.top + 2;
    var tw = Math.max(20, tbRect.width - 8),
      th = Math.max(4, tbRect.height - 4);
    var cx = prevRect ? parseInt(prevRect.left) : 200;
    var cy = prevRect ? parseInt(prevRect.top) : 80;
    var cw = prevRect ? parseInt(prevRect.width) : 600;
    var ch = prevRect ? parseInt(prevRect.height) : 400;
    win.style.display = "";
    win.style.transition = "none";
    win.style.left = tx + "px";
    win.style.top = ty + "px";
    win.style.width = tw + "px";
    win.style.height = th + "px";
    requestAnimationFrame(function () {
      win.style.transition = "all 0.2s steps(4)";
      win.style.left = cx + "px";
      win.style.top = cy + "px";
      win.style.width = cw + "px";
      win.style.height = ch + "px";
      setTimeout(function () {
        win.style.transition = "";
        tbEntry.classList.add("active");
      }, 300);
    });
  }

  document.getElementById("btnMaximize").addEventListener("click", function () {
    if (maximized) {
      win.style.left = prevRect.left;
      win.style.top = prevRect.top;
      win.style.width = prevRect.width;
      win.style.height = prevRect.height;
      win.classList.remove("window-maximized");
      maximized = false;
    } else {
      saveRect();
      var tb = document.querySelector(".taskbar");
      var taskbarH = tb ? tb.offsetHeight : 40;
      win.style.left = "0";
      win.style.top = "0";
      win.style.width = "100vw";
      win.style.height = "calc(100vh - 40px)";
      win.classList.add("window-maximized");
      maximized = true;
    }
  });

  document
    .getElementById("taskbarEntry")
    .addEventListener("click", function () {
      if (document.body.classList.contains("mobile-mode")) {
        if (win.classList.contains("active")) {
          win.classList.remove("active");
          document.getElementById("taskbarEntry").classList.remove("active");
        } else {
          document.querySelectorAll(".window").forEach(function (w) {
            w.classList.remove("active");
          });
          document.querySelectorAll(".taskbar-item").forEach(function (t) {
            t.classList.remove("active");
          });
          win.classList.add("active");
          document.getElementById("taskbarEntry").classList.add("active");
        }
        return;
      }
      if (minimized || win.style.display === "none") {
        restoreWindow();
      }
      bringToFront();
    });

  document
    .getElementById("qlShowDesktop")
    .addEventListener("click", function () {
      if (!minimized) minimizeWindow();
      if (typeof chatMinimizeWindow !== "undefined") chatMinimizeWindow();
      if (typeof termMinimizeWindow !== "undefined") termMinimizeWindow();
    });

  /* ================================================================
       BRING TO FRONT
       ================================================================ */

  function bringToFront() {
    var all = document.querySelectorAll(".window");
    var maxZ = 100;
    for (var i = 0; i < all.length; i++) {
      var z = parseInt(all[i].style.zIndex) || 0;
      if (z > maxZ) maxZ = z;
    }
    win.style.zIndex = maxZ + 1;
  }
  win.addEventListener("mousedown", bringToFront);

  /* ================================================================
       DESKTOP ICONS — select, drag, double-click
       ================================================================ */

  var deskIcons = document.querySelectorAll(".desk-icon");
  var selectedIcon = null;
  var iconDragState = null;
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
        if (iconDragState) return;
        deselectAllIcons();
        icon.classList.add("selected");
        selectedIcon = icon;
        e.stopPropagation();
      });
      icon.addEventListener("dblclick", function () {
        deselectAllIcons();
        openDesktopIcon(icon.getAttribute("data-action"));
      });
      icon.addEventListener("mousedown", function (e) {
        var rect = desktopIcons.getBoundingClientRect();
        var iconRect = icon.getBoundingClientRect();
        iconDragState = {
          offsetX: e.clientX - iconRect.left,
          offsetY: e.clientY - iconRect.top,
          startLeft: iconRect.left - rect.left,
          startTop: iconRect.top - rect.top,
        };
      });
    })(deskIcons[i]);
  }

  document.addEventListener("mousemove", function (e) {
    if (!iconDragState) return;
    var rect = desktopIcons.getBoundingClientRect();
    var newLeft = e.clientX - rect.left - iconDragState.offsetX;
    var newTop = e.clientY - rect.top - iconDragState.offsetY;
    newLeft = Math.max(0, Math.min(newLeft, rect.width - 70));
    newTop = Math.max(0, Math.min(newTop, rect.height - 56));
    if (selectedIcon) {
      selectedIcon.style.position = "relative";
      selectedIcon.style.left = newLeft + "px";
      selectedIcon.style.top = newTop + "px";
    }
  });
  document.addEventListener("mouseup", function () {
    iconDragState = null;
  });

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
        if (minimized || win.style.display === "none") {
          restoreWindow();
        }
        bringToFront();
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
      case "help":
        xpDialog({
          title: "Help & Support",
          icon: "?",
          message:
            "Portifolio\n\n" +
            "A retro-styled portfolio page inspired by Windows 2000.\n" +
            "Built with pure HTML, CSS, and JavaScript.\n\n" +
            "Features:\n" +
            "  - AI Chat Assistant\n" +
            "  - Terminal with fun commands\n" +
            "  - Random GIF gallery\n" +
            "  - Draggable & Resizable Windows\n\n" +
            "Terminal commands: help, cls, time, dir, echo, fortune, cowsay, matrix, 8ball, joke, ascii, hack, gif, doom\n\n" +
            "System: Windows 2000 build 2195",
        });
        break;
      case "run":
        xpDialog({
          title: "Run",
          icon: ">",
          type: "prompt",
          message:
            "Type the name of a program, folder, document, or Internet resource to open:",
          defaultValue: "",
          callback: function (cmd) {
            if (cmd) {
              xpDialog({
                title: "Run",
                icon: ">",
                message:
                  "Running: " +
                  cmd +
                  "\n\n(Just a demo — no actual programs are installed.)\n\nTo run a real command, use the terminal.",
                callback: function () {},
              });
            }
          },
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
        if (!minimized) minimizeWindow();
        if (typeof chatMinimizeWindow !== "undefined") chatMinimizeWindow();
        break;
      case "properties":
        xpDialog({
          title: "Desktop Properties",
          icon: "i",
          message:
            "Windows 2000 Portfolio Theme\n\n" +
            "Wallpaper: Classic Green\n" +
            "Color scheme: Windows Classic\n" +
            "Font: MS Sans Serif\n" +
            "Font size: Normal (96 DPI)\n\n" +
            "Screen saver: None\n" +
            "Desktop icons: My Computer, Email, Recycle Bin",
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

    var STEP = 40;
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
       RESIZE — edge & corner dragging
       ================================================================ */

  (function () {
    var edges = win.querySelectorAll(".resize-edge, .resize-corner");
    if (!edges.length) return;

    var MIN_W = 400,
      MIN_H = 300;
    var resizeState = null;

    function startResize(e, edge) {
      e.preventDefault();
      e.stopPropagation();
      var rect = win.getBoundingClientRect();
      resizeState = {
        edge: edge,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left,
        startTop: rect.top,
        startW: rect.width,
        startH: rect.height,
      };
    }

    function doResize(e) {
      if (!resizeState) return;
      var s = resizeState;
      var dx = e.clientX - s.startX;
      var dy = e.clientY - s.startY;
      var edge = s.edge;
      var newL = s.startLeft,
        newT = s.startTop;
      var newW = s.startW,
        newH = s.startH;

      // horizontal
      if (edge.indexOf("l") !== -1) {
        newL = s.startLeft + dx;
        newW = s.startW - dx;
        if (newW < MIN_W) {
          newW = MIN_W;
          newL = s.startLeft + s.startW - MIN_W;
        }
        newL = Math.max(0, newL);
        newW = Math.min(newW, window.innerWidth - newL);
      } else if (edge.indexOf("r") !== -1) {
        newW = s.startW + dx;
        newW = Math.max(MIN_W, Math.min(newW, window.innerWidth - s.startLeft));
      }

      // vertical
      if (edge.indexOf("t") !== -1) {
        newT = s.startTop + dy;
        newH = s.startH - dy;
        if (newH < MIN_H) {
          newH = MIN_H;
          newT = s.startTop + s.startH - MIN_H;
        }
        newT = Math.max(0, newT);
        newH = Math.min(newH, window.innerHeight - newT - 40);
      } else if (edge.indexOf("b") !== -1) {
        newH = s.startH + dy;
        newH = Math.max(
          MIN_H,
          Math.min(newH, window.innerHeight - s.startTop - 40),
        );
      }

      window.__domWrite(function () {
        win.style.left = newL + "px";
        win.style.top = newT + "px";
        win.style.width = newW + "px";
        win.style.height = newH + "px";
      });
    }

    function endResize() {
      if (resizeState) {
        resizeState = null;
        if (maximized) {
          maximized = false;
          win.classList.remove("window-maximized");
        }
      }
    }

    for (var i = 0; i < edges.length; i++) {
      (function (el) {
        el.addEventListener("mousedown", function (e) {
          startResize(e, el.getAttribute("data-edge"));
        });
      })(edges[i]);
    }

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", endResize);
  })();

  /* ================================================================
     STARTUP ERROR MESSAGE
     ================================================================ */

  setTimeout(function() {
    var overlay = document.createElement('div');
    overlay.id = 'gifOverlay';
    overlay.innerHTML = '<img src="assets/enter.gif" style="position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:999999;">';
    document.body.appendChild(overlay);
    setTimeout(function() { overlay.remove(); }, 3000);
  }, 1500);


})();
