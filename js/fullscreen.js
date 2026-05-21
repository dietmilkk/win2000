(function() {
    'use strict';

    var isFullscreen = false;

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function() {});
        } else {
            document.exitFullscreen().catch(function() {});
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', function() {
        isFullscreen = !!document.fullscreenElement;
    });

    window.toggleFullscreen = toggleFullscreen;
})();
