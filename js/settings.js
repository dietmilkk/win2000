(function () {
    'use strict';

    var win = document.getElementById('settingsWindow');
    var dragHandle = document.getElementById('settingsDragHandle');
    var btnClose = document.getElementById('settingsBtnClose');
    var btnMinimize = document.getElementById('settingsBtnMinimize');
    var btnMaximize = document.getElementById('settingsBtnMaximize');

    var wallpaperInput = document.getElementById('wallpaperInput');
    var wallpaperFileName = document.getElementById('wallpaperFileName');
    var wallpaperPreview = document.getElementById('wallpaperPreview');
    var applyBtn = document.getElementById('settingsApplyBtn');

    var selectedFile = null;

    var behavior = new WindowBehavior(win, {
        dragHandle: dragHandle,
        btnClose: btnClose,
        btnMinimize: btnMinimize,
        btnMaximize: btnMaximize,
        minW: 520,
        minH: 380,
        taskbarIcon: '<svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;"><g fill="#555"><rect x="6.5" y="1" width="3" height="3" rx="0.5"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(45 8 8)"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(90 8 8)"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(135 8 8)"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(180 8 8)"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(225 8 8)"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(270 8 8)"/><rect x="6.5" y="1" width="3" height="3" rx="0.5" transform="rotate(315 8 8)"/></g><circle cx="8" cy="8" r="4" fill="#d4d0c8" stroke="#555" stroke-width="1.2"/><circle cx="8" cy="8" r="2" fill="#8a8a8a" stroke="#444" stroke-width="0.8"/></svg>',
        taskbarLabel: 'Configurações',
        onShow: function () {
            win.style.width = '520px';
            win.style.height = '400px';
        },
    });

    window.showSettings = function () { behavior.show(); };

    if (window.registerWindow) {
      registerWindow({
        minimize: function () { behavior.minimize(); },
        show: function () { behavior.show(); },
        hasEntry: function () { return behavior.hasTaskbarEntry(); },
      });
    }

    wallpaperInput.addEventListener('change', function () {
        var file = wallpaperInput.files[0];
        if (!file) return;
        selectedFile = file;
        wallpaperFileName.textContent = file.name;

        var reader = new FileReader();
        reader.onload = function (e) {
            wallpaperPreview.innerHTML = '<img src="' + e.target.result + '" class="settings-wallpaper-img">';
            wallpaperPreview.style.background = 'none';
        };
        reader.readAsDataURL(file);
    });

    applyBtn.addEventListener('click', function () {
        if (!selectedFile) {
            xpDialog({
                title: 'Configurações',
                icon: 'i',
                message: 'Selecione uma imagem primeiro.',
            });
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var desktop = document.querySelector('.desktop');
            desktop.style.backgroundImage = 'url("' + e.target.result + '")';
            desktop.style.backgroundSize = 'cover';
            desktop.style.backgroundPosition = 'center';
            desktop.style.backgroundRepeat = 'no-repeat';

            xpDialog({
                title: 'Configurações',
                icon: 'i',
                message: 'Wallpaper aplicado com sucesso!',
            });
        };
        reader.readAsDataURL(selectedFile);
    });

    var categories = document.querySelectorAll('.settings-category');
    for (var i = 0; i < categories.length; i++) {
        (function (cat) {
            cat.addEventListener('click', function () {
                for (var j = 0; j < categories.length; j++) {
                    categories[j].classList.remove('active');
                }
                cat.classList.add('active');

                var panels = document.querySelectorAll('.settings-panel');
                for (var k = 0; k < panels.length; k++) {
                    panels[k].classList.remove('active');
                }
                var target = document.querySelector('.settings-panel[data-category="' + cat.getAttribute('data-category') + '"]');
                if (target) target.classList.add('active');
            });
        })(categories[i]);
    }
})();