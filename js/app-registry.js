(function (global) {
  "use strict";

  var apps = {};

  function safe(fn, fallback) {
    try {
      return fn();
    } catch (e) {
      console.error("AppRegistry:", e);
      if (typeof fallback === "function") fallback(e);
      return null;
    }
  }

  /**
   * Register an application.
   * @param {string} id        — unique ID, e.g. "terminal"
   * @param {object} desc
   * @param {string} desc.label     — "Terminal"
   * @param {string} desc.icon      — SVG or img HTML
   * @param {function} desc.show    — function() to open/show the app
   * @param {function} [desc.minimize]
   * @param {function} [desc.hasEntry]
   * @param {function} [desc.onError] — custom error handler
   */
  function registerApp(id, desc) {
    if (!id || !desc || typeof desc.show !== "function") return;
    apps[id] = desc;

    // Keep legacy windowRegistry in sync
    if (desc.minimize && desc.hasEntry && global.windowRegistry) {
      global.registerWindow({
        minimize: desc.minimize,
        show: desc.show,
        hasEntry: desc.hasEntry,
      });
    }
  }

  function getApp(id) {
    return apps[id] || null;
  }

  function launchApp(id) {
    var app = apps[id];
    if (!app) return false;

    safe(function () {
      app.show();
      if (typeof trackUse === "function") trackUse(id);
    }, function (err) {
      if (app.onError) {
        app.onError(err);
      } else if (typeof xpDialog === "function") {
        xpDialog({
          title: "Erro",
          icon: "!",
          message: "Erro ao abrir " + (app.label || id) + ":\n" + (err.message || err),
        });
      }
    });

    return true;
  }

  function launchSafe(id) {
    try {
      return launchApp(id);
    } catch (e) {
      console.error("AppRegistry: fatal error launching", id, e);
      return false;
    }
  }

  function forEachApp(fn) {
    for (var id in apps) {
      if (apps.hasOwnProperty(id)) {
        fn(apps[id], id);
      }
    }
  }

  function showAllApps() {
    forEachApp(function (app) {
      if (app.hasEntry && !app.hasEntry()) {
        app.show();
      }
    });
  }

  function minimizeAllApps() {
    forEachApp(function (app) {
      if (app.minimize) app.minimize();
    });
  }

  // Expose globally
  global.W2K = global.W2K || {};
  global.W2K.AppRegistry = {
    register: registerApp,
    get: getApp,
    launch: launchSafe,
    forEach: forEachApp,
    showAll: showAllApps,
    minimizeAll: minimizeAllApps,
  };
})(window);
