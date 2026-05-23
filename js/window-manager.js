(function(global) {
  'use strict';

  function createWindowControls(win, opts) {
    opts = opts || {};

    var dragHandle   = opts.dragHandle   || win.querySelector('.title-bar');
    var tbEntry      = opts.taskbarEntry || null;
    var btnClose     = opts.btnClose === false ? null : (opts.btnClose || win.querySelector('.win-btn[title="Close"]'));
    var btnMinimize  = opts.btnMinimize  || win.querySelector('.win-btn[title="Minimize"]');
    var btnMaximize  = opts.btnMaximize  || win.querySelector('.win-btn[title="Maximize"]');
    var minW         = opts.minW || 500;
    var minH         = opts.minH || 300;
    var onMinimize   = opts.onMinimize || null;
    var onRestore    = opts.onRestore || null;

    var minimized = false;
    var maximized = false;
    var snapped = false;
    var dragState = null;
    var resizeState = null;
    var prevRect = null;
    var minimizeTimer = null;

    function flashWindow() {
        win.classList.remove('window-interacting');
        void win.offsetWidth;
        win.classList.add('window-interacting');
        setTimeout(function() { win.classList.remove('window-interacting'); }, 400);
    }

    function getTb() { return tbEntry; }

    function saveRect() {
      var r = win.getBoundingClientRect();
      prevRect = {
        left: r.left + 'px',
        top: r.top + 'px',
        width: r.width + 'px',
        height: r.height + 'px',
      };
    }

    function bringToFront() {
      var all = document.querySelectorAll('.window');
      var maxZ = 0;
      for (var i = 0; i < all.length; i++) {
        var z = parseInt(all[i].style.zIndex) || 0;
        if (z > maxZ) maxZ = z;
      }
      win.style.zIndex = maxZ + 1;
      document.querySelectorAll('.window, .taskbar-item').forEach(function(el) {
        el.classList.remove('active');
      });
      win.classList.add('active');
      if (tbEntry) tbEntry.classList.add('active');
    }

    win.addEventListener('mousedown', bringToFront);

    function toggleMaximize() {
      if (maximized) {
        if (prevRect) {
          win.style.left = prevRect.left;
          win.style.top = prevRect.top;
          win.style.width = prevRect.width;
          win.style.height = prevRect.height;
        }
        win.classList.remove('window-maximized');
        maximized = false;
        if (btnMaximize) {
          var svg = btnMaximize.querySelector('svg');
          if (svg) {
            svg.innerHTML = '<rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/>';
          }
          btnMaximize.title = 'Maximize';
        }
      } else {
        saveRect();
        var tb = document.querySelector('.taskbar');
        var th = tb ? tb.offsetHeight : 40;
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - ' + th + 'px)';
        win.classList.add('window-maximized');
        maximized = true;
        if (btnMaximize) {
          var svg = btnMaximize.querySelector('svg');
          if (svg) {
            svg.innerHTML = '<rect x="1" y="4" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="4" y="1" width="11" height="11" fill="#d4d0c8" stroke="currentColor" stroke-width="1.2"/>';
          }
          btnMaximize.title = 'Restore';
        }
      }
    }

    if (dragHandle) {
      dragHandle.addEventListener('dblclick', function(e) {
        if (e.target.classList.contains('win-btn')) return;
        toggleMaximize();
      });
    }

    function minimize() {
      if (minimized) return;
      var tb = getTb();
      if (!tb) {
        minimized = true;
        win.style.display = 'none';
        return;
      }
      var winRect = win.getBoundingClientRect();
      var tbRect = tb.getBoundingClientRect();
      var sx = winRect.left, sy = winRect.top;
      var sw = winRect.width, sh = winRect.height;
      var tx = tbRect.left + 4, ty = tbRect.top + 2;
      var tw = Math.max(20, tbRect.width - 8), th = Math.max(4, tbRect.height - 4);
      minimized = true;
      saveRect();
      if (tb) tb.classList.remove('active');
      win.style.transition = 'none';
      win.style.left = sx + 'px';
      win.style.top = sy + 'px';
      win.style.width = sw + 'px';
      win.style.height = sh + 'px';
      requestAnimationFrame(function() {
        win.style.transition = 'all 0.2s ease';
        win.style.left = tx + 'px';
        win.style.top = ty + 'px';
        win.style.width = tw + 'px';
        win.style.height = th + 'px';
        minimizeTimer = setTimeout(function() {
          minimizeTimer = null;
          if (!minimized) { win.style.transition = ''; return; }
          win.style.display = 'none';
          win.style.transition = '';
          win.style.left = sx + 'px';
          win.style.top = sy + 'px';
          win.style.width = sw + 'px';
          win.style.height = sh + 'px';
          if (onMinimize) onMinimize();
        }, 300);
      });
    }

    function restore() {
      if (!minimized) return;
      if (minimizeTimer) { clearTimeout(minimizeTimer); minimizeTimer = null; }
      minimized = false;
      snapped = false;
      var tb = getTb();
      if (tb) {
        var tbRect = tb.getBoundingClientRect();
        var tx = tbRect.left + 4, ty = tbRect.top + 2;
        var tw = Math.max(20, tbRect.width - 8), th = Math.max(4, tbRect.height - 4);
        var cx = prevRect ? parseInt(prevRect.left) : 200;
        var cy = prevRect ? parseInt(prevRect.top) : 80;
        var cw = prevRect ? parseInt(prevRect.width) : 600;
        var ch = prevRect ? parseInt(prevRect.height) : 400;
        win.style.display = '';
        win.style.transition = 'none';
        win.style.left = tx + 'px';
        win.style.top = ty + 'px';
        win.style.width = tw + 'px';
        win.style.height = th + 'px';
        requestAnimationFrame(function() {
          win.style.transition = 'all 0.2s ease';
          win.style.left = cx + 'px';
          win.style.top = cy + 'px';
          win.style.width = cw + 'px';
          win.style.height = ch + 'px';
          setTimeout(function() {
            win.style.transition = '';
            bringToFront();
            if (onRestore) onRestore();
          }, 300);
        });
      } else {
        win.style.display = '';
        bringToFront();
      }
    }

    function hide() {
      if (minimized) return;
      saveRect();
      win.style.transition = 'opacity 0.2s ease';
      win.style.opacity = '0';
      if (tbEntry) tbEntry.classList.remove('active');
      setTimeout(function() {
        minimized = true;
        win.style.display = 'none';
        win.style.transition = '';
        win.style.opacity = '';
      }, 200);
    }

    if (btnClose) {
      btnClose.addEventListener('click', hide);
    }

    if (btnMinimize) {
      btnMinimize.addEventListener('click', function() {
        if (maximized) { toggleMaximize(); }
        minimize();
      });
    }

    if (btnMaximize) {
      btnMaximize.addEventListener('click', function() {
        if (minimized || win.style.display === 'none') {
          restore();
        } else {
          toggleMaximize();
        }
      });
    }

    if (tbEntry) {
      tbEntry.addEventListener('click', function() {
        if (document.body.classList.contains('mobile-mode')) {
          if (win.classList.contains('active')) {
            win.classList.remove('active');
            tbEntry.classList.remove('active');
          } else {
            document.querySelectorAll('.window').forEach(function(w) { w.classList.remove('active'); });
            document.querySelectorAll('.taskbar-item').forEach(function(t) { t.classList.remove('active'); });
            win.classList.add('active');
            tbEntry.classList.add('active');
            bringToFront();
          }
          return;
        }
        if (minimized || win.style.display === 'none') {
          restore();
        } else if (win.classList.contains('active')) {
          minimize();
        } else {
          bringToFront();
        }
      });
    }

    if (dragHandle) {
      dragHandle.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('win-btn')) return;
        if (snapped && prevRect) {
          snapped = false;
          win.style.left = prevRect.left;
          win.style.top = prevRect.top;
          win.style.width = prevRect.width;
          win.style.height = prevRect.height;
        }
        var rect = win.getBoundingClientRect();
        dragState = {
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
          startX: rect.left,
          startY: rect.top,
        };
        win.style.cursor = 'move';
      });
    }

    document.addEventListener('mousemove', function(e) {
      if (!dragState) return;
      if (!maximized) {
        if (e.clientY < 12) {
          toggleMaximize();
          dragState = null;
          win.style.cursor = '';
          return;
        }
        var _snapEdge = 60;
        var _tb = document.querySelector('.taskbar');
        var _th = _tb ? _tb.offsetHeight : 40;
        var _mh = window.innerHeight - _th;
        if (e.clientX < _snapEdge) {
          saveRect();
          snapped = true;
          win.style.left = '0';
          win.style.top = '0';
          win.style.width = Math.round(window.innerWidth / 2) + 'px';
          win.style.height = _mh + 'px';
          dragState = null;
          win.style.cursor = '';
          return;
        }
        if (e.clientX > window.innerWidth - _snapEdge) {
          saveRect();
          snapped = true;
          var _hw = Math.round(window.innerWidth / 2);
          win.style.left = _hw + 'px';
          win.style.top = '0';
          win.style.width = _hw + 'px';
          win.style.height = _mh + 'px';
          dragState = null;
          win.style.cursor = '';
          return;
        }
      } else {
        if (e.clientY > dragState.offsetY + 8) {
          toggleMaximize();
          dragState.offsetX = e.clientX - parseInt(win.style.left);
          dragState.offsetY = e.clientY - parseInt(win.style.top);
        }
      }
      var l = e.clientX - dragState.offsetX;
      var t = e.clientY - dragState.offsetY;
      l = Math.max(-win.offsetWidth + 60, Math.min(l, window.innerWidth - 60));
      t = Math.max(0, Math.min(t, window.innerHeight - 50));
      global.__domWrite(function() {
        win.style.left = l + 'px';
        win.style.top = t + 'px';
      });
    });

    document.addEventListener('mouseup', function() {
      if (dragState) {
        dragState = null;
        win.style.cursor = '';
      }
    });

    (function() {
      if (!win.querySelector('.resize-edge')) {
        var resizeHTML = '';
        var edges = ['t','b','l','r'];
        for (var ei = 0; ei < edges.length; ei++) {
          resizeHTML += '<div class="resize-edge" data-edge="' + edges[ei] + '"></div>';
        }
        var corners = ['tl','tr','bl','br'];
        for (var ci = 0; ci < corners.length; ci++) {
          resizeHTML += '<div class="resize-corner" data-edge="' + corners[ci] + '"></div>';
        }
        var frag = document.createElement('div');
        frag.innerHTML = resizeHTML;
        while (frag.firstChild) {
          win.appendChild(frag.firstChild);
        }
      }
      var edges = win.querySelectorAll('.resize-edge, .resize-corner');
      if (!edges.length) return;

      function startResize(e, edge) {
        e.preventDefault();
        e.stopPropagation();
        bringToFront();
        if (snapped && prevRect) {
          snapped = false;
          win.style.left = prevRect.left;
          win.style.top = prevRect.top;
          win.style.width = prevRect.width;
          win.style.height = prevRect.height;
        }
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
        var newL = s.startLeft, newT = s.startTop;
        var newW = s.startW, newH = s.startH;

        if (edge.indexOf('l') !== -1) {
          newL = s.startLeft + dx;
          newW = s.startW - dx;
          if (newW < minW) { newW = minW; newL = s.startLeft + s.startW - minW; }
          newL = Math.max(0, newL);
          newW = Math.min(newW, window.innerWidth - newL);
        } else if (edge.indexOf('r') !== -1) {
          newW = s.startW + dx;
          newW = Math.max(minW, Math.min(newW, window.innerWidth - s.startLeft));
        }

        if (edge.indexOf('t') !== -1) {
          newT = s.startTop + dy;
          newH = s.startH - dy;
          if (newH < minH) { newH = minH; newT = s.startTop + s.startH - minH; }
          newT = Math.max(0, newT);
          newH = Math.min(newH, window.innerHeight - newT - 40);
        } else if (edge.indexOf('b') !== -1) {
          newH = s.startH + dy;
          newH = Math.max(minH, Math.min(newH, window.innerHeight - s.startTop - 40));
        }

        global.__domWrite(function() {
          win.style.left = newL + 'px';
          win.style.top = newT + 'px';
          win.style.width = newW + 'px';
          win.style.height = newH + 'px';
        });
      }

      function endResize() {
        if (resizeState) {
          resizeState = null;
          if (maximized) {
            maximized = false;
            win.classList.remove('window-maximized');
          }
        }
      }

      for (var i = 0; i < edges.length; i++) {
        (function(el) {
          el.addEventListener('mousedown', function(e) {
            startResize(e, el.getAttribute('data-edge'));
          });
        })(edges[i]);
      }

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', endResize);
    })();

    return {
      show: restore,
      hide: hide,
      minimize: minimize,
      restore: restore,
      toggleMaximize: toggleMaximize,
      bringToFront: bringToFront,
      isMinimized: function() { return minimized; },
      isMaximized: function() { return maximized; },
      setMinimized: function(v) { minimized = v; },
      setTaskbarEntry: function(el) { tbEntry = el; },
      clearSavedRect: function() { prevRect = null; },
    };
  }

  global.createWindowControls = createWindowControls;

  /* ================================================================
     WindowBehavior — unified window lifecycle with lazy init,
     dynamic taskbar entry, and standard show/hide/close.

     opts:
       dragHandle, btnClose, btnMinimize, btnMaximize,
       taskbarIcon (SVG string for taskbar entry), taskbarLabel,
       minW, minH,
       startVisible (default false),
       onShow(behavior), onHide(behavior), onInit(controls)
  ================================================================ */

  function WindowBehavior(win, opts) {
    opts = opts || {};

    var _initialized = false;
    var tbEntry = null;
    var controls = null;

    function flash() {
        win.classList.remove('window-interacting');
        void win.offsetWidth;
        win.classList.add('window-interacting');
        setTimeout(function() { win.classList.remove('window-interacting'); }, 400);
    }

    function _init() {
      if (_initialized) return;
      _initialized = true;

      var ctrlOpts = {};
      for (var k in opts) { if (opts.hasOwnProperty(k)) ctrlOpts[k] = opts[k]; }
      ctrlOpts.btnClose = false;
      controls = createWindowControls(win, ctrlOpts);

      if (!opts.startVisible) {
        win.style.display = 'none';
        controls.setMinimized(true);
      }

      if (opts.onInit) opts.onInit(controls);
    }

    function createTaskbarEntry() {
      if (tbEntry) return;
      var container = document.querySelector('.taskbar-items');
      if (!container) return;
      tbEntry = document.createElement('div');
      tbEntry.className = 'taskbar-item active';
      tbEntry.innerHTML = (opts.taskbarIcon || '') + ' ' + (opts.taskbarLabel || 'Window');
      container.appendChild(tbEntry);
      controls.setTaskbarEntry(tbEntry);
      tbEntry.addEventListener('click', function() {
        if (controls.isMinimized()) {
          controls.restore();
        } else if (win.style.display === 'none') {
          show();
        } else if (win.classList.contains('active')) {
          controls.minimize();
        } else {
          controls.bringToFront();
        }
      });
      tbEntry.addEventListener('dblclick', function() {
        controls.bringToFront();
      });
    }

    function removeTaskbarEntry() {
      if (tbEntry) {
        tbEntry.remove();
        tbEntry = null;
      }
    }

    function show() {
      _init();
      createTaskbarEntry();
      win.style.display = '';
      if (tbEntry) tbEntry.classList.add('active');
      controls.bringToFront();
      controls.setMinimized(false);
      if (!opts._onShowFired) {
        opts._onShowFired = true;
        if (opts.onShow) {
          opts.onShow(this);
        }
        var w = win.offsetWidth || parseInt(win.style.width) || 600;
        var h = win.offsetHeight || parseInt(win.style.height) || 450;
        win.style.left = Math.round((window.innerWidth - w) / 2) + 'px';
        win.style.top = Math.max(4, Math.round((window.innerHeight - h) / 2.5)) + 'px';
      }
    }

    function hide() {
      if (controls && controls.isMinimized()) return;
      if (controls) controls.hide();
      removeTaskbarEntry();
      opts._onShowFired = false;
      if (controls) controls.clearSavedRect();
      if (opts.onHide) opts.onHide(this);
    }

    function minimize() {
      _init();
      controls.minimize();
    }

    function restore() {
      _init();
      controls.restore();
    }

    function bringToFront() {
      _init();
      controls.bringToFront();
    }

    function isMinimized() {
      return controls ? controls.isMinimized() : true;
    }

    function isMaximized() {
      return controls ? controls.isMaximized() : false;
    }

    function setMinimized(v) {
      if (controls) controls.setMinimized(v);
    }

    function hasTaskbarEntry() {
      return tbEntry !== null;
    }

    // Wire close button to hide + remove taskbar
    (function() {
      var closeBtn = opts.btnClose || win.querySelector('.win-btn[title="Close"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          if (controls && controls.isMinimized()) return;
          hide();
        });
      }
    })();

    _init();
    if (opts.startVisible) {
      show();
    }

    return {
      show: show,
      hide: hide,
      minimize: minimize,
      restore: restore,
      bringToFront: bringToFront,
      isMinimized: isMinimized,
      isMaximized: isMaximized,
      setMinimized: setMinimized,
      flash: flash,
      hasTaskbarEntry: hasTaskbarEntry,
      getControls: function() { return controls; },
    };
  }

  global.windowRegistry = [];

  global.registerWindow = function(desc) {
    global.windowRegistry.push({
      minimize: desc.minimize,
      show: desc.show,
      hasEntry: desc.hasEntry,
    });
  };

  global.WindowBehavior = WindowBehavior;
  global.flashWindow = function(win) {
    win.classList.remove('window-interacting');
    void win.offsetWidth;
    win.classList.add('window-interacting');
    setTimeout(function() { win.classList.remove('window-interacting'); }, 400);
  };
})(window);
