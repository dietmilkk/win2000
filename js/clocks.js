(function () {
  "use strict";

  var _volume = parseFloat(localStorage.getItem("win2k_volume") || "1");
  if (_volume > 1) _volume = 1;
  var _audioCtx = null;

  function getAudioCtx() {
    if (!_audioCtx)
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  window.getPageVolume = function () {
    return _volume;
  };

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    localStorage.setItem("win2k_volume", _volume);
    if (typeof window.setSoundCloudVolume === "function") {
      window.setSoundCloudVolume(_volume);
    }
  }

  /* ===== Clock update ===== */
  function updateClocks() {
    var now = new Date();
    var t =
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");
    var el = document.getElementById("taskbarClock");
    if (el) el.textContent = t;
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* ===== Volume control ===== */
  var volIcon = document.getElementById("trayVolume");
  var volPanel = null;

  function buildVolumePanel() {
    var p = document.createElement("div");
    p.id = "volumePanel";
    p.style.cssText =
      "position:fixed;bottom:42px;right:10px;background:#ece9e0;border:2px solid;border-color:#fff #5a5a5a #5a5a5a #fff;padding:8px 12px;z-index:99999;display:none;font-family:Tahoma,sans-serif;font-size:12px;min-width:200px;box-shadow:2px -2px 4px rgba(0,0,0,0.15);";

    var header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:3px;border-bottom:1px solid #c0bcb4;";
    header.innerHTML =
      '<img src="assets/system/icons/tango2kde/16x16/apps/kmix.png" alt="" width="14" height="14">';
    var headerText = document.createElement("span");
    headerText.style.cssText = "font-weight:bold;color:#000;font-size:11px;";
    headerText.textContent = "Volume";
    header.appendChild(headerText);
    p.appendChild(header);

    var row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:6px;";

    var muteBtn = document.createElement("span");
    muteBtn.style.cssText =
      "cursor:pointer;display:flex;align-items:center;padding:2px;";
    muteBtn.innerHTML =
      '<img src="assets/system/icons/tango2kde/16x16/apps/kmix.png" alt="" width="10" height="10" style="opacity:0.6;">';
    row.appendChild(muteBtn);

    var sliderWrap = document.createElement("div");
    sliderWrap.style.cssText =
      "position:relative;flex:1;height:26px;user-select:none;cursor:pointer;";

    var trackEl = document.createElement("div");
    trackEl.style.cssText =
      "position:absolute;top:11px;left:0;right:0;height:6px;background:#b0aca4;border:1px solid #6a6660;border-radius:0;box-shadow:inset 0 1px 2px rgba(0,0,0,0.15);pointer-events:none;";

    var fillEl = document.createElement("div");
    fillEl.style.cssText =
      "position:absolute;top:0;left:0;height:100%;background:#000080;pointer-events:none;";

    var thumbEl = document.createElement("div");
    thumbEl.style.cssText =
      "position:absolute;top:5px;width:16px;height:16px;background:#d4d0c8;border-top:2px solid #fff;border-left:2px solid #fff;border-right:2px solid #505050;border-bottom:2px solid #505050;box-shadow:inset -1px -1px 0 #888480;margin-left:-8px;box-sizing:border-box;cursor:pointer;";

    trackEl.appendChild(fillEl);
    sliderWrap.appendChild(trackEl);
    sliderWrap.appendChild(thumbEl);

    function setSliderVisual(val) {
      var pct = val / 100;
      fillEl.style.width = pct * 100 + "%";
      thumbEl.style.left = pct * 100 + "%";
    }

    function snapAndSet(val) {
      var snapped = Math.max(0, Math.min(100, val));
      setSliderVisual(snapped);
      setVolume(snapped / 100);
      pctLabel.textContent = Math.round(snapped) + "%";
      updateVolIcon();
    }

    var _sliderDragging = false;
    var _sliderDragStartX = 0;
    var _sliderDragStartVal = 0;
    function sliderPointer(e) {
      var rect = sliderWrap.getBoundingClientRect();
      var pct = (e.clientX - rect.left) / rect.width;
      snapAndSet(pct * 100);
    }

    thumbEl.addEventListener("mousedown", function (e) {
      e.preventDefault();
      _sliderDragging = true;
      _sliderDragStartX = e.clientX;
      _sliderDragStartVal = _volume;
      document.addEventListener("mousemove", _sliderOnMove);
      document.addEventListener("mouseup", _sliderOnUp);
    });

    function _sliderOnMove(e) {
      if (!_sliderDragging) return;
      var rect = sliderWrap.getBoundingClientRect();
      var deltaPx = e.clientX - _sliderDragStartX;
      var deltaPct = deltaPx / rect.width;
      var currentPct = _sliderDragStartVal * 100;
      var newPct = Math.max(0, Math.min(100, currentPct + deltaPct * 100));
      snapAndSet(newPct);
    }
    function _sliderOnUp() {
      _sliderDragging = false;
      document.removeEventListener("mousemove", _sliderOnMove);
      document.removeEventListener("mouseup", _sliderOnUp);
    }

    setSliderVisual(Math.round((_volume * 100) / 5) * 5);

    row.appendChild(sliderWrap);

    var maxBtn = document.createElement("span");
    maxBtn.style.cssText = "display:flex;align-items:center;padding:2px;";
    maxBtn.innerHTML =
      '<img src="assets/system/icons/tango2kde/22x22/apps/kmix.png" alt="" width="14" height="14">';
    row.appendChild(maxBtn);

    p.appendChild(row);

    var pctLabel = document.createElement("div");
    pctLabel.id = "volPct";
    pctLabel.style.cssText =
      "text-align:center;margin-top:3px;font-size:11px;color:#444;";
    pctLabel.textContent = Math.round((_volume * 100) / 5) * 5 + "%";
    p.appendChild(pctLabel);

    document.body.appendChild(p);

    muteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (_volume > 0) {
        sliderWrap._prevVol = _volume;
        setVolume(0);
      } else {
        setVolume(sliderWrap._prevVol || 1.0);
      }
      var snapped = Math.round((_volume * 100) / 5) * 5;
      setSliderVisual(snapped);
      pctLabel.textContent = snapped + "%";
      updateVolIcon();
    });

    return p;
  }

  function updateVolIcon() {
    volIcon.innerHTML = "";
    if (_volume === 0) {
      var wrap = document.createElement("span");
      wrap.style.cssText = "position:relative;display:inline-flex;";
      var img = document.createElement("img");
      img.src = "assets/system/icons/tango2kde/22x22/apps/kmix.png";
      img.alt = "";
      img.width = 18;
      img.height = 18;
      wrap.appendChild(img);
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 18 18");
      svg.style.cssText =
        "position:absolute;top:0;left:0;width:18px;height:18px;";
      var l1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l1.setAttribute("x1", "5");
      l1.setAttribute("y1", "5");
      l1.setAttribute("x2", "13");
      l1.setAttribute("y2", "13");
      l1.setAttribute("stroke", "#c00");
      l1.setAttribute("stroke-width", "2");
      l1.setAttribute("stroke-linecap", "square");
      svg.appendChild(l1);
      var l2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l2.setAttribute("x1", "13");
      l2.setAttribute("y1", "5");
      l2.setAttribute("x2", "5");
      l2.setAttribute("y2", "13");
      l2.setAttribute("stroke", "#c00");
      l2.setAttribute("stroke-width", "2");
      l2.setAttribute("stroke-linecap", "square");
      svg.appendChild(l2);
      wrap.appendChild(svg);
      volIcon.appendChild(wrap);
    } else {
      var img = document.createElement("img");
      img.src = "assets/system/icons/tango2kde/22x22/apps/kmix.png";
      img.alt = "";
      img.width = 18;
      img.height = 18;
      volIcon.appendChild(img);
    }
  }

  if (volIcon) {
    volIcon.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!volPanel) volPanel = buildVolumePanel();
      if (calPanel) calPanel.style.display = "none";
      volPanel.style.display =
        volPanel.style.display === "none" ? "block" : "none";
    });
  }

  /* ===== Calendar popup ===== */
  var clockEl = document.getElementById("taskbarClock");
  var calPanel = null;
  var calDate = new Date();

  var MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  var DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function buildCalendar() {
    var p = document.createElement("div");
    p.id = "calendarPanel";
    p.style.cssText =
      "position:fixed;bottom:42px;right:10px;background:#ece9e0;border:2px solid;border-color:#fff #5a5a5a #5a5a5a #fff;z-index:99999;display:none;font-family:Tahoma,sans-serif;font-size:12px;box-shadow:2px -2px 4px rgba(0,0,0,0.15);user-select:none;";
    document.body.appendChild(p);
    return p;
  }

  function renderCalendar() {
    if (!calPanel) calPanel = buildCalendar();
    var y = calDate.getFullYear();
    var m = calDate.getMonth();
    var today = new Date();

    var firstDay = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    var html = '<div style="padding:8px 10px;min-width:210px;">';

    // header with nav
    html +=
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #c0bcb4;">';
    html +=
      '<span style="cursor:pointer;padding:2px 8px;font-size:12px;font-weight:bold;border:1px solid #888;border-color:#fff #5a5a5a #5a5a5a #fff;background:#d4d0c8;" id="calPrev">◀</span>';
    html +=
      '<span style="font-weight:bold;font-size:13px;color:#000080;">' +
      MONTHS[m] +
      " " +
      y +
      "</span>";
    html +=
      '<span style="cursor:pointer;padding:2px 8px;font-size:12px;font-weight:bold;border:1px solid #888;border-color:#fff #5a5a5a #5a5a5a #fff;background:#d4d0c8;" id="calNext">▶</span>';
    html += "</div>";

    // day headers
    html +=
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;font-weight:bold;color:#000080;font-size:11px;margin-bottom:3px;">';
    for (var d = 0; d < 7; d++) {
      html += '<div style="padding:2px 0;">' + DAYS[d] + "</div>";
    }
    html += "</div>";

    // day grid
    html +=
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;font-size:12px;">';
    for (var i = 0; i < firstDay; i++) {
      html += "<div></div>";
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var isToday =
        y === today.getFullYear() &&
        m === today.getMonth() &&
        day === today.getDate();
      var style = "padding:3px 0;";
      if (isToday) {
        style += "background:#000080;color:#fff;font-weight:bold;";
      } else {
        style += "color:#000;";
      }
      html += '<div style="' + style + '">' + day + "</div>";
    }
    html += "</div>";

    html += "</div>";
    calPanel.innerHTML = html;

    document.getElementById("calPrev").addEventListener("click", function (e) {
      e.stopPropagation();
      calDate.setMonth(calDate.getMonth() - 1);
      renderCalendar();
    });
    document.getElementById("calNext").addEventListener("click", function (e) {
      e.stopPropagation();
      calDate.setMonth(calDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (clockEl) {
    clockEl.style.cursor = "pointer";
    clockEl.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!calPanel) {
        calPanel = buildCalendar();
        calDate = new Date();
      }
      renderCalendar();
      if (volPanel) volPanel.style.display = "none";
      calPanel.style.display =
        calPanel.style.display === "none" ? "block" : "none";
    });
  }

  // Close panels on outside click
  document.addEventListener(
    "click",
    function (e) {
      if (
        e.target &&
        e.target.closest &&
        (e.target.closest("#calendarPanel") ||
          e.target.closest("#volumePanel") ||
          e.target.closest("#taskbarClock") ||
          e.target.closest("#trayVolume"))
      )
        return;
      if (calPanel) calPanel.style.display = "none";
      if (volPanel) volPanel.style.display = "none";
    },
    true,
  );

  /* ===== Expose volume for beep/audio commands ===== */
  window.playBeep = function (freq, dur) {
    try {
      var ctx = getAudioCtx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq || 800;
      gain.gain.value = 0.1 * _volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (dur || 0.15));
    } catch (e) {}
  };
})();
