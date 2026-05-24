(function () {
  "use strict";

  var win = document.getElementById("scWindow");
  var body = document.getElementById("scBody");
  var dragHandle = document.getElementById("scDragHandle");
  var btnClose = document.getElementById("scBtnClose");
  var btnMinimize = document.getElementById("scBtnMinimize");
  var btnMaximize = document.getElementById("scBtnMaximize");

  var $ = function (id) {
    return document.getElementById(id);
  };

  var elArtImg = $("scArtImg");
  var elArtOv = $("scArtOverlay");
  var elTrackName = $("scTrackName");
  var elArtistName = $("scArtistName");
  var elBtnPlay = $("scBtnPlay");
  var elPlayIcon = $("scPlayIcon");
  var elPauseIcon = $("scPauseIcon");
  var elBtnNext = $("scBtnNext");
  var elBtnPrev = $("scBtnPrev");
  var elBtnShuffle = $("scBtnShuffle");
  var elProgressFill = $("scProgressFill");
  var elProgressThumb = $("scProgressThumb");
  var elProgressBar = $("scProgressBar");
  var elTimeCurrent = $("scTimeCurrent");
  var elTimeTotal = $("scTimeTotal");
  var elStatus = $("scStatus");
  var elPlaylistItems = $("scPlaylistItems");
  var elTrackCounter = $("scTrackCounter");
  var elTrackList = $("scTrackList");
  var elIframeWrap = $("scIframeWrap");

  var currentTrackIndex = 0;
  var totalTracks = 0;
  var trackList = [];
  var isPlaying = false;
  var duration = 0;
  var position = 0;
  var pollTimer = null;
  var activePlaylistId = null;
  var shuffle = false;
  var playedIndexes = [];
  var dragging = false;
  var artworkCache = {};
  var metaCache = {};
  var currentFullSound = null;
  var playlistStates = {};

  var playlists = [
    { id: "br", label: "br", url: "https://soundcloud.com/cu11/sets/br" },
    {
      id: "lounge",
      label: "lounge",
      url: "https://soundcloud.com/cu11/sets/lounge",
    },
    {
      id: "soundscape",
      label: "soundscape",
      url: "https://soundcloud.com/cu11/sets/soundscape",
    },
    { id: "bass", label: "bass", url: "https://soundcloud.com/cu11/sets/bass" },
    {
      id: "58vt",
      label: "guitar",
      url: "https://soundcloud.com/cu11/sets/58vt",
    },
    {
      id: "7kpn",
      label: "emotion",
      url: "https://soundcloud.com/cu11/sets/7kpn",
    },
    {
      id: "vv44",
      label: "energy",
      url: "https://soundcloud.com/cu11/sets/vv44",
    },
  ];

  var widgets = {};
  var widgetReadies = {};
  var loadingPlaylist = false;
  var customPlaylists = [];
  var nextCustomId = 1;

  function plURL(url) {
    return (
      "https://w.soundcloud.com/player/?url=" +
      encodeURIComponent(url) +
      "&auto_play=false&show_artwork=true&visual=false&hide_related=true&" +
      "show_comments=false&show_user=false&show_reposts=false&sharing=false&liking=false&download=false"
    );
  }

  function artworkSuffix() {
    var p = document.getElementById("scPlayer");
    if (p && p.getBoundingClientRect().width >= 700) return "-t500x500";
    return "-t250x250";
  }

  /* ===== Compatibility layer for Widget API method names ===== */
  var wMethods = {};

  function detectMethods(w) {
    wMethods = {};
    var checks = {
      getIdx: ["getCurrentTrackIndex", "getCurrentSoundIndex"],
      skip: ["skipTo", "skip"],
      next: ["next"],
      prev: ["prev"],
      play: ["play"],
      pause: ["pause"],
      toggle: ["toggle"],
      seekTo: ["seekTo"],
      getSounds: ["getSounds"],
      getCurrentSound: ["getCurrentSound"],
      getDuration: ["getDuration"],
      getPosition: ["getPosition"],
      isPaused: ["isPaused"],
      bind: ["bind"],
    };
    for (var key in checks) {
      for (var i = 0; i < checks[key].length; i++) {
        if (typeof w[checks[key][i]] === "function") {
          wMethods[key] = checks[key][i];
          break;
        }
      }
    }
  }

  function wCall(methodKey) {
    var m = wMethods[methodKey];
    if (!m || !widgets[activePlaylistId]) return;
    var args = Array.prototype.slice.call(arguments, 1);
    try {
      widgets[activePlaylistId][m].apply(widgets[activePlaylistId], args);
    } catch (e) {}
  }

  function wCallCb(methodKey, callback) {
    var m = wMethods[methodKey];
    if (!m || !widgets[activePlaylistId] || typeof callback !== "function")
      return;
    try {
      widgets[activePlaylistId][m](callback);
    } catch (e) {}
  }

  function showStatus(msg) {
    if (elStatus) elStatus.textContent = msg;
  }
  function hideStatus() {
    if (elStatus) elStatus.textContent = "";
  }

  function fmt(ms) {
    if (!ms || ms < 0) return "0:00";
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  /* ===== Playlist sidebar ===== */
  function renderPlaylists() {
    if (!elPlaylistItems) return;
    elPlaylistItems.innerHTML = "";

    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var e = document.createElement("div");
        e.className =
          "sc-playlist-item" +
          (pl.id === activePlaylistId ? " sc-playlist-item-active" : "");
        var label = document.createElement("span");
        label.className = "sc-playlist-item-label";
        label.textContent = pl.label;
        e.appendChild(label);
        if (pl.default === false) {
          var rm = document.createElement("span");
          rm.className = "sc-playlist-remove";
          rm.innerHTML =
            '<svg viewBox="0 0 10 10" width="10" height="10"><line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.2"/><line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.2"/></svg>';
          rm.addEventListener("click", function (e) {
            e.stopPropagation();
            removePlaylist(pl.id);
          });
          e.appendChild(rm);
        }
        e.addEventListener("click", function () {
          switchPlaylist(pl.id);
        });
        elPlaylistItems.appendChild(e);
      })(playlists[i]);
    }

    var addBtn = document.createElement("button");
    addBtn.className = "sc-playlist-add";
    addBtn.innerHTML =
      '<svg viewBox="0 0 10 10" width="10" height="10"><line x1="5" y1="1" x2="5" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="5" x2="9" y2="5" stroke="currentColor" stroke-width="1.5"/></svg> Adicionar playlist';
    addBtn.addEventListener("click", showAddDialog);
    elPlaylistItems.appendChild(addBtn);

    var c = $("scPlaylistCount");
    if (c) c.textContent = playlists.length + " playlists";
  }

  function showAddDialog() {
    xpDialog({
      title: "Adicionar playlist",
      icon: "@",
      type: "prompt",
      message: "Cole o link da playlist do SoundCloud:",
      defaultValue: "https://soundcloud.com/",
      width: "400px",
      callback: function (val) {
        if (val && val.indexOf("soundcloud.com") !== -1) {
          addPlaylist(val);
        }
      },
    });
  }

  function addPlaylist(url) {
    var id = "custom_" + nextCustomId++;
    var label =
      url.split("/sets/")[1] ||
      url.split("/").pop() ||
      "Playlist " + nextCustomId;
    if (label.length > 20) label = label.substring(0, 20);
    var pl = { id: id, label: label, url: url, default: false };
    customPlaylists.push(pl);
    playlists.push(pl);
    saveCustomPlaylists();
    createWidgetForPlaylist(pl);
    renderPlaylists();
  }

  function removePlaylist(id) {
    var pl = null;
    var idx = -1;
    for (var i = 0; i < playlists.length; i++) {
      if (playlists[i].id === id) {
        pl = playlists[i];
        idx = i;
        break;
      }
    }
    if (!pl) return;
    if (pl.default !== false) {
      for (var i = 0; i < customPlaylists.length; i++) {
        if (customPlaylists[i].id === id) {
          customPlaylists.splice(i, 1);
          break;
        }
      }
    }
    playlists.splice(idx, 1);
    if (widgets[id]) {
      var iframe =
        elIframeWrap &&
        elIframeWrap.querySelector('iframe[data-pl-id="' + id + '"]');
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
      delete widgets[id];
      delete widgetReadies[id];
    }
    if (id === activePlaylistId) {
      activePlaylistId = null;
      for (var i = 0; i < playlists.length; i++) {
        if (widgets[playlists[i].id] && widgetReadies[playlists[i].id]) {
          switchPlaylist(playlists[i].id);
          break;
        }
      }
    }
    if (pl.default === false) saveCustomPlaylists();
    renderPlaylists();
  }

  function saveCustomPlaylists() {
    try {
      localStorage.setItem(
        "scCustomPlaylists",
        JSON.stringify({ list: customPlaylists, nextId: nextCustomId }),
      );
    } catch (e) {}
  }

  function createWidgetForPlaylist(pl) {
    if (!elIframeWrap) return;
    var iframe = document.createElement("iframe");
    iframe.src = plURL(pl.url);
    iframe.width = "100%";
    iframe.height = "166";
    iframe.frameBorder = "no";
    iframe.scrolling = "no";
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "400px";
    iframe.style.height = "166px";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.dataset.plId = pl.id;
    elIframeWrap.appendChild(iframe);
    var w = SC.Widget(iframe);
    widgets[pl.id] = w;
    widgetReadies[pl.id] = false;
    w.bind(SC.Widget.Events.READY, function () {
      widgetReadies[pl.id] = true;
      syncActiveVolume();
      (function poll() {
        var tries = arguments[0] || 0;
        w.getSounds(function (sounds) {
          if (sounds && sounds.length > 0) {
            playlistStates[pl.id] = {
              trackList: sounds,
              currentTrackIndex: 0,
              currentFullSound: null,
              metaCache: {},
              artworkCache: {},
              isPlaying: false,
            };
            if (pl.id === activePlaylistId) {
              trackList = sounds;
              totalTracks = sounds.length;
              updateCounter();
              renderTrackList();
              preloadArtwork();
              hideStatus();
              setTimeout(refresh, 500);
              w.getCurrentSound(function (s) {
                if (s && s.title) updateFromSound(s);
              });
            }
          } else if (tries < 30) {
            setTimeout(function () {
              poll(tries + 1);
            }, 500);
          }
        });
      })(0);
    });
    w.bind(SC.Widget.Events.PLAY, function () {
      if (pl.id !== activePlaylistId) return;
      isPlaying = true;
      updatePlayBtn();
      startPoll();
      w.getCurrentSound(function (s) {
        if (s && s.title) updateFromSound(s);
      });
      setTimeout(refresh, 200);
    });
    w.bind(SC.Widget.Events.PAUSE, function () {
      if (pl.id !== activePlaylistId) return;
      isPlaying = false;
      updatePlayBtn();
      stopPoll();
    });
    w.bind(SC.Widget.Events.FINISH, function () {
      if (pl.id !== activePlaylistId) return;
      setTimeout(function () {
        if (shuffle) doShuffle();
        else {
          currentTrackIndex = (currentTrackIndex + 1) % totalTracks;
          currentFullSound = null;
          displayTrack();
        }
      }, 400);
    });
  }

  /* ===== Switch playlist (instant - iframes already loaded) ===== */
  function switchPlaylist(id) {
    if (id === activePlaylistId) return;
    if (loadingPlaylist) return;
    if (!widgets[id] || !widgetReadies[id]) {
      showStatus("Carregando playlist...");
      var checkTimer = setInterval(function () {
        if (widgets[id] && widgetReadies[id]) {
          clearInterval(checkTimer);
          hideStatus();
          switchPlaylist(id);
        }
      }, 200);
      setTimeout(function () {
        clearInterval(checkTimer);
        hideStatus();
        if (!widgets[id] || !widgetReadies[id]) {
          showStatus("Falha ao carregar playlist");
        }
      }, 10000);
      return;
    }

    if (activePlaylistId) {
      playlistStates[activePlaylistId] = {
        trackList: trackList.slice(),
        currentTrackIndex: currentTrackIndex,
        currentFullSound: currentFullSound,
        metaCache: Object.assign({}, metaCache),
        artworkCache: Object.assign({}, artworkCache),
        isPlaying: isPlaying,
      };
    }

    activePlaylistId = id;
    renderPlaylists();
    stopPoll();
    showAllIframes();
    detectMethods(widgets[activePlaylistId]);

    var saved = playlistStates[id];
    if (saved) {
      trackList = saved.trackList;
      currentTrackIndex = saved.currentTrackIndex;
      currentFullSound = saved.currentFullSound;
      metaCache = saved.metaCache;
      artworkCache = saved.artworkCache;
      totalTracks = trackList.length;
      renderTrackList();
      displayTrack();
      updateCounter();
      preloadArtwork();
      refreshHighlight();
      isPlaying = saved.isPlaying || false;
      updatePlayBtn();
      if (isPlaying) startPoll();

      wCallCb("isPaused", function (paused) {
        if (paused === false) {
          if (!isPlaying) {
            isPlaying = true;
            updatePlayBtn();
            startPoll();
          }
        } else if (paused === true) {
          if (isPlaying) {
            isPlaying = false;
            updatePlayBtn();
            stopPoll();
          }
        }
      });
      wCallCb("getPosition", function (p) {
        if (p >= 0) {
          position = p;
          elTimeCurrent.textContent = fmt(p);
        }
      });
      wCallCb("getDuration", function (d) {
        if (d > 0) {
          duration = d;
          elTimeTotal.textContent = fmt(d);
        }
      });
      wCallCb("getCurrentSound", function (s) {
        if (s && s.title) updateFromSound(s);
      });
      wCallCb("getIdx", function (idx) {
        if (idx >= 0 && idx < totalTracks) {
          currentTrackIndex = idx;
          displayTrack();
          refreshHighlight();
          updateCounter();
        }
      });
    } else {
      trackList = [];
      totalTracks = 0;
      currentTrackIndex = -1;
      artworkCache = {};
      metaCache = {};
      currentFullSound = null;
      isPlaying = false;
      updatePlayBtn();
      position = 0;
      duration = 0;
      elTimeCurrent.textContent = "0:00";
      elTimeTotal.textContent = "0:00";
      updateBar();
      renderTrackList();
      updateCounter();
      elTrackName.textContent = "Carregando...";
      elArtistName.textContent = "";
      setArt(null);
      refreshHighlight();
      var tries = 0;
      var loadTimer = setTimeout(function () {
        elTrackName.textContent = "Falha ao carregar";
      }, 15000);

      (function poll() {
        tries++;
        wCallCb("getSounds", function (sounds) {
          if (sounds && sounds.length > 0) {
            clearTimeout(loadTimer);
            trackList = sounds;
            totalTracks = sounds.length;
            currentTrackIndex = 0;
            updateCounter();
            renderTrackList();
            preloadArtwork();
            displayTrack();
          } else if (tries < 30) {
            setTimeout(poll, 500);
          }
        });
      })();
    }
  }

  /* ===== Volume sync with tray slider (3x boost) ===== */
  function syncActiveVolume() {
    if (
      !widgets[activePlaylistId] ||
      typeof window.getPageVolume !== "function"
    )
      return;
    try {
      widgets[activePlaylistId].setVolume(window.getPageVolume() * 3);
    } catch (e) {}
  }

  window.setSoundCloudVolume = function (v) {
    for (var id in widgets) {
      if (widgets[id] && widgetReadies[id]) {
        try {
          widgets[id].setVolume(v * 3);
        } catch (e) {}
      }
    }
  };

  function showAllIframes() {
    if (!elIframeWrap) return;
    for (var i = 0; i < elIframeWrap.children.length; i++) {
      var c = elIframeWrap.children[i];
      if (c.tagName === "IFRAME") {
        c.style.display =
          c.dataset.plId === activePlaylistId ? "block" : "none";
      }
    }
  }

  /* ===== Create all widgets ===== */
  function initWidgets() {
    if (typeof SC === "undefined") {
      setTimeout(initWidgets, 500);
      return;
    }
    elIframeWrap = elIframeWrap || document.getElementById("scIframeWrap");
    if (!elIframeWrap) {
      setTimeout(initWidgets, 500);
      return;
    }

    var anyReady = false;
    for (var i = 0; i < playlists.length; i++) {
      (function (pl) {
        var iframe = document.createElement("iframe");
        iframe.src = plURL(pl.url);
        iframe.width = "100%";
        iframe.height = "166";
        iframe.frameBorder = "no";
        iframe.scrolling = "no";
        iframe.style.position = "absolute";
        iframe.style.left = "-9999px";
        iframe.style.top = "0";
        iframe.style.width = "400px";
        iframe.style.height = "166px";
        iframe.style.opacity = "0";
        iframe.style.pointerEvents = "none";
        iframe.dataset.plId = pl.id;
        elIframeWrap.appendChild(iframe);

        var w = SC.Widget(iframe);
        widgets[pl.id] = w;
        widgetReadies[pl.id] = false;

        w.bind(SC.Widget.Events.READY, function () {
          widgetReadies[pl.id] = true;
          syncActiveVolume();
          if (!anyReady) {
            anyReady = true;
            activePlaylistId = pl.id;
            renderPlaylists();
            (function poll() {
              var tries = arguments[0] || 0;
              w.getSounds(function (sounds) {
                if (sounds && sounds.length > 0) {
                  trackList = sounds;
                  totalTracks = sounds.length;
                  updateCounter();
                  renderTrackList();
                  preloadArtwork();
                  hideStatus();
                  setTimeout(refresh, 500);
                } else if (tries < 30) {
                  setTimeout(function () {
                    poll(tries + 1);
                  }, 500);
                }
              });
            })(0);
            w.getCurrentSound(function (s) {
              if (s && s.title) updateFromSound(s);
            });
          }
        });

        w.bind(SC.Widget.Events.PLAY, function () {
          if (pl.id !== activePlaylistId) return;
          isPlaying = true;
          updatePlayBtn();
          startPoll();
          w.getCurrentSound(function (s) {
            if (s && s.title) updateFromSound(s);
          });
          setTimeout(refresh, 200);
        });

        w.bind(SC.Widget.Events.PAUSE, function () {
          if (pl.id !== activePlaylistId) return;
          isPlaying = false;
          updatePlayBtn();
          stopPoll();
        });

        w.bind(SC.Widget.Events.FINISH, function () {
          if (pl.id !== activePlaylistId) return;
          setTimeout(function () {
            if (shuffle) doShuffle();
            else {
              currentTrackIndex = (currentTrackIndex + 1) % totalTracks;
              currentFullSound = null;
              displayTrack();
            }
          }, 400);
        });
      })(playlists[i]);
    }

    // Timeout fallback
    var checkReady = setInterval(function () {
      for (var k in widgetReadies) {
        if (widgetReadies[k]) {
          clearInterval(checkReady);
          return;
        }
      }
    }, 1000);
    setTimeout(function () {
      clearInterval(checkReady);
    }, 30000);
  }

  /* ===== Track list ===== */
  function renderTrackList() {
    if (!elTrackList) return;
    for (var i = elTrackList.children.length - 1; i >= 0; i--) {
      var c = elTrackList.children[i];
      if (!c.classList || !c.classList.contains("sc-status")) {
        elTrackList.removeChild(c);
      }
    }
    for (var i = 0; i < trackList.length; i++) {
      (function (idx) {
        var e = document.createElement("div");
        var t = trackList[idx].title;
        if (!t && metaCache[idx]) t = metaCache[idx].title;
        e.textContent = t || "Faixa " + (idx + 1);
        e.className = "sc-track-item";
        if (idx === currentTrackIndex) e.classList.add("sc-track-item-active");
        e.addEventListener("click", function () {
          skipTrack(idx);
        });
        e.addEventListener("dblclick", function () {
          skipTrack(idx);
          wCall("play");
        });
        elTrackList.appendChild(e);
      })(i);
    }
    scrollActive();
  }

  function updateTrackItem(idx) {
    if (!elTrackList || idx < 0) return;
    var items = elTrackList.querySelectorAll(".sc-track-item");
    if (idx < items.length) {
      var t = trackList[idx] && trackList[idx].title;
      if (!t && metaCache[idx]) t = metaCache[idx].title;
      items[idx].textContent = t || "Faixa " + (idx + 1);
    }
  }

  function scrollActive() {
    if (!elTrackList) return;
    var a = elTrackList.querySelector(".sc-track-item-active");
    if (a) a.scrollIntoView({ block: "nearest" });
  }

  function refreshHighlight() {
    if (!elTrackList) return;
    var items = elTrackList.querySelectorAll(".sc-track-item");
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle(
        "sc-track-item-active",
        i === currentTrackIndex,
      );
    }
  }

  function updateCounter() {
    if (elTrackCounter) {
      elTrackCounter.textContent =
        totalTracks > 0 ? currentTrackIndex + 1 + "/" + totalTracks : "-/-";
    }
  }

  /* ===== Display current track from trackList ===== */
  function displayTrack() {
    if (!trackList || !trackList[currentTrackIndex]) {
      setTimeout(displayTrack, 500);
      return;
    }
    var s = currentFullSound || trackList[currentTrackIndex];
    var mc = metaCache[currentTrackIndex];
    var title = s.title;
    if (!title && mc && mc.title) title = mc.title;
    elTrackName.textContent = title || "Faixa " + (currentTrackIndex + 1);
    var artist = s.user && s.user.username;
    if (!artist && mc && mc.author_name) artist = mc.author_name;
    elArtistName.textContent = artist || "SoundCloud";
    updateCounter();
    refreshHighlight();
    scrollActive();
    hideStatus();
    loadArt(currentTrackIndex);
  }

  function updateFromSound(s) {
    if (!s) return;
    currentFullSound = s;
    var idx = currentTrackIndex;
    if (s.title) {
      elTrackName.textContent = s.title;
      if (!metaCache[idx]) metaCache[idx] = {};
      metaCache[idx].title = s.title;
    }
    if (s.user && s.user.username) {
      elArtistName.textContent = s.user.username;
      if (!metaCache[idx]) metaCache[idx] = {};
      metaCache[idx].author_name = s.user.username;
    }
    if (s.artwork_url) {
      var n = s.artwork_url.replace(
        /-(large|t\d+x\d+)(\.\w+)$/,
        artworkSuffix() + "$2",
      );
      setArt(n);
      artworkCache[s.id || n] = n;
    }
  }

  function refresh() {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) {
      setTimeout(refresh, 500);
      return;
    }
    detectMethods(widgets[activePlaylistId]);
    wCallCb("getIdx", function (idx) {
      if (idx !== null && idx !== undefined) currentTrackIndex = idx;
      displayTrack();
    });
    wCallCb("getDuration", function (d) {
      if (d > 0) {
        duration = d;
        elTimeTotal.textContent = fmt(d);
      }
    });
    wCallCb("getPosition", function (p) {
      if (p >= 0) {
        position = p;
        elTimeCurrent.textContent = fmt(p);
      }
    });
    setTimeout(function () {
      if (!wMethods.getIdx) displayTrack();
    }, 300);
  }

  /* ===== Manual track tracking ===== */
  function nextTrack() {
    if (totalTracks === 0) return;
    if (shuffle) {
      doShuffle();
      return;
    }
    currentTrackIndex = (currentTrackIndex + 1) % totalTracks;
    currentFullSound = null;
    wCall("next");
    setTimeout(displayTrack, 400);
  }

  function prevTrack() {
    if (totalTracks === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + totalTracks) % totalTracks;
    currentFullSound = null;
    wCall("prev");
    setTimeout(displayTrack, 400);
  }

  function skipTrack(idx) {
    if (idx < 0 || idx >= totalTracks) return;
    currentTrackIndex = idx;
    currentFullSound = null;
    detectMethods(widgets[activePlaylistId]);
    wCall("skip", idx);
    setTimeout(displayTrack, 400);
  }

  /* ===== Artwork & Metadata ===== */
  function trackPermalink(s) {
    if (!s) return null;
    if (s.permalink_url) return s.permalink_url;
    if (s.user && s.user.username && s.permalink)
      return "https://soundcloud.com/" + s.user.username + "/" + s.permalink;
    if (s.id) return "https://api.soundcloud.com/tracks/" + s.id;
    return null;
  }

  function oembedJsonp(trackId, idx) {
    var cb = "sco" + idx;
    window[cb] = function (d) {
      delete window[cb];
      if (!d || !d.title) return;
      if (!metaCache[idx]) metaCache[idx] = {};
      metaCache[idx].title = d.title;
      if (d.author_name) metaCache[idx].author_name = d.author_name;
      updateTrackItem(idx);
      if (idx === currentTrackIndex) displayTrack();
    };
    var s = document.createElement("script");
    s.src =
      "https://soundcloud.com/oembed?format=js&callback=" +
      cb +
      "&url=" +
      encodeURIComponent("https://api.soundcloud.com/tracks/" + trackId);
    document.head.appendChild(s);
  }

  function preloadArtwork() {
    if (!trackList) return;
    for (var pi = 0; pi < trackList.length; pi++) {
      var snd = trackList[pi];
      var pl = trackPermalink(snd);
      if (!pl || artworkCache[pl]) continue;
      var au = snd.artwork_url;
      if (au) {
        var n = au.replace(/-(large|t\d+x\d+)(\.\w+)$/, artworkSuffix() + "$2");
        artworkCache[pl] = n;
      }
      if (snd.title) {
        if (!metaCache[pi]) metaCache[pi] = {};
        metaCache[pi].title = snd.title;
      } else if (snd.id) {
        oembedJsonp(snd.id, pi);
      }
    }
  }

  function loadArt(idx) {
    var sound = currentFullSound || (trackList && trackList[idx]) || null;
    if (!sound) {
      if (trackList && trackList.length === 0) {
        setTimeout(function () {
          loadArt(idx);
        }, 800);
      }
      elArtImg.style.display = "none";
      return;
    }

    if (sound.id && artworkCache[sound.id]) {
      setArt(artworkCache[sound.id]);
      return;
    }

    var pl = trackPermalink(sound);
    if (pl && artworkCache[pl]) {
      setArt(artworkCache[pl]);
      return;
    }

    var artUrl = sound.artwork_url;
    if (artUrl) {
      var norm = artUrl.replace(
        /-(large|t\d+x\d+)(\.\w+)$/,
        artworkSuffix() + "$2",
      );
      if (sound.id) artworkCache[sound.id] = norm;
      else if (pl) artworkCache[pl] = norm;
      setArt(norm);
      return;
    }

    elArtImg.style.display = "none";
  }

  function setArt(src) {
    if (!src) {
      elArtImg.style.display = "none";
      return;
    }
    elArtImg.onerror = function () {
      elArtImg.onerror = null;
    };
    elArtImg.onload = function () {};
    elArtImg.src = src;
    elArtImg.style.display = "block";
  }

  /* ===== Progress ===== */
  function startPoll() {
    stopPoll();
    pollTimer = setInterval(function () {
      if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId])
        return;
      detectMethods(widgets[activePlaylistId]);
      wCallCb("getPosition", function (p) {
        if (p >= 0) {
          position = p;
          elTimeCurrent.textContent = fmt(p);
        }
      });
      wCallCb("getDuration", function (d) {
        if (d > 0) {
          duration = d;
          elTimeTotal.textContent = fmt(d);
        }
      });
      updateBar();
    }, 150);
  }

  function stopPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function updateBar() {
    var pct = duration > 0 ? (position / duration) * 100 : 0;
    if (pct > 100) pct = 100;
    if (pct < 0) pct = 0;
    elProgressFill.style.width = pct + "%";
    elProgressThumb.style.left = "calc(" + pct + "% - 4px)";
  }

  function seekPct(pct) {
    if (
      !widgets[activePlaylistId] ||
      !widgetReadies[activePlaylistId] ||
      duration <= 0
    )
      return;
    wCall("seekTo", pct * duration);
  }

  /* ===== Draggable seek ===== */
  function seekFromEvent(e) {
    if (
      !widgets[activePlaylistId] ||
      !widgetReadies[activePlaylistId] ||
      duration <= 0
    )
      return;
    var r = elProgressBar.getBoundingClientRect();
    var pct = (e.clientX - r.left) / r.width;
    seekPct(pct);
    var pctClamp = Math.max(0, Math.min(1, pct));
    elProgressFill.style.width = pctClamp * 100 + "%";
    elProgressThumb.style.left = "calc(" + pctClamp * 100 + "% - 4px)";
  }

  elProgressBar.addEventListener("mousedown", function (e) {
    if (e.target === elProgressThumb) return;
    dragging = true;
    seekFromEvent(e);
  });

  document.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    seekFromEvent(e);
  });

  document.addEventListener("mouseup", function () {
    dragging = false;
  });

  /* ===== Shuffle ===== */
  function doShuffle() {
    if (
      !widgets[activePlaylistId] ||
      !widgetReadies[activePlaylistId] ||
      totalTracks === 0
    )
      return;
    var avail = [];
    for (var i = 0; i < totalTracks; i++) {
      if (playedIndexes.indexOf(i) === -1) avail.push(i);
    }
    if (avail.length === 0) {
      playedIndexes = [];
      for (var i = 0; i < totalTracks; i++) avail.push(i);
    }
    var pick = avail[Math.floor(Math.random() * avail.length)];
    playedIndexes.push(pick);
    currentTrackIndex = pick;
    currentFullSound = null;
    wCall("skip", pick);
    setTimeout(displayTrack, 400);
  }

  /* ===== Buttons ===== */
  elBtnPlay.addEventListener("click", function () {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) return;
    detectMethods(widgets[activePlaylistId]);
    wCall("toggle");
  });

  elBtnNext.addEventListener("click", function () {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) return;
    nextTrack();
  });

  elBtnPrev.addEventListener("click", function () {
    if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId]) return;
    prevTrack();
  });

  if (elBtnShuffle) {
    elBtnShuffle.addEventListener("click", function () {
      shuffle = !shuffle;
      elBtnShuffle.classList.toggle("sc-btn-shuffle-active", shuffle);
      playedIndexes = [];
    });
  }

  if (elArtOv) {
    elArtOv.addEventListener("click", function () {
      if (!widgets[activePlaylistId] || !widgetReadies[activePlaylistId])
        return;
      wCall("toggle");
    });
  }

  /* ===== Wide layout detection ===== */
  (function () {
    var el = document.getElementById("scPlayer");
    if (!el) return;
    function checkWidth() {
      el.classList.toggle("sc-wide", el.getBoundingClientRect().width >= 700);
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(checkWidth).observe(el);
    }
    window.addEventListener("resize", function () {
      setTimeout(checkWidth, 50);
    });
    document.addEventListener("fullscreenchange", function () {
      setTimeout(checkWidth, 100);
    });
    checkWidth();
  })();

  /* ===== Keyboard ===== */
  document.addEventListener("keydown", function (e) {
    if (win.style.display === "none") return;
    if (!e.target.closest && !e.target.closest("#scWindow")) return;
    var k = e.key;
    if (k === " " || k === "Space") {
      e.preventDefault();
      wCall("toggle");
    }
    if (k === "ArrowRight") {
      e.preventDefault();
      nextTrack();
    }
    if (k === "ArrowLeft") {
      e.preventDefault();
      prevTrack();
    }
  });

  /* ===== Window ===== */
  var behavior = new WindowBehavior(win, {
    dragHandle: dragHandle,
    btnClose: btnClose,
    btnMinimize: btnMinimize,
    btnMaximize: btnMaximize,
    minW: 420,
    minH: 500,
    taskbarIcon:
      '<img src="assets/icons/kwin18.png" alt="" width="14" height="14" style="flex-shrink:0;">',
    taskbarLabel: "SoundCloud Player",
    onShow: function () {
      win.style.width = "417px";
      win.style.height = "560px";
      showAllIframes();
      if (!activePlaylistId) {
        for (var i = 0; i < playlists.length; i++) {
          if (widgetReadies[playlists[i].id]) {
            switchPlaylist(playlists[i].id);
            return;
          }
        }
      }
      setTimeout(refresh, 500);
    },
    onHide: function () {
      stopPoll();
      isPlaying = false;
      updatePlayBtn();
      for (var id in widgets) {
        if (widgets[id] && widgetReadies[id]) {
          try {
            widgets[id].pause();
          } catch (e) {}
          try {
            widgets[id].seekTo(0);
          } catch (e) {}
        }
      }
      playlistStates = {};
      trackList = [];
      totalTracks = 0;
      currentTrackIndex = 0;
      currentFullSound = null;
      artworkCache = {};
      metaCache = {};
      position = 0;
      duration = 0;
      shuffle = false;
      playedIndexes = [];
      elTrackName.textContent = "Nenhuma faixa";
      elArtistName.textContent = "SoundCloud";
      elArtImg.style.display = "none";
      elArtImg.src = "";
      elTimeCurrent.textContent = "0:00";
      elTimeTotal.textContent = "0:00";
      elProgressFill.style.width = "0%";
      elProgressThumb.style.left = "-4px";
      elTrackList.innerHTML = '<div class="sc-status" id="scStatus"></div>';
      elStatus = document.getElementById("scStatus");
      elTrackCounter.textContent = "-/-";
      var sp = document.getElementById("scPlayer");
      if (sp) sp.classList.remove("sc-wide");
      activePlaylistId = null;
    },
  });

  window.showSoundCloud = function () {
    behavior.show();
  };
  window.scMinimizeWindow = function () {
    behavior.minimize();
  };
  window.scHasEntry = function () {
    return behavior.hasTaskbarEntry();
  };

  if (window.registerWindow) {
    registerWindow({
      minimize: function () {
        behavior.minimize();
      },
      show: function () {
        behavior.show();
      },
      hasEntry: function () {
        return behavior.hasTaskbarEntry();
      },
    });
  }

  function updatePlayBtn() {
    if (isPlaying) {
      elPlayIcon.style.display = "none";
      elPauseIcon.style.display = "block";
      elBtnPlay.classList.add("sc-btn-play-active");
    } else {
      elPlayIcon.style.display = "block";
      elPauseIcon.style.display = "none";
      elBtnPlay.classList.remove("sc-btn-play-active");
    }
  }

  /* ===== Custom playlists persistence ===== */
  function loadCustomPlaylists() {
    try {
      var d = JSON.parse(localStorage.getItem("scCustomPlaylists"));
      if (d && d.list) {
        customPlaylists = d.list;
        nextCustomId = d.nextId || 1;
      }
    } catch (e) {}
    for (var i = 0; i < customPlaylists.length; i++) {
      playlists.push(customPlaylists[i]);
    }
  }
  loadCustomPlaylists();

  /* ===== Init ===== */
  elArtImg.style.display = "none";
  renderPlaylists();
  initWidgets();
})();
