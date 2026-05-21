(function() {
  "use strict";

  var _volume = parseFloat(localStorage.getItem('win2k_volume') || '1');
  var _audioCtx = null;

  function getAudioCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  window.getPageVolume = function() { return _volume; };

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('win2k_volume', _volume);
  }

  /* ===== Clock update ===== */
  function updateClocks() {
    var now = new Date();
    var t = String(now.getHours()).padStart(2, "0") + ":" +
            String(now.getMinutes()).padStart(2, "0");
    var el = document.getElementById("taskbarClock");
    if (el) el.textContent = t;
  }
  updateClocks();
  setInterval(updateClocks, 1000);

  /* ===== Volume control ===== */
  var volIcon = document.getElementById('trayVolume');
  var volPanel = null;

  function buildVolumePanel() {
    var p = document.createElement('div');
    p.id = 'volumePanel';
    p.style.cssText = 'position:fixed;bottom:42px;right:10px;background:#ece9e0;border:2px solid;border-color:#fff #5a5a5a #5a5a5a #fff;padding:10px 14px;z-index:99999;display:none;font-family:Tahoma,sans-serif;font-size:12px;min-width:160px;box-shadow:2px -2px 4px rgba(0,0,0,0.15);';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #c0bcb4;';
    header.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><polygon points="3,4 5,4 8,2 8,14 5,12 3,12" fill="#666"/><rect x="10" y="6" width="2" height="4" fill="#888"/><rect x="12" y="5" width="1" height="6" fill="#888"/></svg>';
    var headerText = document.createElement('span');
    headerText.style.cssText = 'font-weight:bold;color:#000;font-size:12px;';
    headerText.textContent = 'Volume';
    header.appendChild(headerText);
    p.appendChild(header);

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;';

    var muteBtn = document.createElement('span');
    muteBtn.style.cssText = 'cursor:pointer;display:flex;align-items:center;padding:2px;';
    muteBtn.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><polygon points="2,3 4,3 7,1 7,11 4,9 2,9" fill="#666"/></svg>';
    muteBtn.title = 'Mudo';
    row.appendChild(muteBtn);

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = Math.round(_volume * 100);
    slider.style.cssText = 'flex:1;height:4px;cursor:pointer;';
    slider.addEventListener('input', function() {
      setVolume(this.value / 100);
      updateVolIcon();
    });
    row.appendChild(slider);

    var maxBtn = document.createElement('span');
    maxBtn.style.cssText = 'cursor:pointer;display:flex;align-items:center;padding:2px;';
    maxBtn.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><polygon points="2,3 4,3 7,1 7,11 4,9 2,9" fill="#666"/><rect x="8" y="4" width="2" height="4" fill="#888"/><rect x="10" y="3" width="1" height="6" fill="#888"/></svg>';
    maxBtn.title = 'Máximo';
    row.appendChild(maxBtn);

    p.appendChild(row);

    var pctLabel = document.createElement('div');
    pctLabel.id = 'volPct';
    pctLabel.style.cssText = 'text-align:center;margin-top:4px;font-size:11px;color:#444;';
    pctLabel.textContent = Math.round(_volume * 100) + '%';
    p.appendChild(pctLabel);

    document.body.appendChild(p);

    slider.addEventListener('input', function() {
      pctLabel.textContent = Math.round(this.value) + '%';
    });

    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (_volume > 0) {
        slider._prevVol = _volume;
        setVolume(0);
      } else {
        setVolume(slider._prevVol || 0.5);
      }
      slider.value = Math.round(_volume * 100);
      pctLabel.textContent = Math.round(_volume * 100) + '%';
      updateVolIcon();
    });

    return p;
  }

  function updateVolIcon() {
    if (_volume === 0) {
      volIcon.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><polygon points="2,3 4,3 7,1 7,11 4,9 2,9" fill="#999" stroke="#888" stroke-width="1"/><line x1="9" y1="3" x2="11" y2="9" stroke="#c00" stroke-width="1.5"/><line x1="11" y1="3" x2="9" y2="9" stroke="#c00" stroke-width="1.5"/></svg>';
    } else if (_volume < 0.5) {
      volIcon.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><polygon points="2,3 4,3 7,1 7,11 4,9 2,9" fill="#666" stroke="#444" stroke-width="1"/><rect x="8" y="4" width="2" height="4" fill="#888"/></svg>';
    } else {
      volIcon.innerHTML = '<svg viewBox="0 0 12 12" width="12" height="12"><polygon points="2,3 4,3 7,1 7,11 4,9 2,9" fill="#666" stroke="#444" stroke-width="1"/><rect x="8" y="4" width="2" height="4" fill="#888"/><rect x="10" y="3" width="1" height="6" fill="#888"/></svg>';
    }
  }

  if (volIcon) {
    volIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!volPanel) volPanel = buildVolumePanel();
      if (calPanel) calPanel.style.display = 'none';
      volPanel.style.display = volPanel.style.display === 'none' ? 'block' : 'none';
    });
  }

  /* ===== Calendar popup ===== */
  var clockEl = document.getElementById('taskbarClock');
  var calPanel = null;
  var calDate = new Date();

  var MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  function buildCalendar() {
    var p = document.createElement('div');
    p.id = 'calendarPanel';
    p.style.cssText = 'position:fixed;bottom:42px;right:10px;background:#ece9e0;border:2px solid;border-color:#fff #5a5a5a #5a5a5a #fff;z-index:99999;display:none;font-family:Tahoma,sans-serif;font-size:12px;box-shadow:2px -2px 4px rgba(0,0,0,0.15);user-select:none;';
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
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #c0bcb4;">';
    html += '<span style="cursor:pointer;padding:2px 8px;font-size:12px;font-weight:bold;border:1px solid #888;border-color:#fff #5a5a5a #5a5a5a #fff;background:#d4d0c8;" id="calPrev">◀</span>';
    html += '<span style="font-weight:bold;font-size:13px;color:#000080;">' + MONTHS[m] + ' ' + y + '</span>';
    html += '<span style="cursor:pointer;padding:2px 8px;font-size:12px;font-weight:bold;border:1px solid #888;border-color:#fff #5a5a5a #5a5a5a #fff;background:#d4d0c8;" id="calNext">▶</span>';
    html += '</div>';

    // day headers
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;font-weight:bold;color:#000080;font-size:11px;margin-bottom:3px;">';
    for (var d = 0; d < 7; d++) {
      html += '<div style="padding:2px 0;">' + DAYS[d] + '</div>';
    }
    html += '</div>';

    // day grid
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;text-align:center;font-size:12px;">';
    for (var i = 0; i < firstDay; i++) {
      html += '<div></div>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var isToday = (y === today.getFullYear() && m === today.getMonth() && day === today.getDate());
      var style = 'padding:3px 0;';
      if (isToday) {
        style += 'background:#000080;color:#fff;font-weight:bold;';
      } else {
        style += 'color:#000;';
      }
      html += '<div style="' + style + '">' + day + '</div>';
    }
    html += '</div>';

    html += '</div>';
    calPanel.innerHTML = html;

    document.getElementById('calPrev').addEventListener('click', function(e) {
      e.stopPropagation();
      calDate.setMonth(calDate.getMonth() - 1);
      renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', function(e) {
      e.stopPropagation();
      calDate.setMonth(calDate.getMonth() + 1);
      renderCalendar();
    });
  }

  if (clockEl) {
    clockEl.style.cursor = 'pointer';
    clockEl.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!calPanel) {
        calPanel = buildCalendar();
        calDate = new Date();
      }
      renderCalendar();
      if (volPanel) volPanel.style.display = 'none';
      calPanel.style.display = calPanel.style.display === 'none' ? 'block' : 'none';
    });
  }

  // Close panels on outside click
  document.addEventListener('click', function(e) {
    if (e.target && e.target.closest && (
      e.target.closest('#calendarPanel') ||
      e.target.closest('#volumePanel') ||
      e.target.closest('#taskbarClock') ||
      e.target.closest('#trayVolume')
    )) return;
    if (calPanel) calPanel.style.display = 'none';
    if (volPanel) volPanel.style.display = 'none';
  }, true);

  /* ===== Expose volume for beep/audio commands ===== */
  window.playBeep = function(freq, dur) {
    try {
      var ctx = getAudioCtx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq || 800;
      gain.gain.value = 0.1 * _volume;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (dur || 0.15));
    } catch(e) {}
  };
})();
