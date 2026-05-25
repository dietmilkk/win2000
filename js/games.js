(function () {
  "use strict";

  var gamesWin = document.getElementById("gamesWindow");
  var gamesBody = document.getElementById("gamesBody");
  var gamesDragHandle = document.getElementById("gamesDragHandle");
  var gamesBtnClose = document.getElementById("gamesBtnClose");
  var gamesBtnMinimize = document.getElementById("gamesBtnMinimize");
  var gamesBtnMaximize = document.getElementById("gamesBtnMaximize");

  var SNAKE_CELL = 28;
  var MAZE_CELL_SIZE = 44;
  var gameState = {};

  if (gamesBody) {
    gamesBody.style.padding = "0";
  }

  // FUNÇÃO CORRIGIDA: Limpa o container principal antes de renderizar novas telas
  function clearBody() {
    if (gamesBody) {
      gamesBody.innerHTML = "";
    }
  }

  function gamesReset() {
    if (gameState.cleanup) gameState.cleanup();
    gameState = {};
    showSelector();
  }

  var gamesBehavior = new WindowBehavior(gamesWin, {
    dragHandle: gamesDragHandle,
    btnClose: gamesBtnClose,
    btnMinimize: gamesBtnMinimize,
    btnMaximize: gamesBtnMaximize,
    minW: 520,
    minH: 400,
    taskbarIcon:
      '<img src="assets/system/icons/tango2kde/16x16/categories/applications-games.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: "Jogos",
    onShow: function () {
      gamesWin.style.width = "780px";
      gamesWin.style.height = "660px";
    },
    onHide: function () {
      gamesReset();
    },
  });

  window.gamesShowWindow = function () {
    gamesBehavior.show();
  };
  window.gamesMinimizeWindow = function () {
    gamesBehavior.minimize();
  };
  window.gamesHasEntry = function () {
    return gamesBehavior.hasTaskbarEntry();
  };

  window.showGames = function () {
    gamesBehavior.show();
  };

  if (typeof W2K !== "undefined" && W2K.AppRegistry) {
    W2K.AppRegistry.register("games", {
      label: "Jogos",
      show: function () {
        gamesBehavior.show();
      },
      minimize: function () {
        gamesBehavior.minimize();
      },
      hasEntry: function () {
        return gamesBehavior.hasTaskbarEntry();
      },
    });
  }

  var _selectorIdx = 0;
  var _gamesData = [
    {
      id: "snake",
      label: "Cobrinha",
      desc: "Pegue a comida sem bater na parede",
      icon: "S",
      controls: "Setas / WASD para mover | Espaço para pausar",
      color: "#0f0",
    },
    {
      id: "labirinto",
      label: "Labirinto",
      desc: "Fuja do labirinto ate a saida",
      icon: "M",
      controls: "W/A/S/D para mover | R para reiniciar",
      color: "#0cf",
    },
  ];

  function showSelector() {
    clearBody();
    gameState = {};
    _selectorIdx = 0;
    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText =
      "height:100%;box-sizing:border-box;display:flex;flex-direction:column;padding:12px;gap:10px;";

    var grid = document.createElement("div");
    grid.style.cssText =
      "display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;flex:1;align-content:start;";

    for (var i = 0; i < _gamesData.length; i++) {
      (function (g) {
        var block = document.createElement("div");
        block.className = "games-block";
        block.style.cssText =
          "background:#000080;color:#fff;font-family:'Courier New',monospace;font-size:14px;font-weight:bold;padding:20px 12px;text-align:center;cursor:pointer;border:2px solid;border-color:#0000c0 #000040 #000040 #0000c0;display:flex;align-items:center;justify-content:center;aspect-ratio:1;user-select:none;";
        block.textContent = g.label;
        block.addEventListener("click", function () {
          launchGame(g.id);
        });
        block.addEventListener("dblclick", function () {
          launchGame(g.id);
        });
        grid.appendChild(block);
      })(_gamesData[i]);
    }

    c.appendChild(grid);

    var foot = document.createElement("div");
    foot.style.cssText =
      "font-family:'Courier New',monospace;font-size:11px;color:#888;text-align:center;padding:4px 0;";
    foot.textContent = "Esc para voltar | Clique duas vezes para jogar";
    c.appendChild(foot);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", selKeyHandler);
    gameState.cleanup = function () {
      document.removeEventListener("keydown", selKeyHandler);
    };
  }

  function setSelector(idx) {
    _selectorIdx = idx;
    var blocks = document.querySelectorAll(".games-block");
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].style.outline = i === idx ? "3px solid #fff" : "none";
      blocks[i].style.outlineOffset = i === idx ? "-3px" : "0";
    }
  }

  function launchGame(id) {
    document.removeEventListener("keydown", selKeyHandler);
    if (id === "snake") startSnake();
    else startLabirinto();
  }

  function selKeyHandler(e) {
    var k = e.key;
    if (
      k === "ArrowUp" ||
      k === "ArrowDown" ||
      k === "ArrowLeft" ||
      k === "ArrowRight"
    ) {
      e.preventDefault();
      var cols = Math.floor(gamesBody.clientWidth / 160);
      if (cols < 1) cols = 1;
      var d = 0;
      if (k === "ArrowRight") d = 1;
      else if (k === "ArrowLeft") d = -1;
      else if (k === "ArrowDown") d = cols;
      else if (k === "ArrowUp") d = -cols;
      var next =
        (_selectorIdx + d + _gamesData.length * 10) % _gamesData.length;
      setSelector(next);
    } else if (k === "Enter") {
      e.preventDefault();
      launchGame(_gamesData[_selectorIdx].id);
    } else if (k === "Escape") {
      e.preventDefault();
      var w = gamesWin;
      // CORREÇÃO: Adicionado os parênteses () para executar a função de minimizar
      if (w && window.gamesMinimizeWindow) window.gamesMinimizeWindow();
    }
  }

  /* ================================================================
      Shared 3D Board Builder
     ================================================================ */
  function create3DBoard(rows, cols, getCellClass, cellSize) {
    if (!cellSize) cellSize = 18;
    var wrap = document.createElement("div");
    wrap.className = "games-board-3d";
    var grid = document.createElement("div");
    grid.className = "games-board-3d-inner";
    grid.id = "gameGrid";
    grid.style.gridTemplateColumns = "repeat(" + cols + "," + cellSize + "px)";
    grid.style.gridTemplateRows = "repeat(" + rows + "," + cellSize + "px)";
    grid.style.transform = "translate(0,0) rotateX(28deg)";
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var cell = document.createElement("div");
        cell.className =
          "games-cell " + (getCellClass(x, y) || "games-cell-empty");
        cell.id = "gc-" + x + "-" + y;
        grid.appendChild(cell);
      }
    }
    wrap.appendChild(grid);
    return wrap;
  }

  function update3DBoard(rows, cols, getCellClass) {
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var el = document.getElementById("gc-" + x + "-" + y);
        if (el)
          el.className =
            "games-cell " + (getCellClass(x, y) || "games-cell-empty");
      }
    }
  }

  /* ================================================================
      Smooth Camera System — player at bottom-center, looks ahead
      framerate-independent, two-stage smoothing
     ================================================================ */
  var _camX = 0,
    _camY = 0;
  var _camTX = 0,
    _camTY = 0;
  var _camRunning = false;
  var _camBoardId = "";
  var _camCellSize = 18;
  var _lastCamTime = 0;

  var _lookX = 0,
    _lookY = 0;
  var _camSpeed = 10;

  function startCamera(boardId, cellSize) {
    _camBoardId = boardId;
    _camCellSize = cellSize;
    _camX = 0;
    _camY = 0;
    _camTX = 0;
    _camTY = 0;
    _lookX = 0;
    _lookY = 0;
    _lastCamTime = performance.now();
    if (!_camRunning) {
      _camRunning = true;
      requestAnimationFrame(cameraTick);
    }
  }

  function stopCamera() {
    _camRunning = false;
  }

  function setCameraTarget(px, py, dirX, dirY) {
    var boardEl = document.getElementById(_camBoardId);
    if (!boardEl) return;
    var vp = boardEl.querySelector(".games-board-3d");
    if (!vp) return;
    var vpW = vp.clientWidth || 400;
    var vpH = vp.clientHeight || 300;
    var cs = _camCellSize;
    var lookAhead = cs * 3.5;
    var playerScreenX = vpW / 2;
    var playerScreenY = vpH / 2;

    _lookX += ((dirX || 0) - _lookX) * 0.25;
    _lookY += ((dirY || 0) - _lookY) * 0.25;
    _camTX = playerScreenX - px * cs - cs / 2 - _lookX * lookAhead;
    _camTY = playerScreenY - py * cs - cs / 2 - _lookY * lookAhead;
  }

  function cameraTick(now) {
    if (!_camRunning) return;
    var dt = Math.min(now - (_lastCamTime || now), 50);
    _lastCamTime = now;

    var f = Math.min(1, 1 - Math.exp((-_camSpeed * dt) / 1000));
    _camX += (_camTX - _camX) * f;
    _camY += (_camTY - _camY) * f;
    var grid = document.getElementById("gameGrid");
    if (grid) {
      grid.style.transform =
        "translate(" +
        _camX.toFixed(1) +
        "px," +
        _camY.toFixed(1) +
        "px) rotateX(28deg)";
    }
    requestAnimationFrame(cameraTick);
  }

  /* ================================================================
      SNAKE
     ================================================================ */
  function startSnake() {
    clearBody();
    var size = 18;
    var cellSize = SNAKE_CELL;
    var snake = [{ x: 9, y: 9 }];
    var dir = { x: 1, y: 0 };
    var nextDir = { x: 1, y: 0 };
    var food = { x: 5, y: 5 };
    var score = 0;
    var highScore = 0;
    try {
      highScore = parseInt(localStorage.getItem("snakeHigh") || "0", 10);
    } catch (e) {}
    var running = true;
    var interval = null;
    var paused = false;
    var gameOverFlag = false;

    function placeFood() {
      var free = [];
      for (var y = 0; y < size; y++)
        for (var x = 0; x < size; x++) {
          var occ = false;
          for (var s = 0; s < snake.length; s++)
            if (snake[s].x === x && snake[s].y === y) {
              occ = true;
              break;
            }
          if (!occ) free.push({ x: x, y: y });
        }
      if (free.length > 0) food = free[Math.floor(Math.random() * free.length)];
    }

    function getCellClass(x, y) {
      if (gameOverFlag) return "games-cell-empty";
      if (x === snake[0].x && y === snake[0].y) return "games-cell-snake-head";
      for (var s = 0; s < snake.length; s++)
        if (snake[s].x === x && snake[s].y === y)
          return "games-cell-snake-body";
      if (x === food.x && y === food.y) return "games-cell-food";
      return "games-cell-empty";
    }

    function tick() {
      if (!running || paused) return;
      dir = { x: nextDir.x, y: nextDir.y };
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size) {
        endGame();
        return;
      }
      for (var i = 0; i < snake.length; i++)
        if (snake[i].x === head.x && snake[i].y === head.y) {
          endGame();
          return;
        }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
      } else snake.pop();
      update3DBoard(size, size, getCellClass);
      setCameraTarget(snake[0].x, snake[0].y, dir.x, dir.y);
      var scEl = document.getElementById("snakeScore");
      if (scEl) scEl.textContent = score;
    }

    function endGame() {
      if (!running) return;
      running = false;
      gameOverFlag = true;
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (score > highScore) {
        highScore = score;
        try {
          localStorage.setItem("snakeHigh", score);
        } catch (e) {}
      }
      update3DBoard(size, size, getCellClass);
      showSnakeOverlay();
    }

    function showSnakeOverlay() {
      var boardEl = document.querySelector("#snakeBoard .games-board-3d");
      if (!boardEl) return;
      var ov = document.createElement("div");
      ov.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
      ov.innerHTML =
        '<div style="text-align:center;">' +
        '<div style="font-size:28px;font-weight:bold;color:#c00;font-family:monospace;text-shadow:2px 2px 0 #600;margin-bottom:8px;letter-spacing:2px;">GAME OVER</div>' +
        (score >= highScore && score > 0
          ? '<div style="color:#ff0;font-size:12px;margin:6px 0;font-family:monospace;">NOVO RECORDE!</div>'
          : "") +
        '<div style="color:#0f0;font-size:13px;margin:4px 0;font-family:monospace;">Pontos: <span style="color:#0ff;">' +
        score +
        "</span></div>" +
        '<div style="color:#0f0;font-size:13px;margin:4px 0;font-family:monospace;">Recorde: <span style="color:#ff0;">' +
        highScore +
        "</span></div>" +
        '<div style="margin-top:14px;font-size:11px;color:#888;font-family:monospace;">ENTER = Jogar de novo</div></div>';
      boardEl.appendChild(ov);
    }

    function keyHandler(e) {
      var k = e.key;
      if (k === "Enter" && gameOverFlag) {
        cleanup();
        startSnake();
        e.preventDefault();
        return;
      }
      if (k === "`") {
        cleanup();
        showSelector();
        e.preventDefault();
        return;
      }
      if (!running) return;
      switch (k) {
        case "ArrowUp":
          if (dir.y !== 1 && nextDir.y !== 1) {
            nextDir = { x: 0, y: -1 };
          }
          e.preventDefault();
          break;
        case "ArrowDown":
          if (dir.y !== -1 && nextDir.y !== -1) {
            nextDir = { x: 0, y: 1 };
          }
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (dir.x !== 1 && nextDir.x !== 1) {
            nextDir = { x: -1, y: 0 };
          }
          e.preventDefault();
          break;
        case "ArrowRight":
          if (dir.x !== -1 && nextDir.x !== -1) {
            nextDir = { x: 1, y: 0 };
          }
          e.preventDefault();
          break;
        case "w":
        case "W":
          if (dir.y !== 1 && nextDir.y !== 1) {
            nextDir = { x: 0, y: -1 };
          }
          e.preventDefault();
          break;
        case "s":
        case "S":
          if (dir.y !== -1 && nextDir.y !== -1) {
            nextDir = { x: 0, y: 1 };
          }
          e.preventDefault();
          break;
        case "a":
        case "A":
          if (dir.x !== 1 && nextDir.x !== 1) {
            nextDir = { x: -1, y: 0 };
          }
          e.preventDefault();
          break;
        case "d":
        case "D":
          if (dir.x !== -1 && nextDir.x !== -1) {
            nextDir = { x: 1, y: 0 };
          }
          e.preventDefault();
          break;
        case " ":
        case "p":
        case "P":
          paused = !paused;
          if (paused) {
            if (interval) {
              clearInterval(interval);
              interval = null;
            }
          } else {
            interval = setInterval(tick, Math.max(60, 200 - score * 3));
          }
          showPause(paused, "#snakeBoard");
          e.preventDefault();
          break;
      }
    }

    function showPause(p, boardId) {
      var boardEl = document.querySelector(boardId + " .games-board-3d");
      if (!boardEl) return;
      var ov = document.getElementById("pauseOverlay");
      if (p && !ov) {
        var d = document.createElement("div");
        d.id = "pauseOverlay";
        d.style.cssText =
          "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
        d.innerHTML =
          '<div style="font-size:28px;font-weight:bold;color:#ff0;font-family:monospace;text-shadow:2px 2px 0 #660;letter-spacing:3px;">PAUSA</div>';
        boardEl.appendChild(d);
      } else if (!p) {
        var d = document.getElementById("pauseOverlay");
        if (d) d.remove();
      }
    }

    function cleanup() {
      stopCamera();
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      clearInterval(speedCheck);
      document.removeEventListener("keydown", keyHandler);
    }

    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText =
      "height:100%;box-sizing:border-box;display:flex;flex-direction:column;";

    var topBar = document.createElement("div");
    topBar.className = "games-hud";
    topBar.innerHTML =
      '<span class="games-hud-label">COBRINHA</span><span class="games-hud-sep">|</span>Pontos: <span class="games-hud-val" id="snakeScore">0</span><span class="games-hud-sep">|</span>Recorde: <span class="games-hud-high" id="snakeHigh">' +
      highScore +
      "</span>";
    c.appendChild(topBar);

    var boardWrap = document.createElement("div");
    boardWrap.id = "snakeBoard";
    boardWrap.style.cssText =
      "flex:1;display:flex;align-items:stretch;background:#000;min-height:0;";
    var grid = create3DBoard(size, size, getCellClass, cellSize);
    boardWrap.appendChild(grid);
    c.appendChild(boardWrap);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", keyHandler);
    placeFood();
    startCamera("snakeBoard", cellSize);
    setCameraTarget(snake[0].x, snake[0].y, 1, 0);

    interval = setInterval(tick, Math.max(60, 200 - score * 3));
    var speedCheck = setInterval(function () {
      if (!running && interval) {
        clearInterval(speedCheck);
        return;
      }
      if (interval && !paused) {
        clearInterval(interval);
        interval = setInterval(tick, Math.max(60, 200 - score * 3));
      }
    }, 500);

    gameState.cleanup = function () {
      stopCamera();
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      clearInterval(speedCheck);
      document.removeEventListener("keydown", keyHandler);
    };
  }

  /* ================================================================
      LABIRINTO
     ================================================================ */
  function genMaze(w, h) {
    var cols = Math.floor(w / 2);
    var rows = Math.floor(h / 2);
    var grid = [];
    for (var y = 0; y < rows * 2 + 1; y++) {
      grid[y] = [];
      for (var x = 0; x < cols * 2 + 1; x++) grid[y][x] = 1;
    }
    var visited = [];
    function carve(cx, cy) {
      visited[cy * cols + cx] = true;
      grid[cy * 2 + 1][cx * 2 + 1] = 0;
      var dirs = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ];
      for (var i = dirs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = dirs[i];
        dirs[i] = dirs[j];
        dirs[j] = tmp;
      }
      for (var d = 0; d < dirs.length; d++) {
        var nx = cx + dirs[d][0],
          ny = cy + dirs[d][1];
        if (
          nx >= 0 &&
          nx < cols &&
          ny >= 0 &&
          ny < rows &&
          !visited[ny * cols + nx]
        ) {
          grid[cy * 2 + 1 + dirs[d][1]][cx * 2 + 1 + dirs[d][0]] = 0;
          carve(nx, ny);
        }
      }
    }
    carve(0, 0);
    grid[1][0] = 0;
    grid[rows * 2 - 1][cols * 2] = 0;
    return {
      grid: grid,
      cols: cols,
      rows: rows,
      width: cols * 2 + 1,
      height: rows * 2 + 1,
    };
  }

  function startLabirinto(level) {
    level = level || 1;
    clearBody();
    var lastDir = { x: 0, y: 0 };

    function initMaze() {
      var w = 15 + (level - 1) * 6;
      var h = 11 + (level - 1) * 4;
      var m = genMaze(w, h);
      var visited = {};
      var st = {
        maze: m,
        px: 0,
        py: 1,
        level: level,
        ex: m.cols * 2,
        ey: m.rows * 2 - 1,
        steps: 0,
        startTime: Date.now(),
        won: false,
        dead: false,
      };
      return { m: m, visited: visited, st: st };
    }

    var g = initMaze();
    g.cellSize = MAZE_CELL_SIZE;

    function getCellClass(x, y) {
      var key = x + "," + y;
      if (g.st.dead || g.st.won) {
        if (g.st.maze.grid[y][x] === 1) return "games-cell-wall";
        return "games-cell-path";
      }
      if (x === g.st.px && y === g.st.py) return "games-cell-player";
      if (x === g.st.ex && y === g.st.ey) return "games-cell-exit";
      if (g.st.maze.grid[y][x] === 1) return "games-cell-wall";
      if (g.visited[key]) return "games-cell-visited";
      return "games-cell-path";
    }

    function renderMaze() {
      update3DBoard(g.st.maze.height, g.st.maze.width, getCellClass);
      setCameraTarget(g.st.px, g.st.py, lastDir.x, lastDir.y);
      var stEl = document.getElementById("mazeStatus");
      var tiEl = document.getElementById("mazeTime");
      if (stEl) {
        stEl.innerHTML =
          'Passos: <span class="games-hud-val">' + g.st.steps + "</span>";
      }
      if (tiEl) {
        var elapsed = Math.floor((Date.now() - g.st.startTime) / 1000);
        if (g.st.won) {
          var min = Math.floor(elapsed / 60);
          var sec = elapsed % 60;
          tiEl.innerHTML =
            'Tempo: <span style="color:#0c0;font-weight:bold">' +
            min +
            "m" +
            (sec < 10 ? "0" : "") +
            sec +
            "s</span>";
        } else {
          tiEl.innerHTML =
            'Tempo: <span style="color:#0c0;font-weight:bold">' +
            elapsed +
            "s</span>";
        }
      }
    }

    function showMazeOverlay(msg, sub, nextLevel) {
      var boardEl = document.querySelector("#mazeBoard .games-board-3d");
      if (!boardEl) return;
      var nextText = "";
      var action = "ENTER = Continuar";
      if (nextLevel) {
        nextText =
          '<div style="margin-top:6px;color:#0f0;font-size:12px;font-family:monospace;">Proximo nivel: ' +
          nextLevel +
          "</div>";
        action = "ENTER = Proximo nivel";
      }
      var ov = document.createElement("div");
      ov.id = "mazeOverlay";
      ov.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.9);z-index:10;";
      ov.innerHTML =
        '<div style="text-align:center;">' +
        '<div style="font-size:26px;font-weight:bold;color:#0f0;font-family:monospace;text-shadow:2px 2px 0 #060;margin-bottom:8px;letter-spacing:2px;">' +
        msg +
        "</div>" +
        nextText +
        '<div style="margin-top:8px;font-size:11px;color:#aaa;font-family:monospace;">' +
        sub +
        "</div>" +
        '<div style="margin-top:14px;font-size:11px;color:#888;font-family:monospace;">' +
        action +
        "</div></div>";
      boardEl.appendChild(ov);
    }

    function removeOverlay() {
      var ov = document.getElementById("mazeOverlay");
      if (ov) ov.remove();
    }

    function resetToStart() {
      g.st.px = 0;
      g.st.py = 1;
      g.st.steps = 0;
      g.st.dead = true;
      g.visited = {};
      renderMaze();
      showMazeOverlay("BATEU NA PAREDE!", "Pressione ENTER para continuar.");
    }

    function keyHandler(e) {
      var k = e.key;
      if (k === "Enter") {
        if (g.st.won) {
          cleanup();
          startLabirinto(g.st.level + 1);
          e.preventDefault();
          return;
        }
        if (g.st.dead) {
          g.st.dead = false;
          g.visited = {};
          removeOverlay();
          rebuildMazeBoard();
          renderMaze();
          e.preventDefault();
          return;
        }
        e.preventDefault();
        return;
      }
      if (k === "`") {
        cleanup();
        showSelector();
        e.preventDefault();
        return;
      }
      if (g.st.won || g.st.dead) return;
      if (k === "r" || k === "R") {
        cleanup();
        startLabirinto();
        e.preventDefault();
        return;
      }
      var cmd = k.toUpperCase();
      if (cmd === "W" || cmd === "A" || cmd === "S" || cmd === "D") {
        var dx = 0,
          dy = 0;
        if (cmd === "W") dy = -1;
        else if (cmd === "S") dy = 1;
        else if (cmd === "A") dx = -1;
        else if (cmd === "D") dx = 1;
        lastDir = { x: dx, y: dy };
        var nx = g.st.px + dx,
          ny = g.st.py + dy;
        if (
          nx < 0 ||
          nx >= g.st.maze.width ||
          ny < 0 ||
          ny >= g.st.maze.height ||
          g.st.maze.grid[ny][nx] === 1
        ) {
          resetToStart();
          e.preventDefault();
          return;
        }
        g.st.px = nx;
        g.st.py = ny;
        g.st.steps++;
        g.visited[nx + "," + ny] = true;
        if (g.st.px === g.st.ex && g.st.py === g.st.ey) {
          g.st.won = true;
          var elapsed = Math.floor((Date.now() - g.st.startTime) / 1000);
          renderMaze();
          showMazeOverlay(
            "ESCAPOU!",
            "Passos: " + g.st.steps + " | Tempo: " + elapsed + "s",
            g.st.level + 1,
          );
        } else {
          renderMaze();
        }
        e.preventDefault();
      }
    }

    function rebuildMazeBoard() {
      var boardEl = document.querySelector("#mazeBoard");
      if (!boardEl) return;
      boardEl.innerHTML = "";
      var grid = create3DBoard(
        g.st.maze.height,
        g.st.maze.width,
        getCellClass,
        g.cellSize,
      );
      boardEl.appendChild(grid);
    }

    function cleanup() {
      stopCamera();
      document.removeEventListener("keydown", keyHandler);
    }

    var c = document.createElement("div");
    c.className = "games-container";
    c.style.cssText =
      "height:100%;box-sizing:border-box;display:flex;flex-direction:column;";

    var topBar = document.createElement("div");
    topBar.className = "games-hud";
    topBar.innerHTML =
      '<span class="games-hud-label">LABIRINTO</span><span class="games-hud-sep">|</span>Nivel: <span class="games-hud-val" id="mazeLevel">' +
      level +
      '</span><span class="games-hud-sep">|</span><span class="games-hud-val" id="mazeStatus">Passos: 0</span><span class="games-hud-sep">|</span><span id="mazeTime" style="color:#0c0;font-weight:bold;">Tempo: 0s</span>';
    c.appendChild(topBar);

    var boardWrap = document.createElement("div");
    boardWrap.id = "mazeBoard";
    boardWrap.style.cssText =
      "flex:1;display:flex;align-items:stretch;background:#000;min-height:0;";
    var grid = create3DBoard(
      g.st.maze.height,
      g.st.maze.width,
      getCellClass,
      g.cellSize,
    );
    boardWrap.appendChild(grid);
    c.appendChild(boardWrap);

    gamesBody.appendChild(c);

    document.addEventListener("keydown", keyHandler);
    startCamera("mazeBoard", g.cellSize);
    renderMaze();

    gameState.cleanup = function () {
      stopCamera();
      document.removeEventListener("keydown", keyHandler);
    };
  }

  showSelector();
})();
