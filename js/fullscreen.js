(function () {
  "use strict";

  var isFullscreen = false;
  var fsItem = document.querySelector(
    '.start-menu-item[data-action="fullscreen"]',
  );
  var fsIcon = fsItem ? fsItem.querySelector("img") : null;
  var fsLabel = fsItem ? fsItem.querySelector("span") : null;
  var enterIcon =
    "assets/system/icons/tango2kde/16x16/actions/view-fullscreen.png";
  var exitIcon =
    "assets/system/icons/tango2kde/16x16/actions/window_nofullscreen.png";

  function updateUI() {
    if (fsIcon) fsIcon.src = isFullscreen ? exitIcon : enterIcon;
    if (fsLabel)
      fsLabel.textContent = isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia";
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "F11") {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", function () {
    isFullscreen = !!document.fullscreenElement;
    document.body.classList.toggle("is-fullscreen", isFullscreen);
    updateUI();
  });

  window.toggleFullscreen = toggleFullscreen;
})();
