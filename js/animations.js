(function() {
'use strict';

var _interval = null;
var _frame = 0;

var palettes = {
  fire: ['#fff','#ff0','#f80','#f40','#c00','#800','#400','#200'],
  matrix: ['#0f0','#0c0','#090','#060','#030'],
  ocean: ['#0ff','#08f','#06f','#04f','#02f','#00f'],
  neon: ['#f0f','#0ff','#ff0','#f00','#0f0','#00f'],
  heat: ['#fff','#ff0','#f90','#f60','#c00','#800'],
  ice: ['#fff','#def','#adf','#7bf','#49f','#17f'],
  sunset: ['#fff','#fd0','#f80','#f40','#a0a','#606'],
  mono: ['#fff','#ccc','#999','#666','#333'],
};

function playAnimation(name) {
  var anim = anims[name];
  if (!anim) return;
  stopAnimation();
  _frame = 0;

  var overlay = document.createElement('div');
  overlay.id = 'animOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:#111;border:2px solid #555;padding:8px;text-align:center;box-shadow:0 0 20px rgba(0,255,0,0.2);';
  var header = document.createElement('div');
  header.style.cssText = 'font-family:Tahoma,sans-serif;font-size:12px;font-weight:bold;color:#0f0;margin-bottom:4px;';
  header.textContent = anim.name;
  box.appendChild(header);
  var pre = document.createElement('pre');
  pre.id = 'animPre';
  pre.style.cssText = 'margin:0;padding:6px;font-size:12px;line-height:1.1;background:#000;';
  box.appendChild(pre);
  var footer = document.createElement('div');
  footer.style.cssText = 'font-family:Tahoma,sans-serif;font-size:10px;color:#666;margin-top:4px;';
  footer.textContent = 'ESC to close';
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  document.addEventListener('keydown', _animKey);

  if (anim.generator) {
    anim.generator(pre, anim);
  } else {
    _interval = setInterval(function() {
      if (_frame >= anim.frames.length) _frame = 0;
      renderFrame(pre, anim.frames[_frame], anim.palette || palettes.mono, anim.charColors);
      _frame++;
    }, anim.delay || 100);
  }
}

function stopAnimation() {
  if (_interval) { clearInterval(_interval); _interval = null; }
  document.removeEventListener('keydown', _animKey);
  var ov = document.getElementById('animOverlay');
  if (ov) ov.remove();
}

function _animKey(e) {
  if (e.key === 'Escape') stopAnimation();
}

function renderFrame(pre, frame, palette, charColors) {
  if (!pre) return;
  var html = '';
  for (var i = 0; i < frame.length; i++) {
    var ch = frame[i];
    if (ch === '\n') { html += '\n'; continue; }
    var color;
    if (charColors) {
      color = charColors[ch] || charColors['default'] || '#0f0';
    } else {
      var idx = ch.charCodeAt(0) % palette.length;
      color = palette[idx];
    }
    html += '<span style="color:' + color + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>';
  }
  pre.innerHTML = html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ===== ALGORITHMIC ANIMATIONS ===== */

function genDonut(pre, anim) {
  var A = 0, B = 0;
  var palette = anim.palette || palettes.heat;
  _interval = setInterval(function() {
    A += 0.07; B += 0.03;
    var b = [];
    var z = [];
    for (var y = 0; y < 22; y++) { b[y] = []; for (var x = 0; x < 80; x++) b[y][x] = ' '; z[y] = []; for (var x = 0; x < 80; x++) z[y][x] = 0; }
    for (var j = 0; j < 6.28; j += 0.07) {
      var ct = Math.cos(j), st = Math.sin(j);
      for (var i = 0; i < 6.28; i += 0.02) {
        var cp = Math.cos(i), sp = Math.sin(i);
        var h = ct + 2;
        var D = 1 / (sp * h * Math.sin(A) + ct * Math.cos(A) + 5);
        var t = sp * h * Math.cos(A) - ct * Math.sin(A);
        var x = Math.floor(40 + 30 * D * (cp * h * Math.cos(B) - t * Math.sin(B)));
        var y = Math.floor(12 + 15 * D * (cp * h * Math.sin(B) + t * Math.cos(B)));
        var o = x + 80 * y;
        var N = Math.floor(8 * ((st * Math.sin(A) - sp * ct * Math.cos(A)) * Math.cos(B) - sp * ct * Math.sin(A) - st * Math.cos(A) - cp * ct * Math.sin(B)));
        if (y > 0 && y < 22 && x > 0 && x < 80 && D > z[y][x]) {
          z[y][x] = D;
          b[y][x] = '.,-~:;=!*#$@'[N > 0 ? N : 0];
        }
      }
    }
    var html = '';
    for (var y = 0; y < 22; y++) {
      for (var x = 0; x < 80; x++) {
        var ch = b[y][x];
        var c = palette[ch === ' ' ? 0 : ch.charCodeAt(0) % palette.length];
        html += '<span style="color:' + c + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 50);
}

function genMatrix(pre, anim) {
  var cols = [];
  var palette = anim.palette || palettes.matrix;
  for (var i = 0; i < 60; i++) cols[i] = Math.floor(Math.random() * 20);
  _interval = setInterval(function() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|!@#$%^&*()_+';
    var html = '';
    for (var y = 0; y < 24; y++) {
      for (var x = 0; x < 60; x++) {
        var drop = cols[x];
        var dist = drop - y;
        if (dist < 0) { html += '&nbsp;'; continue; }
        var ch = chars[Math.floor(Math.random() * chars.length)];
        if (dist < 2) html += '<span style="color:' + palette[0] + '">' + ch + '</span>';
        else if (dist < 4) html += '<span style="color:' + palette[1] + '">' + ch + '</span>';
        else html += '<span style="color:' + palette[2] + '">' + ch + '</span>';
      }
      html += '\n';
      if (y === 23) {
        for (var i = 0; i < 60; i++) {
          cols[i]--;
          if (cols[i] < 0) cols[i] = 20 + Math.floor(Math.random() * 10);
        }
      }
    }
    pre.innerHTML = html;
  }, 80);
}

function genFire(pre, anim) {
  var w = 60, h = 20;
  var grid = [];
  for (var i = 0; i < w * h; i++) grid[i] = 0;
  var palette = anim.palette || palettes.fire;
  _interval = setInterval(function() {
    for (var x = 0; x < w; x++) grid[(h-1)*w + x] = Math.random() > 0.3 ? 7 : 0;
    for (var y = h-2; y >= 0; y--) {
      for (var x = 0; x < w; x++) {
        var src = y * w + x;
        var decay = Math.floor(Math.random() * 2);
        var offset = Math.floor(Math.random() * 3) - 1;
        var src2 = Math.min(Math.max(x + offset, 0), w - 1) + (y + 1) * w;
        grid[src] = Math.max(0, grid[src2] - decay);
      }
    }
    var html = '';
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var v = grid[y * w + x];
        var ch = ' .:!*#$@'[v] || ' ';
        var c = palette[v] || '#000';
        html += '<span style="color:' + c + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 60);
}

function genStars(pre, anim) {
  var stars = [];
  for (var i = 0; i < 100; i++) stars.push({x:Math.random()*60, y:Math.random()*20, z:Math.random()*10+1});
  var palette = anim.palette || palettes.ice;
  _interval = setInterval(function() {
    var html = '';
    for (var y = 0; y < 20; y++) {
      for (var x = 0; x < 60; x++) {
        var drawn = false;
        for (var s = 0; s < stars.length; s++) {
          var sx = Math.floor(stars[s].x), sy = Math.floor(stars[s].y);
          if (sx === x && sy === y) {
            var b = Math.min(Math.floor(stars[s].z), palette.length-1);
            html += '<span style="color:' + palette[b] + '">*</span>';
            drawn = true;
            break;
          }
        }
        if (!drawn) html += '&nbsp;';
      }
      html += '\n';
    }
    pre.innerHTML = html;
    for (var i = 0; i < stars.length; i++) {
      stars[i].x += (stars[i].x - 30) / stars[i].z * 0.5;
      stars[i].y += (stars[i].y - 10) / stars[i].z * 0.5;
      stars[i].z -= 0.1;
      if (stars[i].z < 0.5 || stars[i].x < 0 || stars[i].x >= 60 || stars[i].y < 0 || stars[i].y >= 20) {
        stars[i] = {x:30 + (Math.random()-0.5)*10, y:10 + (Math.random()-0.5)*5, z:10 + Math.random()*5};
      }
    }
  }, 80);
}

function genPlasma(pre, anim) {
  var t = 0;
  var palette = anim.palette || palettes.neon;
  _interval = setInterval(function() {
    t += 0.1;
    var html = '';
    for (var y = 0; y < 20; y++) {
      for (var x = 0; x < 60; x++) {
        var v = Math.sin(x * 0.2 + t) + Math.sin(y * 0.15 + t * 0.7) + Math.sin((x + y) * 0.12 + t * 0.5);
        v = Math.floor(((v + 3) / 6) * palette.length);
        v = Math.max(0, Math.min(v, palette.length - 1));
        var ch = ' .,-~:;=!#$@'[v % 12];
        html += '<span style="color:' + palette[v] + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 70);
}

function genWave(pre, anim) {
  var t = 0;
  var palette = anim.palette || palettes.ocean;
  _interval = setInterval(function() {
    t += 0.2;
    var html = '';
    for (var y = 0; y < 20; y++) {
      for (var x = 0; x < 60; x++) {
        var v = Math.sin(x * 0.15 + t + y * 0.1);
        var amp = Math.sin(y * 0.3 + t * 0.5) * 5;
        var dist = Math.abs(y - 10 - Math.sin(x * 0.1 + t) * 4 - amp);
        var ch = ' ';
        if (dist < 1) ch = '@';
        else if (dist < 2) ch = '#';
        else if (dist < 3) ch = '~';
        else if (dist < 4) ch = '-';
        var ci = Math.floor(((v + 1) / 2) * (palette.length-1));
        html += '<span style="color:' + palette[ci] + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 70);
}

function genSpiral(pre, anim) {
  var t = 0;
  var palette = anim.palette || palettes.neon;
  _interval = setInterval(function() {
    t += 0.15;
    var html = '';
    for (var y = 0; y < 22; y++) {
      for (var x = 0; x < 60; x++) {
        var dx = x - 30, dy = y - 11;
        var dist = Math.sqrt(dx*dx + dy*dy);
        var angle = Math.atan2(dy, dx) + t;
        var v = Math.sin(angle * 3 - dist * 0.4 + t * 0.5);
        var ch = ' ';
        if (v > 0.3) ch = '#';
        else if (v > 0) ch = '*';
        else if (v > -0.3) ch = '.';
        var ci = Math.floor(((Math.sin(angle * 2 + t) + 1) / 2) * (palette.length-1));
        html += '<span style="color:' + palette[ci] + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 70);
}

function genGalaxy(pre, anim) {
  var t = 0;
  var palette = anim.palette || palettes.sunset;
  _interval = setInterval(function() {
    t += 0.05;
    var html = '';
    for (var y = 0; y < 22; y++) {
      for (var x = 0; x < 60; x++) {
        var dx = x - 30, dy = y - 11;
        var dist = Math.sqrt(dx*dx + dy*dy);
        var angle = Math.atan2(dy, dx) + t;
        var v = Math.cos(dist * 0.3 - angle * 2 + t) * Math.exp(-dist * 0.04);
        var ch = ' ';
        if (v > 0.5) ch = '#';
        else if (v > 0.2) ch = '*';
        else if (v > 0.05) ch = '.';
        var ci = Math.floor(((Math.sin(dist * 0.1 + angle + t) + 1) / 2) * (palette.length-1));
        html += '<span style="color:' + palette[ci] + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 80);
}

function genTunnel(pre, anim) {
  var t = 0;
  var palette = anim.palette || palettes.neon;
  _interval = setInterval(function() {
    t += 0.1;
    var html = '';
    for (var y = 0; y < 22; y++) {
      for (var x = 0; x < 60; x++) {
        var dx = x - 30, dy = y - 11;
        var dist = Math.sqrt(dx*dx + dy*dy);
        var angle = Math.atan2(dy, dx);
        var warp = Math.sin(dist * 0.3 - t * 2) * 3;
        var v = Math.sin((dist + t * 5) * 0.2 + angle * 4 + warp);
        var ch = ' .,-~:;=!*#$@'[Math.floor(((v + 1) / 2) * 11)];
        var ci = Math.floor(((Math.sin(dist * 0.1 - t * 0.5) + 1) / 2) * (palette.length-1));
        html += '<span style="color:' + palette[ci] + '">' + (ch === ' ' ? '&nbsp;' : ch) + '</span>';
      }
      html += '\n';
    }
    pre.innerHTML = html;
  }, 60);
}

/* ===== FRAME-BASED ANIMATIONS ===== */

function genRain(pre, anim) {
  var drops = [];
  for (var i = 0; i < 30; i++) drops.push({x:Math.random()*60, y:Math.random()*20, s:1+Math.random()*3});
  var palette = anim.palette || palettes.ocean;
  _interval = setInterval(function() {
    var html = '';
    for (var y = 0; y < 20; y++) {
      for (var x = 0; x < 60; x++) {
        var drawn = false;
        for (var d = 0; d < drops.length; d++) {
          var dx = Math.floor(drops[d].x), dy = Math.floor(drops[d].y);
          if (dx === x && (dy === y || (drops[d].s > 1 && dy+1 === y))) {
            html += '<span style="color:' + palette[drops[d].s > 2 ? palette.length-1 : palette.length-2] + '">|</span>';
            drawn = true; break;
          }
        }
        if (!drawn) html += '&nbsp;';
      }
      html += '\n';
    }
    pre.innerHTML = html;
    for (var i = 0; i < drops.length; i++) {
      drops[i].y += drops[i].s * 0.3;
      drops[i].x += (Math.random() - 0.5) * 0.3;
      if (drops[i].y > 20) { drops[i].y = 0; drops[i].x = Math.random() * 60; }
    }
  }, 80);
}

function genSnow(pre, anim) {
  var flakes = [];
  for (var i = 0; i < 40; i++) flakes.push({x:Math.random()*60, y:Math.random()*20, t:Math.random()*6.28});
  var palette = anim.palette || palettes.ice;
  _interval = setInterval(function() {
    var html = '';
    for (var y = 0; y < 20; y++) {
      for (var x = 0; x < 60; x++) {
        var drawn = false;
        for (var f = 0; f < flakes.length; f++) {
          if (Math.floor(flakes[f].x) === x && Math.floor(flakes[f].y) === y) {
            html += '<span style="color:' + palette[0] + '">*</span>';
            drawn = true; break;
          }
        }
        if (!drawn) html += '&nbsp;';
      }
      html += '\n';
    }
    pre.innerHTML = html;
    for (var i = 0; i < flakes.length; i++) {
      flakes[i].y += 0.08 + Math.random() * 0.05;
      flakes[i].t += 0.05;
      flakes[i].x += Math.sin(flakes[i].t) * 0.3;
      if (flakes[i].y > 20) { flakes[i].y = 0; flakes[i].x = Math.random() * 60; }
    }
  }, 100);
}

var anims = {
  donut: { name:'Spinning Donut', generator:genDonut, palette:palettes.heat },
  matrix: { name:'Matrix Rain', generator:genMatrix, palette:palettes.matrix },
  fire: { name:'Fire', generator:genFire, palette:palettes.fire },
  stars: { name:'Starfield', generator:genStars, palette:palettes.ice },
  plasma: { name:'Plasma', generator:genPlasma, palette:palettes.neon },
  wave: { name:'Ocean Wave', generator:genWave, palette:palettes.ocean },
  spiral: { name:'Spiral', generator:genSpiral, palette:palettes.neon },
  galaxy: { name:'Galaxy', generator:genGalaxy, palette:palettes.sunset },
  tunnel: { name:'Tunnel', generator:genTunnel, palette:palettes.neon },
  rain: { name:'Rain', generator:genRain, palette:palettes.ocean },
  snow: { name:'Snowfall', generator:genSnow, palette:palettes.ice },

  heart: { name:'Heartbeat',
    frames: [
'  xxxx       xxxx  \n xxxxxx     xxxxxx \nxxxxxxxx   xxxxxxxx\nxxxxxxxxx xxxxxxxxx\nxxxxxxxxxxxxxxxxxxx\n xxxxxxxxxxxxxxxxx \n  xxxxxxxxxxxxxxx  \n   xxxxxxxxxxxxx   \n    xxxxxxxxxxx    \n     xxxxxxxxx     \n      xxxxxxx      \n       xxxxx       \n        xxx        \n         x         ',
'  xxxx       xxxx  \n xxxxxx     xxxxxx \nxxxxxxxx   xxxxxxxx\nxxxxxxxxx xxxxxxxxx\nxxxxxxxxxxxxxxxxxxx\n xxxxxxxxxxxxxxxxx \n  xxxxxxxxxxxxxxx  \n   xxxxxxxxxxxxx   \n    xxxxxxxxxxx    \n     xxxxxxxxx     \n      xxxxxxx      \n       xxxxx       \n        xxx        \n         x         ',
'  xxxx       xxxx  \n xxxxxx     xxxxxx \nxxxxxxxx   xxxxxxxx\nxxxxxxxxx xxxxxxxxx\nxxxxxxxxxxxxxxxxxxx\n xxxxxxxxxxxxxxxxx \n  xxxxxxxxxxxxxxx  \n   xxxxxxxxxxxxx   \n    xxxxxxxxxxx    \n     xxxxxxxxx     \n      xxxxxxx      \n       xxxxx       \n        xxx        \n         x         ',
'   xx         xx   \n  xxxx       xxxx  \n xxxxxx     xxxxxx \n xxxxxxx   xxxxxxx \n xxxxxxxxxxxxxxxxx \n  xxxxxxxxxxxxxxx  \n   xxxxxxxxxxxxx   \n    xxxxxxxxxxx    \n     xxxxxxxxx     \n      xxxxxxx      \n       xxxxx       \n        xxx        \n         x         \n                   ',
'                   \n   xx         xx   \n  xxxx       xxxx  \n xxxxxx     xxxxxx \n xxxxxxx   xxxxxxx \n  xxxxxxxxxxxxxxx  \n   xxxxxxxxxxxxx   \n    xxxxxxxxxxx    \n     xxxxxxxxx     \n      xxxxxxx      \n       xxxxx       \n        xxx        \n         x         \n                   ',
'                   \n                   \n   xx         xx   \n  xxxx       xxxx  \n xxxxxx     xxxxxx \n  xxxxxxxxxxxxxxx  \n   xxxxxxxxxxxxx   \n    xxxxxxxxxxx    \n     xxxxxxxxx     \n      xxxxxxx      \n       xxxxx       \n        xxx        \n         x         \n                   ',
    ], palette:palettes.fire, delay:300, charColors:{'x':'#f00',' ':'#000'} },

  bounce: { name:'Bouncing Ball',
    frames: [
'                    \n                    \n                    \n                    \n                    \n         @          \n                    \n                    \n                    \n                    \n___\\________/___\n',
'                    \n                    \n                    \n         @          \n                    \n                    \n                    \n                    \n                    \n___\\________/___\n                    \n',
'                    \n                    \n         @          \n                    \n                    \n                    \n                    \n                    \n___\\________/___\n                    \n                    \n',
'                    \n         @          \n                    \n                    \n                    \n                    \n                    \n___\\________/___\n                    \n                    \n                    \n',
'         @          \n                    \n                    \n                    \n                    \n                    \n___\\________/___\n                    \n                    \n                    \n                    \n',
'         @          \n                    \n                    \n                    \n                    \n         @          \n                    \n                    \n                    \n                    \n___\\________/___\n',
    ], palette:palettes.mono, delay:150, charColors:{'@':'#ff0','_':'#666','\\':'#666','/':'#666','#':'#666'} },



  loader: { name:'Loading',
    frames: [
'  +-----------------+\n  |                 |\n  |    [##]         |\n  |                 |\n  +-----------------+\n       Loading...',
'  +-----------------+\n  |                 |\n  |    [####]       |\n  |                 |\n  +-----------------+\n       Loading...',
'  +-----------------+\n  |                 |\n  |    [######]     |\n  |                 |\n  +-----------------+\n       Loading...',
'  +-----------------+\n  |                 |\n  |    [########]   |\n  |                 |\n  +-----------------+\n       Loading...',
'  +-----------------+\n  |                 |\n  |    [##########] |\n  |                 |\n  +-----------------+\n       Loading...',
'  +-----------------+\n  |                 |\n  |    [############]|\n  |                 |\n  +-----------------+\n       Loading...',
'  +-----------------+\n  |                 |\n  |    [############]|\n  |                 |\n  +-----------------+\n       Complete!',
    ], palette:palettes.mono, delay:300, charColors:{'#':'#0f0','[':'#0f0',']':'#0f0','|':'#0f0','-':'#0f0','+':'#0f0'} },

  rocket: { name:'Rocket Launch',
    frames: [
'       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    \n     xxxxxxx     \n      xxxxx      \n       xxx       \n        x        \n                 \n                 \n                 ',
'       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    \n     xxxxxxx     \n      xxxxx      \n       xxx       \n        x        \n                 \n                 \n                 ',
'       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    \n     xxxxxxx     \n      xxxxx      \n       xxx       \n        x        \n                 \n                 \n                 ',
'                 \n       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    \n     xxxxxxx     \n      xxxxx      \n       xxx       \n        x        \n                 \n                 ',
'                 \n                 \n       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    \n     xxxxxxx     \n      xxxxx      \n       xxx       \n        x        \n                 ',
'                 \n                 \n                 \n                 \n       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    \n     xxxxxxx     \n      xxxxx      \n       xxx       ',
'                 \n                 \n                 \n                 \n                 \n                 \n                 \n       /|\\       \n      / | \\      \n     /  |  \\     \n    /   |   \\    \n   /    |    \\   \n  /     |     \\  \n /      |      \\ \n/_______|_______\\\n   xxxxxxxxxxx   \n    xxxxxxxxx    ',
    ], palette:palettes.mono, delay:300, charColors:{'/':'#f80','\\':'#f80','|':'#f80','x':'#f40','_':'#f80','=':'#f80'} },

  dragon: { name:'Dragon',
    frames: [
'           __   __  \n          /  \\ /  \\ \n      __.0|    |0.__\n     /  \\\\|    |//  \\\n    |    \\\\    //    |\n    |     \\\\  //     |\n     \\     \\\\//     /\n      \\  ==/\\/==  /\n       \\/  \\/  \\/ \n        \\______/  \n        /      \\   \n       / ~~~~~~ \\  \n      (  )====(  ) \n       \\_/    \\_/  ',
'           __   __  \n          /  \\ /  \\ \n      __.0|    |0.__\n     /  \\\\|    |//  \\\n    |    \\\\    //    |\n    |     \\\\  //     |\n     \\     \\\\//     /\n      \\  ==/\\/==  /\n       \\/  \\/  \\/ \n        \\______/  \n     ~~~\\      /~~~\n     ~~~~\\~~~~/~~~~\n     ~~~~( )==( )~~\n         \\_/  \\_/  ',
'           __   __  \n          /  \\ /  \\ \n      __.0|    |0.__\n     /  \\\\|    |//  \\\n    |    \\\\    //    |\n    |     \\\\  //     |\n     \\     \\\\//     /\n      \\  ==/\\/==  /\n       \\/  \\/  \\/ \n        \\______/  \n  ~~~~~~~\\      /~~\n  ~~~~~~~~\\~~~~/~~~\n  ~~~~~~~~( )==( )~\n          \\_/  \\_/  ',
'           __   __  \n          /  \\ /  \\ \n      __.0|    |0.__\n     /  \\\\|    |//  \\\n    |    \\\\    //    |\n    |     \\\\  //     |\n     \\     \\\\//     /\n      \\  ==/\\/==  /\n       \\/  \\/  \\/ \n        \\______/  \n  ~\\      /      \\\n  ~~\\    / ~~~~~~ \\\n  ~~( )==(  )====( )\n    \\_/   \\_/      ',
'           __   __  \n          /  \\ /  \\ \n      __.0|    |0.__\n     /  \\\\|    |//  \\\n    |    \\\\    //    |\n    |     \\\\  //     |\n     \\     \\\\//     /\n      \\  ==/\\/==  /\n       \\/  \\/  \\/ \n        \\______/  \n        /      \\   \n       / ~~~~~~ \\  \n      (  )====(  ) \n       \\_/    \\_/  ',
    ], palette:palettes.mono, delay:400, charColors:{'0':'#ff0','.':'#ff0','|':'#0f0','/':'#0f0','\\':'#0f0','~':'#f80','(':'#f80',')':'#f80','=':'#f80'} },
};

window.playAnimation = playAnimation;
window.stopAnimation = stopAnimation;
window.animations = anims;

})();
