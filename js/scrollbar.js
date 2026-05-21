(function() {
    'use strict';

    if ('ontouchstart' in window) return;

    var SCROLLBAR_WIDTH = 18;
    var _instances = [];

    function CustomScrollbar(container) {
        this.container = container;
        this.content = container.children[0] || container;
        this.track = null;
        this.thumb = null;
        this.btnUp = null;
        this.btnDown = null;
        this._isDragging = false;
        this._dragStartY = 0;
        this._dragStartScroll = 0;
        this._observer = null;
        this._rafPending = false;

        container.style.overflow = 'hidden';
        container.style.position = 'relative';
        this._build();
        this._bind();
        this._observe();
        this._update();
        _instances.push(this);
    }

    CustomScrollbar.prototype._build = function() {
        var outer = document.createElement('div');
        outer.className = 'custom-scrollbar-outer';
        outer.style.cssText = 'position:absolute;top:0;right:0;width:' + SCROLLBAR_WIDTH + 'px;height:100%;display:flex;flex-direction:column;z-index:200;pointer-events:auto;';

        var btnUp = document.createElement('div');
        btnUp.className = 'csb-btn csb-btn-up';
        btnUp.style.cssText = 'width:' + SCROLLBAR_WIDTH + 'px;height:' + SCROLLBAR_WIDTH + 'px;flex-shrink:0;background:#d4d0c8;border-top:3px solid #fff;border-left:3px solid #fff;border-right:3px solid #505050;border-bottom:3px solid #505050;display:flex;align-items:center;justify-content:center;cursor:default;box-sizing:border-box;';
        btnUp.innerHTML = '<svg width="8" height="5" viewBox="0 0 8 5"><polygon points="4,0 8,5 0,5" fill="#505050"/></svg>';

        var btnDown = document.createElement('div');
        btnDown.className = 'csb-btn csb-btn-down';
        btnDown.style.cssText = 'width:' + SCROLLBAR_WIDTH + 'px;height:' + SCROLLBAR_WIDTH + 'px;flex-shrink:0;background:#d4d0c8;border-top:3px solid #fff;border-left:3px solid #fff;border-right:3px solid #505050;border-bottom:3px solid #505050;display:flex;align-items:center;justify-content:center;cursor:default;box-sizing:border-box;';
        btnDown.innerHTML = '<svg width="8" height="5" viewBox="0 0 8 5"><polygon points="0,0 8,0 4,5" fill="#505050"/></svg>';

        var track = document.createElement('div');
        track.className = 'csb-track';
        track.style.cssText = 'flex:1;position:relative;background:#b0aca4;border-top:2px solid #6a6660;border-left:2px solid #6a6660;border-right:2px solid #e0dcd4;border-bottom:2px solid #e0dcd4;box-sizing:border-box;min-height:20px;cursor:default;';

        var thumb = document.createElement('div');
        thumb.className = 'csb-thumb';
        thumb.style.cssText = 'position:absolute;left:0;right:0;background:#d4d0c8;border-top:3px solid #fff;border-left:3px solid #fff;border-right:3px solid #505050;border-bottom:3px solid #505050;box-sizing:border-box;cursor:default;min-height:24px;';
        track.appendChild(thumb);

        outer.appendChild(btnUp);
        outer.appendChild(track);
        outer.appendChild(btnDown);

        this.container.appendChild(outer);

        this.track = track;
        this.thumb = thumb;
        this.btnUp = btnUp;
        this.btnDown = btnDown;
    };

    CustomScrollbar.prototype._bind = function() {
        var self = this;

        this.btnUp.addEventListener('mousedown', function(e) {
            e.preventDefault();
            self.container.scrollTop -= 30;
            self._pressBtn(self.btnUp);
        });

        this.btnDown.addEventListener('mousedown', function(e) {
            e.preventDefault();
            self.container.scrollTop += 30;
            self._pressBtn(self.btnDown);
        });

        this.track.addEventListener('mousedown', function(e) {
            if (e.target === self.thumb) return;
            e.preventDefault();
            var rect = self.track.getBoundingClientRect();
            var thumbH = self.thumb.offsetHeight;
            var clickY = e.clientY - rect.top - thumbH / 2;
            var trackH = rect.height;
            var scrollH = self.container.scrollHeight - self.container.clientHeight;
            if (scrollH <= 0) return;
            var ratio = clickY / (trackH - thumbH);
            self.container.scrollTop = Math.round(ratio * scrollH);
        });

        this.thumb.addEventListener('mousedown', function(e) {
            e.preventDefault();
            self._isDragging = true;
            self._dragStartY = e.clientY;
            self._dragStartScroll = self.container.scrollTop;
            self.thumb.style.borderTop = '3px solid #505050';
            self.thumb.style.borderLeft = '3px solid #505050';
            self.thumb.style.borderRight = '3px solid #fff';
            self.thumb.style.borderBottom = '3px solid #fff';
            self.thumb.style.background = '#c4c0b8';
        });

        document.addEventListener('mousemove', function(e) {
            if (!self._isDragging) return;
            e.preventDefault();
            var dy = e.clientY - self._dragStartY;
            var trackH = self.track.clientHeight;
            var thumbH = self.thumb.offsetHeight;
            var scrollH = self.container.scrollHeight - self.container.clientHeight;
            if (scrollH <= 0) return;
            var ratio = dy / (trackH - thumbH);
            self.container.scrollTop = self._dragStartScroll + Math.round(ratio * scrollH);
        });

        document.addEventListener('mouseup', function() {
            if (self._isDragging) {
                self._isDragging = false;
                self.thumb.style.borderTop = '3px solid #fff';
                self.thumb.style.borderLeft = '3px solid #fff';
                self.thumb.style.borderRight = '3px solid #505050';
                self.thumb.style.borderBottom = '3px solid #505050';
                self.thumb.style.background = '#d4d0c8';
            }
        });

        this.container.addEventListener('wheel', function(e) {
            self._update();
        }, { passive: true });

        var pending = false;
        this.container.addEventListener('scroll', function() {
            if (!pending) {
                pending = true;
                requestAnimationFrame(function() {
                    self._update();
                    pending = false;
                });
            }
        }, { passive: true });
    };

    CustomScrollbar.prototype._pressBtn = function(btn) {
        var self = this;
        btn.style.borderTop = '3px solid #505050';
        btn.style.borderLeft = '3px solid #505050';
        btn.style.borderRight = '3px solid #fff';
        btn.style.borderBottom = '3px solid #fff';
        btn.style.background = '#c4c0b8';
        clearTimeout(btn._timer);
        btn._timer = setTimeout(function() {
            btn.style.borderTop = '3px solid #fff';
            btn.style.borderLeft = '3px solid #fff';
            btn.style.borderRight = '3px solid #505050';
            btn.style.borderBottom = '3px solid #505050';
            btn.style.background = '#d4d0c8';
        }, 100);
    };

    CustomScrollbar.prototype._observe = function() {
        var self = this;
        this._observer = new ResizeObserver(function() {
            self._scheduleUpdate();
        });
        this._observer.observe(this.container);
        if (this.content && this.content !== this.container) {
            this._observer.observe(this.content);
        }
        var children = this.container.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i] !== this.track && children[i] !== this.content) {
                this._observer.observe(children[i]);
            }
        }
    };

    CustomScrollbar.prototype._scheduleUpdate = function() {
        var self = this;
        if (!this._rafPending) {
            this._rafPending = true;
            requestAnimationFrame(function() {
                self._update();
                self._rafPending = false;
            });
        }
    };

    CustomScrollbar.prototype._update = function() {
        var ch = this.container.clientHeight;
        var sh = this.container.scrollHeight;
        var st = this.container.scrollTop;
        var btnH = SCROLLBAR_WIDTH;
        var trackH = ch - btnH * 2;

        if (sh <= ch + 1) {
            this.track.style.display = 'none';
            this.btnUp.style.display = 'none';
            this.btnDown.style.display = 'none';
            return;
        }
        this.track.style.display = 'block';
        this.btnUp.style.display = 'flex';
        this.btnDown.style.display = 'flex';

        var thumbH = Math.max(24, Math.round(trackH * ch / sh));
        var maxScroll = sh - ch;
        var ratio = maxScroll > 0 ? st / maxScroll : 0;
        var maxTop = trackH - thumbH;
        var top = Math.round(ratio * maxTop);

        this.thumb.style.height = thumbH + 'px';
        this.thumb.style.top = top + 'px';
    };

    CustomScrollbar.prototype.destroy = function() {
        if (this._observer) this._observer.disconnect();
        var outer = this.container.querySelector('.custom-scrollbar-outer');
        if (outer) outer.remove();
        this.container.style.overflow = '';
        this.container.style.position = '';
        var idx = _instances.indexOf(this);
        if (idx !== -1) _instances.splice(idx, 1);
    };

    function init() {
        var selectors = '.window-body, .term-output, .chat-messages, .settings-content';
        var els = document.querySelectorAll(selectors);
        els.forEach(function(el) {
            if (el._csb) return;
            el._csb = new CustomScrollbar(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.refreshCustomScrollbars = function() {
        _instances.forEach(function(inst) { inst._update(); });
    };
})();
