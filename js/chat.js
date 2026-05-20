(function () {
  "use strict";

  var SYSTEM_PROMPT = `Você é uma amiga sincera e divertida que mora dentro de um desktop Windows 2000. Use o mesmo idioma da pessoa, no casual, sem firmeza. Sem emojis/lista/formatação, mas pode usar figuras tipo ^^ ou :P. Máximo 2 parágrafos. Se não tiver certeza de algo, só fala que não tem certeza.`;

  /* ----------------------------------------------------------
     WINDOW MANAGEMENT
     ---------------------------------------------------------- */

  var chatWin = document.getElementById("chatWindow");
  var chatBody = document.getElementById("chatBody");
  var chatDragHandle = document.getElementById("chatDragHandle");
  var chatBtnClose = document.getElementById("chatBtnClose");
  var chatBtnMinimize = document.getElementById("chatBtnMinimize");
  var chatBtnMaximize = document.getElementById("chatBtnMaximize");

  var chatBehavior = new WindowBehavior(chatWin, {
    dragHandle: chatDragHandle,
    btnClose: chatBtnClose,
    btnMinimize: chatBtnMinimize,
    btnMaximize: chatBtnMaximize,
    minW: 320,
    minH: 240,
    taskbarIcon:
      '<svg viewBox="0 0 16 16" width="14" height="14" style="flex-shrink:0;"><rect x="1" y="3" width="14" height="10" fill="#c8d8e8" stroke="#5a7a9a" stroke-width="2"/><rect x="1" y="3" width="14" height="3" fill="#0a1a4a"/><text x="8" y="11" text-anchor="middle" fill="#0a1a4a" font-size="7" font-weight="bold">AI</text></svg>',
    taskbarLabel: "Chat IA",
    onShow: function () {
      chatWin.style.left = "";
      chatWin.style.top = "";
      chatWin.style.width = "360px";
      chatWin.style.height = "480px";
    },
  });

  window.chatShowWindow = function () {
    chatBehavior.show();
  };
  window.chatMinimizeWindow = function () {
    chatBehavior.minimize();
  };
  window.chatHide = function () {
    chatBehavior.hide();
  };
  window.chatHasEntry = function () {
    return chatBehavior.hasTaskbarEntry();
  };

  if (window.registerWindow) {
    registerWindow({
      minimize: function () {
        chatBehavior.minimize();
      },
      show: function () {
        chatBehavior.show();
      },
      hasEntry: function () {
        return chatBehavior.hasTaskbarEntry();
      },
    });
  }

  /* ----------------------------------------------------------
     MOBILE KEYBOARD HANDLER
     ---------------------------------------------------------- */

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
      if (!document.body.classList.contains("mobile-mode")) return;
      var diff = window.innerHeight - window.visualViewport.height;
      if (diff > 100) {
        chatWin.style.bottom = diff + "px";
        chatWin.style.top = "0";
        chatWin.style.height = "auto";
      } else {
        chatWin.style.bottom = "34px";
        chatWin.style.top = "0";
        chatWin.style.height = "auto";
      }
      setTimeout(function () {
        var msgs = document.getElementById("chatMessages");
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
      }, 100);
    });
  }

  /* ----------------------------------------------------------
     CHAT LOGIC
     ---------------------------------------------------------- */

  var chatMessages = document.getElementById("chatMessages");
  var chatInput = document.getElementById("chatInput");
  var chatSendBtn = document.getElementById("chatSendBtn");

  var API_KEY = "proxy";
  var API_URL = "/api/chat";
  var API_MODEL = "qwen3.5-plus-2026-02-15";

  var messageHistory = [{ role: "system", content: SYSTEM_PROMPT }];

  function addMessage(sender, text, className) {
    var div = document.createElement("div");
    div.className = "chat-msg " + (className || sender);
    div.innerHTML =
      '<span class="msg-sender">' +
      (sender === "user" ? "Você" : "Chat IA") +
      '</span><span class="msg-text">' +
      text +
      "</span>";
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function showThinking() {
    var div = document.createElement("div");
    div.className = "chat-msg thinking";
    div.id = "chatThinking";
    div.innerHTML =
      '<span class="msg-sender">Chat IA</span><span class="msg-text loading">Pensando</span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    var dots = 0;
    div._dotInterval = setInterval(function () {
      dots = (dots + 1) % 4;
      var el = document.getElementById("chatThinking");
      if (el) {
        el.querySelector(".msg-text").textContent =
          "Pensando" + ".".repeat(dots);
      } else {
        clearInterval(div._dotInterval);
      }
    }, 400);
  }

  function removeThinking() {
    var el = document.getElementById("chatThinking");
    if (el) {
      if (el._dotInterval) clearInterval(el._dotInterval);
      el.remove();
    }
  }

  function escapeHtml(text) {
    var d = document.createElement("div");
    d.appendChild(document.createTextNode(text));
    return d.innerHTML;
  }

  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";
    addMessage("user", escapeHtml(text));
    messageHistory.push({ role: "user", content: text });
    showThinking();

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, 55000);
    var streamTimeoutId;

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + API_KEY,
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: messageHistory,
        temperature: 0.7,
        max_tokens: 1500,
        stream: true,
        enable_thinking: true,
      }),
      signal: controller.signal,
    })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) {
          return res
            .json()
            .then(function (err) {
              throw new Error(err.error?.message || "HTTP " + res.status);
            })
            .catch(function (e) {
              if (e.message && !e.message.startsWith("HTTP")) throw e;
              throw new Error(
                "HTTP " + res.status + " — verifique sua chave API e URL",
              );
            });
        }
        return res.body.getReader();
      })
      .then(function (reader) {
        var thinkingRemoved = false;
        var decoder = new TextDecoder();
        var buffer = "";
        var reply = "";
        var msgDiv = addMessage("bot", "");
        var streamTimedOut = false;

        function resetStreamTimeout() {
          clearTimeout(streamTimeoutId);
          streamTimeoutId = setTimeout(function () {
            streamTimedOut = true;
            reader.cancel();
          }, 45000);
        }
        resetStreamTimeout();

        function processLine(line) {
          if (line.startsWith("data: ")) {
            var data = line.slice(6).trim();
            if (data === "[DONE]") return true;
            try {
              var parsed = JSON.parse(data);
              var delta = parsed.choices?.[0]?.delta || {};
              if (delta.thinking) return false;
              var content = delta.content || "";
              if (content) {
                if (!thinkingRemoved) {
                  removeThinking();
                  thinkingRemoved = true;
                }
                reply += content;
                msgDiv.querySelector(".msg-text").textContent = reply;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                resetStreamTimeout();
              }
            } catch (e) {}
          }
          return false;
        }

        function pump() {
          return reader.read().then(function (result) {
            if (streamTimedOut) {
              clearTimeout(streamTimeoutId);
              throw new Error(
                "Stream expirou. A IA demorou muito para responder.",
              );
            }
            if (result.done) {
              clearTimeout(streamTimeoutId);
              if (buffer) processLine(buffer);
              messageHistory.push({ role: "assistant", content: reply });
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (var i = 0; i < lines.length; i++) {
              if (processLine(lines[i])) {
                clearTimeout(streamTimeoutId);
                messageHistory.push({ role: "assistant", content: reply });
                return reader.cancel();
              }
            }
            return pump();
          });
        }

        return pump();
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        clearTimeout(streamTimeoutId);
        removeThinking();
        var msg =
          err.name === "AbortError"
            ? "A requisição expirou. A IA está demorando muito — tente novamente com uma pergunta mais curta."
            : err.message || "Conexão falhou";
        addMessage("bot", "Erro: " + escapeHtml(msg));
      });
  }

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });
})();
