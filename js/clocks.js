/* ============================================================
   clocks.js — Clock and date display in taskbar
   ============================================================ */

(function() {
  "use strict";

  function updateClocks() {
    var now = new Date();
    var t =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    var el1 = document.getElementById("wClock");
    var el2 = document.getElementById("taskbarClock");
    if (el1) el1.textContent = t;
    if (el2) el2.textContent = t;
  }

  updateClocks();
  setInterval(updateClocks, 1000);
})();
