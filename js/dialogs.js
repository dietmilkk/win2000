/* ============================================================
   dialogs.js — Custom XP-style dialogs (alert, confirm, prompt)
   ============================================================ */

(function() {
  "use strict";

  var dialogOverlay = null;
  var dialogBox = null;
  var dialogCallback = null;
  var dialogTbEntry = null;

  function xpDialog(options) {
    var title = options.title || "Dialog";
    var icon = options.icon || "i";
    var message = options.message || "";
    var type = options.type || "alert";
    var defaultValue = options.defaultValue || "";
    var callback = options.callback || function() {};
    var width = options.width || "";

    if (dialogOverlay) {
      if (dialogTbEntry && dialogTbEntry.parentNode) {
        dialogTbEntry.parentNode.removeChild(dialogTbEntry);
      }
      dialogOverlay.remove();
      dialogOverlay = null;
    }

    dialogOverlay = document.createElement("div");
    dialogOverlay.className = "xp-dialog-overlay";

    var iconSvg = "";
    switch (icon) {
      case "?":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#2255aa" stroke="#0a2a6a" stroke-width="2"/><text x="16" y="22" text-anchor="middle" fill="#fff" font-size="18" font-weight="bold">?</text></svg>';
        break;
      case "!":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><polygon points="16,4 28,28 4,28" fill="#aa2222" stroke="#6a1111" stroke-width="2"/><text x="16" y="24" text-anchor="middle" fill="#fff" font-size="18" font-weight="bold">!</text></svg>';
        break;
      case ">":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><polygon points="6,6 26,16 6,26" fill="#666" stroke="#333" stroke-width="2"/></svg>';
        break;
      case "@":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="4" y="10" width="24" height="16" fill="#f0ece4" stroke="#888" stroke-width="2"/><rect x="6" y="12" width="20" height="3" fill="#0099cc"/></svg>';
        break;
      case "R":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><path d="M8 8 L24 8 L24 24 L8 24 Z M12 12 L12 20 M12 16 L20 12" fill="none" stroke="#888" stroke-width="3"/></svg>';
        break;
      case "C":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><text x="8" y="24" font-size="20" font-family="Arial" fill="#444" font-weight="bold">C</text></svg>';
        break;
      case "N":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><text x="8" y="24" font-size="20" font-family="Arial" fill="#444" font-weight="bold">N</text></svg>';
        break;
      case "i":
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#2255aa" stroke="#0a2a6a" stroke-width="2"/><text x="16" y="22" text-anchor="middle" fill="#fff" font-size="18" font-weight="bold">i</text></svg>';
        break;
      default:
        iconSvg =
          '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#2255aa" stroke="#0a2a6a" stroke-width="2"/></svg>';
    }

    var buttons = "";
    if (type === "confirm") {
      buttons =
        '<button id="xpDialogOk" class="xp-dialog-btn">OK</button><button id="xpDialogCancel" class="xp-dialog-btn">Cancel</button>';
    } else if (type === "prompt") {
      buttons =
        '<button id="xpDialogOk" class="xp-dialog-btn">OK</button><button id="xpDialogCancel" class="xp-dialog-btn">Cancel</button>';
    } else {
      buttons = '<button id="xpDialogOk" class="xp-dialog-btn">OK</button>';
    }

    var inputField = "";
    if (type === "prompt") {
      inputField =
        '<input type="text" id="xpDialogInput" class="xp-dialog-input" value="' +
        defaultValue.replace(/"/g, "&quot;") +
        '">';
    }

    dialogOverlay.innerHTML =
      '<div id="xpDialogBox" class="xp-dialog">' +
      '<div class="xp-dialog-title-bar">' +
      '<span class="xp-dialog-title-text">' +
      title +
      '</span>' +
      '<span id="xpDialogClose" class="xp-dialog-close"><img src="assets/icons/win-close.svg" alt="X" class="win-btn-icon"></span>' +
      '</div>' +
      '<div class="xp-dialog-body">' +
      '<div class="xp-dialog-icon-area">' +
      iconSvg +
      '</div>' +
      '<div class="xp-dialog-content">' +
      '<div class="xp-dialog-msg">' +
      message +
      '</div>' +
      inputField +
      '</div>' +
      '</div>' +
      '<div class="xp-dialog-buttons">' +
      buttons +
      '</div>' +
      '</div>';

    document.body.appendChild(dialogOverlay);

    var dialogBoxEl = document.getElementById("xpDialogBox");
    if (dialogBoxEl) {
      dialogBoxEl.style.transform = 'scale(0.95)';
      dialogBoxEl.style.opacity = '0';
      dialogBoxEl.style.transition = 'transform 0.2s steps(2), opacity 0.2s steps(2)';
      requestAnimationFrame(function() {
        dialogBoxEl.style.transform = 'scale(1)';
        dialogBoxEl.style.opacity = '1';
      });
      setTimeout(function() {
        dialogBoxEl.style.transition = '';
        dialogBoxEl.style.transform = '';
        dialogBoxEl.style.opacity = '';
      }, 250);
    }

    var taskbarItems = document.querySelector(".taskbar-items");
    dialogTbEntry = null;
    if (taskbarItems) {
      dialogTbEntry = document.createElement("div");
      dialogTbEntry.className = "taskbar-item active";
      dialogTbEntry.textContent = title;
      taskbarItems.appendChild(dialogTbEntry);
      dialogTbEntry.addEventListener("click", function() {
        if (dialogOverlay) {
    document.body.appendChild(dialogOverlay);

    if (width) {
      document.getElementById("xpDialogBox").style.maxWidth = width;
    }
        }
      });
    }

    dialogOverlay.addEventListener("click", function(e) {
      if (e.target === dialogOverlay) {
        var box = document.getElementById("xpDialogBox");
        if (box) {
          box.classList.add("window-shake");
          setTimeout(function() { box.classList.remove("window-shake"); }, 300);
        }
      }
    });

    var closeBtn = document.getElementById("xpDialogClose");
    var okBtn = document.getElementById("xpDialogOk");
    var cancelBtn = document.getElementById("xpDialogCancel");

    function closeDialog() {
      if (dialogOverlay) {
        var box = document.getElementById("xpDialogBox");
        if (box) {
          box.style.transition = 'transform 0.2s steps(2), opacity 0.2s steps(2)';
          box.style.transform = 'scale(0.95)';
          box.style.opacity = '0';
          setTimeout(function() {
            dialogOverlay.remove();
            dialogOverlay = null;
            if (dialogTbEntry && dialogTbEntry.parentNode) {
              dialogTbEntry.parentNode.removeChild(dialogTbEntry);
              dialogTbEntry = null;
            }
          }, 200);
        } else {
          dialogOverlay.remove();
          dialogOverlay = null;
          if (dialogTbEntry && dialogTbEntry.parentNode) {
            dialogTbEntry.parentNode.removeChild(dialogTbEntry);
            dialogTbEntry = null;
          }
        }
      } else {
        if (dialogTbEntry && dialogTbEntry.parentNode) {
          dialogTbEntry.parentNode.removeChild(dialogTbEntry);
          dialogTbEntry = null;
        }
      }
    }

    closeBtn.addEventListener("click", closeDialog);

    okBtn.addEventListener("click", function() {
      if (type === "prompt") {
        var input = document.getElementById("xpDialogInput");
        callback(input.value);
      } else {
        callback(true);
      }
      closeDialog();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function() {
        if (type === "confirm") {
          callback(false);
        } else if (type === "prompt") {
          callback(null);
        }
        closeDialog();
      });
    }

    if (type === "prompt") {
      setTimeout(function() {
        var input = document.getElementById("xpDialogInput");
        if (input) input.focus();
      }, 10);
    }
  }

  window.xpDialog = xpDialog;
})();