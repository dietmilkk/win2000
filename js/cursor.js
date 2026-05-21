/* ============================================================
   cursor.js — Retro cursor and random GIF viewer
   ============================================================ */

(function () {
  "use strict";

  /* ================================================================
     RETRO CURSOR — embedded PNG, low-fps, grid-snapped
     ================================================================ */

  if (!("ontouchstart" in window)) {
    (function () {
      var el = document.createElement("div");
      el.id = "retroCursor";
      el.innerHTML =
        '<img src="assets/cursors/Normal%20Select.cur" class="rc-img"><img src="assets/cursors/Link%20Select.cur" class="rc-img" style="display:none"><img src="assets/cursors/Text%20Select.cur" class="rc-img" style="display:none"><img src="assets/cursors/Move.cur" class="rc-img" style="display:none"><img src="assets/cursors/Vertical%20Resize.cur" class="rc-img" style="display:none"><img src="assets/cursors/Horizontal%20Resize.cur" class="rc-img" style="display:none"><img src="assets/cursors/Diagonal%20Resize%201.cur" class="rc-img" style="display:none"><img src="assets/cursors/Diagonal%20Resize%202.cur" class="rc-img" style="display:none"><img src="assets/cursors/Busy.cur" class="rc-img" style="display:none"><img src="assets/cursors/Working%20in%20Background.cur" class="rc-img" style="display:none"><img src="assets/cursors/Unavailable.cur" class="rc-img" style="display:none"><img src="assets/cursors/Help%20Select.cur" class="rc-img" style="display:none">';
      document.body.appendChild(el);

      var ss = document.createElement("style");
      ss.textContent =
        "*{cursor:none!important}#retroCursor{pointer-events:none;position:fixed;z-index:199999}.rc-img{display:block}";
      document.head.appendChild(ss);

      var imgs = el.querySelectorAll(".rc-img");
      var arr = imgs[0],
        hand = imgs[1],
        text = imgs[2],
        move = imgs[3],
        vresize = imgs[4],
        hresize = imgs[5],
        d1 = imgs[6],
        d2 = imgs[7],
        busy = imgs[8],
        work = imgs[9],
        unavailable = imgs[10],
        help = imgs[11];

      var offsets = {
        arrow: { x: -10, y: -10 },
        hand: { x: -10, y: -10 },
        text: { x: -8, y: -9 },
        move: { x: -10, y: -10 },
        vresize: { x: -10, y: -10 },
        hresize: { x: -10, y: -10 },
        d1: { x: -10, y: -10 },
        d2: { x: -11, y: -10 },
        busy: { x: -10, y: -10 },
        work: { x: -10, y: -10 },
        unavailable: { x: -10, y: -10 },
        help: { x: -10, y: -10 },
      };

      var cursorMap = {
        arrow: arr,
        hand: hand,
        text: text,
        move: move,
        vresize: vresize,
        hresize: hresize,
        d1: d1,
        d2: d2,
        busy: busy,
        work: work,
        unavailable: unavailable,
        help: help,
      };

      var fps = 20,
        intv = 1000 / fps,
        last = 0;
      var mx = -100,
        my = -100,
        cur = "arrow";
      var selHand =
        "button,a,input,select,textarea,[role=button],[onclick],.desk-icon,.win-btn,.start-btn,.ql-icon,.taskbar-item,.start-menu-item,.ctx-menu-item,.xp-dialog-close,.xp-dialog-btn,.chat-send-btn,.mobile-btn";
      var selText = "pre,code,.terminal-output,.terminal-input";
      var selResizeV =
        '.resize-edge[data-edge="t"],.resize-edge[data-edge="b"]';
      var selResizeH =
        '.resize-edge[data-edge="l"],.resize-edge[data-edge="r"]';
      var selResizeD1 =
        '.resize-corner[data-edge="tl"],.resize-corner[data-edge="br"]';
      var selResizeD2 =
        '.resize-corner[data-edge="tr"],.resize-corner[data-edge="bl"]';
      var selMove = '[data-move="true"],.dragging,.window-moving';
      var selBusy = ".loading,.busy";
      var selWork = ".working";
      var selUnavailable = ".disabled,[disabled]";

      var inside = false;

      document.addEventListener("mousemove", function (e) {
        mx = e.clientX;
        my = e.clientY;
        if (!inside) {
          inside = true;
          el.style.visibility = "visible";
        }
      });

      document.documentElement.addEventListener("mouseleave", function () {
        inside = false;
        el.style.visibility = "hidden";
      });

      document.documentElement.addEventListener("mouseenter", function () {
        inside = true;
        el.style.visibility = "visible";
      });

      function tick() {
        var now = performance.now();
        if (now - last >= intv) {
          if (!inside) {
            el.style.visibility = "hidden";
            last = now - (now % intv);
            requestAnimationFrame(tick);
            return;
          }
          var want = "arrow";
          el.style.visibility = "hidden";
          var t = document.elementFromPoint(mx, my);
          el.style.visibility = "visible";
          if (t && t.closest) {
            if (t.closest(selUnavailable)) want = "unavailable";
            else if (t.closest(selWork)) want = "work";
            else if (t.closest(selBusy)) want = "busy";
            else if (t.closest(".resize-corner")) {
              var edge = t.closest(".resize-corner").getAttribute("data-edge");
              if (edge === "tl" || edge === "br") want = "d1";
              else want = "d2";
            } else if (t.closest(".resize-edge")) {
              var edge = t.closest(".resize-edge").getAttribute("data-edge");
              if (edge === "l" || edge === "r") want = "hresize";
              else want = "vresize";
            } else if (t.closest(selMove)) want = "move";
            else if (t.closest(selText)) want = "text";
            else if (t.closest(selHand)) want = "hand";
          } else if (!t) {
            el.style.visibility = "hidden";
          }
          if (want !== cur) {
            cur = want;
            for (var k in cursorMap) {
              cursorMap[k].style.display = k === want ? "" : "none";
            }
            var o = offsets[want];
            cursorMap[want].style.marginLeft = o.x + "px";
            cursorMap[want].style.marginTop = o.y + "px";
          }
          el.style.transform = "translate(" + mx + "px," + my + "px)";
          last = now - (now % intv);
        }
        requestAnimationFrame(tick);
      }
      tick();
    })();
  }

  /* ================================================================
     GALERIA (Image Gallery Viewer)
     ================================================================ */

  var _galleryList = null;
  var _galleryCache = {};

  function _initGallery() {
    if (_galleryList) return;
    _galleryList = [ 
"Among Us GIF.gif","Animated GIF.gif","Anime Girl GIF.gif","Apple Fruit GIF.gif","a-side-effect-of-lackadaisy-brainrot-no-one-tells-you-is-v0-4vs0wh5f8d0c1.webp","a-side-effect-of-lackadaisy-brainrot-no-one-tells-you-is-v0-6bs2wx9g8d0c1.webp","Baby Niche GIF.gif","Blue Cat GIF by Justin.gif","Bye Bye Skeleton GIF.gif","chuunibyou demo koi ga shitai dance GIF.gif","cute anime GIF.gif","Dance Skeleton GIF.gif","dancing GIF.gif","Danse Macabre Fun GIF by Kiszkiloszki.gif","gif.gif","Gif.gif","khanh2k6.gif","Om Nom Eating GIF.gif","Spinner Fern GIF.gif","taiga aisaka t GIF.gif","Working Chis Sweet Home GIF.gif"
    ];
  }

  window.openGallery = function () {
    _initGallery();
    if (!_galleryList.length) return;
    var currentIndex = Math.floor(Math.random() * _galleryList.length);

    function preload(idx) {
      var src = "assets/galery/" + encodeURIComponent(_galleryList[idx]);
      if (!_galleryCache[src]) {
        _galleryCache[src] = new Image();
        _galleryCache[src].src = src;
      }
    }
    preload(currentIndex);
    preload((currentIndex + 1) % _galleryList.length);
    preload((currentIndex - 1 + _galleryList.length) % _galleryList.length);

    var overlay = document.createElement("div");
    overlay.id = "galleryOverlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000;z-index:999998;display:flex;align-items:center;justify-content:center;outline:none";
    overlay.setAttribute("tabindex", "0");

    var img = document.createElement("img");
    img.style.cssText = "height:100vh;width:auto;max-width:100vw;display:block";
    img.src = "assets/gifs/random/" + encodeURIComponent(_galleryList[currentIndex]);
    overlay.appendChild(img);

    var info = document.createElement("div");
    info.style.cssText = "position:fixed;bottom:20px;left:20px;color:#fff;font-family:monospace;font-size:14px;background:rgba(0,0,0,0.7);padding:8px 12px;z-index:999999";
    info.textContent = "SPACE para sair | ← → para navegar (" + (currentIndex + 1) + "/" + _galleryList.length + ")";
    overlay.appendChild(info);

    document.body.appendChild(overlay);
    overlay.focus();

    function show(idx) {
      currentIndex = idx;
      var src = "assets/gifs/" + encodeURIComponent(_galleryList[idx]);
      img.src = src;
      info.textContent = "SPACE para sair | ← → para navegar (" + (idx + 1) + "/" + _galleryList.length + ")";
      preload((idx + 1) % _galleryList.length);
      preload((idx - 1 + _galleryList.length) % _galleryList.length);
    }

    overlay.addEventListener("keydown", function (e) {
      if (e.key === " ") {
        e.preventDefault();
        overlay.remove();
      } else if (e.key === "ArrowRight") {
        show((currentIndex + 1) % _galleryList.length);
      } else if (e.key === "ArrowLeft") {
        show((currentIndex - 1 + _galleryList.length) % _galleryList.length);
      }
    });
    overlay.addEventListener("click", function () {
      overlay.remove();
    });
  };
})();
