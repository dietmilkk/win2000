/* ============================================================
   fps-limiter.js  —  10 FPS frame engine
   Accumulator-based rAF throttle + DOM write queue.
   Exports: window.__addTick(fn), window.__domWrite(fn)
   ============================================================ */

(function(global) {
    'use strict';

    var TARGET_FPS = 10;
    var FRAME_MS = 1000 / TARGET_FPS;
    var lastTime = 0;
    var accumulator = 0;
    var tickCallbacks = [];
    var domQueue = [];

    /* --------------------------------------------------------
       Engine: one rAF loop, accumulator-based stepping.
       Fires all tick callbacks + flushes DOM queue at ~10fps.
       -------------------------------------------------------- */

    function engine(time) {
        if (lastTime === 0) lastTime = time;

        var delta = time - lastTime;
        lastTime = time;
        accumulator += delta;

        while (accumulator >= FRAME_MS) {
            accumulator -= FRAME_MS;

            for (var i = 0; i < tickCallbacks.length; i++) {
                tickCallbacks[i](time);
            }

            if (domQueue.length) {
                var batch = domQueue.slice();
                domQueue = [];
                for (var j = 0; j < batch.length; j++) {
                    batch[j]();
                }
            }
        }

        global.requestAnimationFrame(engine);
    }

    /* --------------------------------------------------------
       Public API
       -------------------------------------------------------- */

    global.__addTick = function(fn) {
        tickCallbacks.push(fn);
        return function cancel() {
            var idx = tickCallbacks.indexOf(fn);
            if (idx !== -1) tickCallbacks.splice(idx, 1);
        };
    };

    global.__domWrite = function(fn) {
        domQueue.push(fn);
    };

    global.requestAnimationFrame(engine);

})(window);
