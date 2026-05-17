/* ============================================================
   chat.js  —  AI Chat assistant with local knowledge base
   Requires fps-limiter.js (for __addTick, __domWrite)
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
       KNOWLEDGE BASE — structured data about Endryo
       ---------------------------------------------------------- */

  var ENDRYO_DB = {
    name: "Endryo",
    role: "Fullstack Developer & AI Integration Specialist",
    location: "Pernambuco, Brasil",
    education: {
      course: "Systems Engineering (Engenharia de Sistemas)",
      university: "Universidade Federal de Pernambuco (UFPE)",
      status: "currently studying",
    },
    background:
      "Background in Mechatronics and Systems Engineering at UFPE. Systemic view of complex systems — from hardware constraints to cloud-native architectures. Builds fullstack applications and AI-powered tools: workflow automation, document intelligence, connecting legacy systems to modern APIs. At UFPE, deepens knowledge in software design, distributed algorithms, and web applications.",
    differential:
      "Uses AI agents to accelerate the entire development process, monitored by him, ensuring quality and faster delivery. Every line is reviewed and optimized by an experienced developer.",
    stats: {
      yearsOfStudy: "3+ years of study and practice",
      featuredProjects: "5",
    },
    skills: {
      languages: ["Python", "TypeScript", "JavaScript"],
      frontend: ["React", "Next.js", "TypeScript", "HTML", "CSS", "Tailwind"],
      backend: ["FastAPI", "Node.js", "REST APIs", "WebSockets"],
      databases: ["PostgreSQL", "Redis", "Vector DBs", "ChromaDB"],
      ai: [
        "LangChain",
        "LLM Integration",
        "AI Agents",
        "RAG Pipelines",
        "Prompt Engineering",
        "Code Analysis",
        "Automation",
      ],
      devops: ["Docker", "Linux", "Git", "Cloud"],
      tools: ["Stripe"],
    },
    projects: [
      {
        name: "Twitter Clone",
        desc: "Full Twitter clone with authentication, timeline, likes, replies, and profile. Built with Next.js 14, TypeScript, and modern React patterns.",
        techs: ["Next.js", "TypeScript", "React", "Tailwind"],
        link: "/p/twitter/out/",
      },
      {
        name: "Clique Seguro",
        desc: "Platform to verify suspicious links and URLs, preventing phishing and online scams. Helps users identify malicious websites before clicking. (in development)",
        techs: ["JavaScript", "HTML", "CSS", "Security"],
        link: "/p/clique-seguro/",
      },
      {
        name: "Amazon Clone",
        desc: "EXACT replica of the Amazon homepage.",
        techs: ["Python", "SQL", "JavaScript", "HTML", "CSS"],
        link: "/p/amazon/",
      },
      {
        name: "Endryo Portfolio",
        desc: "Windows 2000-themed personal portfolio with retro cursor, AI chat assistant, GIF gallery, and terminal. Built with vanilla HTML, CSS, and JavaScript. (this page)",
        techs: ["HTML", "CSS", "JavaScript", "Python"],
        link: "/",
      },
    ],
    contact:
      "Available for freelance and collaborations. contato.endrio@gmail.com",
  };

  var SYSTEM_PROMPT = `You present the portfolio of Endryo, a Fullstack Developer & AI Integration Specialist. Third person ("he", "Endryo"). Same language as user. Professional chat tone — natural and direct.

RULES:
- Answer ONLY what was asked. Never add extra info, explanations, or clarifications unless requested.
- If the question is NOT about Endryo or his work, give the shortest possible answer (1 sentence max) and stop.
- Keep ALL answers as short as possible. One paragraph max unless the user asks for details.
- No formatting, lists, or emojis. Plain text only.
- Do not invent information — use only the knowledge base.

KNOWLEDGE BASE:
${JSON.stringify(ENDRYO_DB, null, 2)}`;

  /* ----------------------------------------------------------
       WINDOW MANAGEMENT
       ---------------------------------------------------------- */

  var chatWin = document.getElementById("chatWindow");
  var chatBody = document.getElementById("chatBody");
  var chatDragHandle = document.getElementById("chatDragHandle");
  var chatBtnClose = document.getElementById("chatBtnClose");
  var chatBtnMinimize = document.getElementById("chatBtnMinimize");
  var chatBtnMaximize = document.getElementById("chatBtnMaximize");
  var chatTaskbarEntry = document.getElementById("chatTaskbarEntry");
  var chatResizeHandle = document.getElementById("chatResizeHandle");

  var chatMinimized = false;
  var chatMaximized = false;
  var chatPrevRect = null;
  var chatDragState = null;
  chatTaskbarEntry.classList.add("active");
  chatBringToFront();

  function chatBringToFront() {
    var all = document.querySelectorAll(".window");
    var maxZ = 100;
    for (var i = 0; i < all.length; i++) {
      var z = parseInt(all[i].style.zIndex) || 0;
      if (z > maxZ) maxZ = z;
    }
    chatWin.style.zIndex = maxZ + 1;
  }

  function chatSaveRect() {
    chatPrevRect = {
      left: chatWin.style.left,
      top: chatWin.style.top,
      width: chatWin.style.width,
      height: chatWin.style.height,
    };
  }

  function chatShow() {
    if (chatMinimized) {
      chatRestoreWindow();
    } else {
      chatWin.style.display = "";
      chatMinimized = false;
      chatTaskbarEntry.classList.add("active");
      chatBringToFront();
    }
  }

  function chatHide() {
    if (chatMinimized) return;
    chatSaveRect();
    chatMinimized = true;
    chatWin.style.display = "none";
    chatTaskbarEntry.classList.remove("active");
  }

  chatBtnClose.addEventListener("click", chatHide);
  chatBtnMinimize.addEventListener("click", function () {
    if (chatMaximized) {
      chatHide();
      return;
    }
    chatMinimizeWindow();
  });
  window.chatMinimizeWindow = chatMinimizeWindow;
  window.chatHide = chatHide;

  function chatMinimizeWindow() {
    if (chatMinimized) return;
    var tbEntry = chatTaskbarEntry;
    var winRect = chatWin.getBoundingClientRect();
    var tbRect = tbEntry.getBoundingClientRect();
    var sx = winRect.left,
      sy = winRect.top;
    var sw = winRect.width,
      sh = winRect.height;
    var tx = tbRect.left + 4,
      ty = tbRect.top + 2;
    var tw = Math.max(20, tbRect.width - 8),
      th = Math.max(4, tbRect.height - 4);
    chatMinimized = true;
    chatSaveRect();
    tbEntry.classList.remove("active");
    chatWin.style.transition = "none";
    chatWin.style.left = sx + "px";
    chatWin.style.top = sy + "px";
    chatWin.style.width = sw + "px";
    chatWin.style.height = sh + "px";
    requestAnimationFrame(function () {
      chatWin.style.transition = "all 0.2s steps(4)";
      chatWin.style.left = tx + "px";
      chatWin.style.top = ty + "px";
      chatWin.style.width = tw + "px";
      chatWin.style.height = th + "px";
      setTimeout(function () {
        chatWin.style.display = "none";
        chatWin.style.transition = "";
        chatWin.style.left = sx + "px";
        chatWin.style.top = sy + "px";
        chatWin.style.width = sw + "px";
        chatWin.style.height = sh + "px";
      }, 300);
    });
  }

  function chatRestoreWindow() {
    if (!chatMinimized) return;
    chatMinimized = false;
    var tbEntry = chatTaskbarEntry;
    var tbRect = tbEntry.getBoundingClientRect();
    var tx = tbRect.left + 4,
      ty = tbRect.top + 2;
    var tw = Math.max(20, tbRect.width - 8),
      th = Math.max(4, tbRect.height - 4);
    var cx = chatPrevRect ? parseInt(chatPrevRect.left) : 40;
    var cy = chatPrevRect ? parseInt(chatPrevRect.top) : 40;
    var cw = chatPrevRect ? parseInt(chatPrevRect.width) : 420;
    var ch = chatPrevRect ? parseInt(chatPrevRect.height) : 460;
    chatWin.style.display = "";
    chatWin.style.transition = "none";
    chatWin.style.left = tx + "px";
    chatWin.style.top = ty + "px";
    chatWin.style.width = tw + "px";
    chatWin.style.height = th + "px";
    requestAnimationFrame(function () {
      chatWin.style.transition = "all 0.2s steps(4)";
      chatWin.style.left = cx + "px";
      chatWin.style.top = cy + "px";
      chatWin.style.width = cw + "px";
      chatWin.style.height = ch + "px";
      setTimeout(function () {
        chatWin.style.transition = "";
        tbEntry.classList.add("active");
      }, 300);
    });
  }

  chatBtnMaximize.addEventListener("click", function () {
    if (chatMaximized) {
      chatWin.style.left = chatPrevRect.left;
      chatWin.style.top = chatPrevRect.top;
      chatWin.style.width = chatPrevRect.width;
      chatWin.style.height = chatPrevRect.height;
      chatWin.classList.remove("window-maximized");
      chatMaximized = false;
    } else {
      chatSaveRect();
      var tb = document.querySelector(".taskbar");
      var th = tb ? tb.offsetHeight : 40;
      chatWin.style.left = "0px";
      chatWin.style.top = "0px";
      chatWin.style.width = window.innerWidth + "px";
      chatWin.style.height = window.innerHeight - th + "px";
      chatWin.classList.add("window-maximized");
      chatMaximized = true;
    }
  });

  chatTaskbarEntry.addEventListener("click", function () {
    if (document.body.classList.contains("mobile-mode")) {
      if (chatWin.classList.contains("active")) {
        chatWin.classList.remove("active");
        chatTaskbarEntry.classList.remove("active");
      } else {
        document.querySelectorAll(".window").forEach(function (w) {
          w.classList.remove("active");
        });
        document.querySelectorAll(".taskbar-item").forEach(function (t) {
          t.classList.remove("active");
        });
        chatWin.classList.add("active");
        chatTaskbarEntry.classList.add("active");
        chatBringToFront();
      }
      return;
    }
    if (chatMinimized || chatWin.style.display === "none") {
      chatShow();
    } else {
      chatBringToFront();
    }
  });

  chatWin.addEventListener("mousedown", chatBringToFront);

  /* ----------------------------------------------------------
       DRAG
       ---------------------------------------------------------- */

  chatDragHandle.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("win-btn")) return;
    var rect = chatWin.getBoundingClientRect();
    chatDragState = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: rect.left,
      startY: rect.top,
    };
    chatWin.style.cursor = "move";
  });

  chatDragHandle.addEventListener("dblclick", function (e) {
    if (e.target.classList.contains("win-btn")) return;
    document.getElementById("chatBtnMaximize").click();
  });

  document.addEventListener("mousemove", function (e) {
    if (!chatDragState) return;
    if (!chatMaximized) {
      var snap = 12;
      if (e.clientY < snap) {
        document.getElementById("chatBtnMaximize").click();
        chatDragState = null;
        chatWin.style.cursor = "";
        return;
      }
    } else {
      if (e.clientY > chatDragState.offsetY + 8) {
        document.getElementById("chatBtnMaximize").click();
        chatDragState.offsetX = e.clientX - parseInt(chatWin.style.left);
        chatDragState.offsetY = e.clientY - parseInt(chatWin.style.top);
      }
    }
    var l = e.clientX - chatDragState.offsetX;
    var t = e.clientY - chatDragState.offsetY;
    l = Math.max(
      -chatWin.offsetWidth + 60,
      Math.min(l, window.innerWidth - 60),
    );
    t = Math.max(0, Math.min(t, window.innerHeight - 50));
    window.__domWrite(function () {
      chatWin.style.left = l + "px";
      chatWin.style.top = t + "px";
    });
  });

  document.addEventListener("mouseup", function () {
    if (chatDragState) {
      chatDragState = null;
      chatWin.style.cursor = "";
    }
  });

  /* ----------------------------------------------------------
       RESIZE — edge & corner dragging
       ---------------------------------------------------------- */

  (function () {
    var edges = chatWin.querySelectorAll(".resize-edge, .resize-corner");
    if (!edges.length) return;

    var MIN_W = 320,
      MIN_H = 240;
    var resizeState = null;

    function startResize(e, edge) {
      e.preventDefault();
      e.stopPropagation();
      var rect = chatWin.getBoundingClientRect();
      resizeState = {
        edge: edge,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left,
        startTop: rect.top,
        startW: rect.width,
        startH: rect.height,
      };
    }

    function doResize(e) {
      if (!resizeState) return;
      var s = resizeState;
      var dx = e.clientX - s.startX;
      var dy = e.clientY - s.startY;
      var edge = s.edge;
      var newL = s.startLeft,
        newT = s.startTop;
      var newW = s.startW,
        newH = s.startH;

      if (edge.indexOf("l") !== -1) {
        newL = s.startLeft + dx;
        newW = s.startW - dx;
        if (newW < MIN_W) {
          newW = MIN_W;
          newL = s.startLeft + s.startW - MIN_W;
        }
        newL = Math.max(0, newL);
        newW = Math.min(newW, window.innerWidth - newL);
      } else if (edge.indexOf("r") !== -1) {
        newW = s.startW + dx;
        newW = Math.max(MIN_W, Math.min(newW, window.innerWidth - s.startLeft));
      }

      if (edge.indexOf("t") !== -1) {
        newT = s.startTop + dy;
        newH = s.startH - dy;
        if (newH < MIN_H) {
          newH = MIN_H;
          newT = s.startTop + s.startH - MIN_H;
        }
        newT = Math.max(0, newT);
        newH = Math.min(newH, window.innerHeight - newT - 40);
      } else if (edge.indexOf("b") !== -1) {
        newH = s.startH + dy;
        newH = Math.max(
          MIN_H,
          Math.min(newH, window.innerHeight - s.startTop - 40),
        );
      }

      window.__domWrite(function () {
        chatWin.style.left = newL + "px";
        chatWin.style.top = newT + "px";
        chatWin.style.width = newW + "px";
        chatWin.style.height = newH + "px";
      });
    }

    function endResize() {
      if (resizeState) {
        resizeState = null;
        if (chatMaximized) {
          chatMaximized = false;
          chatWin.classList.remove("window-maximized");
        }
      }
    }

    for (var i = 0; i < edges.length; i++) {
      (function (el) {
        el.addEventListener("mousedown", function (e) {
          startResize(e, el.getAttribute("data-edge"));
        });
      })(edges[i]);
    }

    document.addEventListener("mousemove", doResize);
    document.addEventListener("mouseup", endResize);
  })();

  /* ----------------------------------------------------------
       RESIZE HANDLER
       ---------------------------------------------------------- */

  window.addEventListener("resize", function () {
    if (chatMaximized) {
      var tb = document.querySelector(".taskbar");
      var th = tb ? tb.offsetHeight : 40;
      chatWin.style.width = window.innerWidth + "px";
      chatWin.style.height = window.innerHeight - th + "px";
    }
  });

  /* ----------------------------------------------------------
       CHAT LOGIC
       ---------------------------------------------------------- */

  var chatMessages = document.getElementById("chatMessages");
  var chatInput = document.getElementById("chatInput");
  var chatSendBtn = document.getElementById("chatSendBtn");

  var API_KEY = "proxy";
  var API_URL = "/api/chat";
  var API_MODEL = "qwen3.5-35b-a3b";

  var messageHistory = [{ role: "system", content: SYSTEM_PROMPT }];

  function addMessage(sender, text, className) {
    var div = document.createElement("div");
    div.className = "chat-msg " + (className || sender);
    div.innerHTML =
      '<span class="msg-sender">' +
      (sender === "user" ? "You" : "AI Chat") +
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
      '<span class="msg-sender">AI Chat</span>' +
      '<span class="msg-text loading">Thinking</span>';
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    var dots = 0;
    div._dotInterval = setInterval(function () {
      dots = (dots + 1) % 4;
      var el = document.getElementById("chatThinking");
      if (el) {
        el.querySelector(".msg-text").textContent =
          "Thinking" + ".".repeat(dots);
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
        enable_thinking: false,
      }),
    })
      .then(function (res) {
        if (!res.ok) {
          return res
            .json()
            .then(function (err) {
              throw new Error(err.error?.message || "HTTP " + res.status);
            })
            .catch(function (e) {
              if (e.message && !e.message.startsWith("HTTP")) throw e;
              throw new Error(
                "HTTP " + res.status + " — check your API key and URL",
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

        function processLine(line) {
          if (line.startsWith("data: ")) {
            var data = line.slice(6).trim();
            if (data === "[DONE]") return true;
            try {
              var parsed = JSON.parse(data);
              var content = parsed.choices?.[0]?.delta?.content || "";
              if (content) {
                if (!thinkingRemoved) {
                  removeThinking();
                  thinkingRemoved = true;
                }
                reply += content;
                msgDiv.querySelector(".msg-text").textContent = reply;
                chatMessages.scrollTop = chatMessages.scrollHeight;
              }
            } catch (e) {}
          }
          return false;
        }

        function pump() {
          return reader.read().then(function (result) {
            if (result.done) {
              if (buffer) processLine(buffer);
              messageHistory.push({ role: "assistant", content: reply });
              return;
            }
            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (var i = 0; i < lines.length; i++) {
              if (processLine(lines[i])) {
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
        removeThinking();
        var msg = err.message || "Connection failed";
        addMessage("bot", "Error: " + escapeHtml(msg));
      });
  }

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendMessage();
  });
})();
