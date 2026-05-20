/* ============================================================
   fps-limiter.js  —  No throttling, immediate execution.
   Exports: window.__addTick(fn), window.__domWrite(fn)
   ============================================================ */

(function(global) {
    'use strict';

    global.__domWrite = function(fn) {
        fn();
    };

    global.__addTick = function(fn) {
        fn();
        return function cancel() {};
    };
})(window);
