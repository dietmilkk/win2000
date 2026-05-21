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

    var fullBtn = document.createElement('div');
    fullBtn.className = 'tray-icon';
    fullBtn.title = 'Alternar Tela Cheia (F11)';
    fullBtn.style.cssText = 'cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;';
    fullBtn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 3h4v1H4v3H3V3zm6 0h4v4h-1V4H9V3zM4 9v3h3v1H3V9h1zm8 0v3H9v1h4V9h-1z" fill="#000"/></svg>';
    var tray = document.querySelector('.taskbar-tray');
    if (tray) {
        tray.insertBefore(fullBtn, tray.firstChild);
        fullBtn.addEventListener('click', toggleFullscreen);
    }
})();
