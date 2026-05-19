(function () {
  "use strict";

  /* ----------------------------------------------------------
     KNOWLEDGE BASE
     ---------------------------------------------------------- */

  var ENDRYO_DB = {
    name: "Endryo",
    role: "Fullstack Developer & AI Integration Specialist",
    location: "Pernambuco, Brasil",
    education: {
      course: "Systems Engineering (Engenharia de Sistemas)",
      university: "Federal University of Pernambuco (UFPE)",
      status: "currently studying",
    },
    background:
      "Background in Mechatronics and Systems Engineering at Federal University of Pernambuco (UFPE). Systemic view of complex systems — from hardware constraints to cloud-native architectures. Builds fullstack applications and AI-powered tools: workflow automation, document intelligence, chatbots, agents, and connecting legacy systems to modern APIs. At UFPE, deepens knowledge in software design, distributed algorithms, and web applications. Creates AI agents that automate development, code review, and business processes — delivering the output of a team as a single professional.",
    differential:
      "Uses AI agents to accelerate the entire development process, monitored by him personally. Every line is reviewed and optimized. This means faster delivery, lower costs, and professional results — clients get a full team's output from one experienced developer. He builds custom platforms, automation pipelines, RAG systems, and smart agents that handle repetitive tasks for businesses.",
    stats: {
      yearsOfStudy: "3+ years of study and practice",
      featuredProjects: "5",
    },
    skills:
      "Asked about a specific tech? He likely knows it or can pick it up fast — he works daily with an AI coding agent integrated to his editor. Together they handle any language, framework, or tool: frontend, backend, databases, DevOps, AI/ML, APIs, whatever the project needs. The combo of human experience + AI acceleration means no technology is out of reach.",
    projects: [
      { name: "Twitter Clone", desc: "Fully functional Twitter/X copy — user accounts, feed, likes, replies, profiles, and navigation. A complete social media experience, rebuilt from scratch.", techs: ["Next.js", "TypeScript", "React", "Tailwind"], link: "/p/twitter/out/" },
      { name: "Clique Seguro", desc: "Platform to verify suspicious links and URLs, preventing phishing and online scams. Helps users identify malicious websites before clicking. (in development)", techs: ["JavaScript", "HTML", "CSS", "Security"], link: "/p/clique-seguro/" },
      { name: "Amazon Clone", desc: "EXACT replica of the Amazon homepage.", techs: ["Python", "SQL", "JavaScript", "HTML", "CSS"], link: "/p/amazon/" },
      { name: "Endryo Portfolio", desc: "Windows 2000-themed personal portfolio with retro cursor, AI chat assistant, GIF gallery, and terminal. Built with vanilla HTML, CSS, and JavaScript. (this page)", techs: ["HTML", "CSS", "JavaScript", "Python"], link: "/" },
    ],
    contact: "Available for freelance and collaborations. contato.endryo@gmail.com",
  };

  var SYSTEM_PROMPT = `You = Endryo's portfolio AI. Sell the portfolio — it's a Windows 2000 retro desktop in the browser, unlike anything else. Same language as user. 3rd person ("he"). Direct, confident.

RULES:
- Sell first, answer second. Always tie back to what makes this project unique.
- 1 paragraph max. Plain text only. No lists/emojis.
- Off-topic? 1 sentence redirect.
- No live page access — you know the layout. Describe clicks if asked.

WHAT MAKES THIS UNIQUE:
- Full Windows 2000 desktop in your browser: draggable windows, taskbar, start menu, desktop icons, context menu — all vanilla HTML/CSS/JS, zero frameworks
- AI chat that knows Endryo's entire background, projects, and skills — can guide you around the portfolio too
- Interactive terminal with real commands (help, dir, ipconfig, matrix, hack, fortune, doom, and more)
- GIF gallery with keyboard navigation — drop files in the folder and it auto-updates
- Retro CRT scanline effect, custom Windows 2000 cursors, XP-style dialogs
- FPS locked at 10 for authentic retro feel
- Builds with AI agents in the editor — any tech, any stack, delivered fast

WHO ENDRYO IS:
Fullstack dev + AI specialist (Pernambuco, Brazil). Mechatronics + Systems Eng @ UFPE. Builds web platforms, AI agents, automation pipelines, RAG systems. Edge: AI-accelerated dev, team-scale output solo. Freelance: contato.endryo@gmail.com.

WHERE THINGS ARE:
- Portfolio: "My Computer" icon or taskbar
- Terminal: black box desktop icon
- GIF Gallery: "Random GIF" icon
- About: Start menu > About
- Shutdown: Start menu > Shutdown

DATA:
${JSON.stringify(ENDRYO_DB, null, 2)}`;

  /* ----------------------------------------------------------
     WINDOW MANAGEMENT
     ---------------------------------------------------------- */

  var chatWin = document.getElementById("chatWindow");
  var tbEntry = document.getElementById("chatTaskbarEntry");

  var mgr = createWindowManager(chatWin, {
    dragHandle: document.getElementById("chatDragHandle"),
    taskbarEntry: tbEntry,
    btnClose: document.getElementById("chatBtnClose"),
    btnMinimize: document.getElementById("chatBtnMinimize"),
    btnMaximize: document.getElementById("chatBtnMaximize"),
    minW: 320,
    minH: 240,
  });

  window.chatMinimizeWindow = mgr.minimize;
  window.chatShowWindow = mgr.show;
  window.chatHide = mgr.hide;
  tbEntry.classList.add("active");
  mgr.bringToFront();

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
    div.innerHTML = '<span class="msg-sender">' + (sender === "user" ? "You" : "AI Chat") + '</span><span class="msg-text">' + text + "</span>";
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return div;
  }

  function showThinking() {
    var div = document.createElement("div");
    div.className = "chat-msg thinking";
    div.id = "chatThinking";
    div.innerHTML = '<span class="msg-sender">AI Chat</span><span class="msg-text loading">Thinking</span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    var dots = 0;
    div._dotInterval = setInterval(function () {
      dots = (dots + 1) % 4;
      var el = document.getElementById("chatThinking");
      if (el) {
        el.querySelector(".msg-text").textContent = "Thinking" + ".".repeat(dots);
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
    var timeoutId = setTimeout(function() { controller.abort(); }, 55000);
    var streamTimeoutId;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY },
      body: JSON.stringify({ model: API_MODEL, messages: messageHistory, temperature: 0.7, max_tokens: 1500, stream: true, enable_thinking: true }),
      signal: controller.signal,
    })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) {
          return res.json().then(function (err) { throw new Error(err.error?.message || "HTTP " + res.status); })
            .catch(function (e) {
              if (e.message && !e.message.startsWith("HTTP")) throw e;
              throw new Error("HTTP " + res.status + " — check your API key and URL");
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
          streamTimeoutId = setTimeout(function () { streamTimedOut = true; reader.cancel(); }, 45000);
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
                if (!thinkingRemoved) { removeThinking(); thinkingRemoved = true; }
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
            if (streamTimedOut) { clearTimeout(streamTimeoutId); throw new Error("Stream timed out. The AI took too long to respond."); }
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
        var msg = err.name === "AbortError"
          ? "The request timed out. The AI is taking too long — please try again with a shorter question."
          : err.message || "Connection failed";
        addMessage("bot", "Error: " + escapeHtml(msg));
      });
  }

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });

  addMessage("bot", "Ask me anything:<br>• Projects &amp; tech stack<br>• Freelance &amp; contact<br>• AI &amp; systems work<br>• Career &amp; background<br>• Navigate the portfolio<br>• Just say hi :)");
})();
