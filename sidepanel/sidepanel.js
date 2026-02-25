(() => {
  const responseArea = document.getElementById("response-area");
  const contextBar = document.getElementById("context-bar");
  const contextText = document.getElementById("context-text");
  const followupInput = document.getElementById("followup-input");
  const followupSend = document.getElementById("followup-send");
  const newChatBtn = document.getElementById("new-chat-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const providerIconsEl = document.getElementById("provider-icons");
  const modelSelect = document.getElementById("model-select");

  let conversationHistory = [];
  let currentSelectedText = "";
  let port = null;
  let allConfigs = {};
  let activeProviderId = "";

  async function init() {
    await loadProviderBar();

    try {
      port = chrome.runtime.connect({ name: "side-panel" });
    } catch {
      showError("Extension was updated or reloaded. Please close and reopen this panel.");
      return;
    }
    port.onDisconnect.addListener(() => {
      port = null;
    });
    port.postMessage({ type: MSG_TYPES.GET_CONTEXT });

    port.onMessage.addListener((msg) => {
      if (msg.type === MSG_TYPES.CONTEXT_DATA && msg.data) {
        currentSelectedText = msg.data.selectedText || "";
        if (currentSelectedText) {
          contextBar.style.display = "block";
          contextText.textContent = currentSelectedText.length > 200
            ? currentSelectedText.slice(0, 200) + "..."
            : currentSelectedText;
        }

        if (msg.data.responseText) {
          responseArea.innerHTML = "";
          conversationHistory = [
            { role: "system", content: "You are a helpful AI assistant integrated into a browser extension. Provide clear, concise, and well-formatted responses. Use markdown formatting when helpful." },
            { role: "user", content: currentSelectedText },
            { role: "assistant", content: msg.data.responseText }
          ];
          appendMessage("assistant", msg.data.responseText);
        }
      }

      if (msg.type === MSG_TYPES.STREAM_CHUNK) {
        appendStreamChunk(msg.text);
      }

      if (msg.type === MSG_TYPES.STREAM_DONE) {
        finalizeStream();
      }

      if (msg.type === MSG_TYPES.STREAM_ERROR) {
        showError(msg.error);
      }
    });
  }

  async function loadProviderBar() {
    activeProviderId = await Storage.getActiveProvider();
    allConfigs = await Storage.getAllConfigs();

    providerIconsEl.innerHTML = "";

    let hasConfigured = false;
    for (const [id, provider] of Object.entries(PROVIDERS)) {
      if (!allConfigs[id]?.apiKey) continue;
      hasConfigured = true;

      const btn = document.createElement("button");
      btn.className = "provider-icon-btn";
      btn.style.setProperty("--brand-color", provider.brandColor);
      btn.title = provider.name;
      const img = document.createElement("img");
      img.src = `../${provider.iconPath}`;
      img.alt = provider.name;
      img.width = 15;
      img.height = 15;
      btn.appendChild(img);
      if (id === activeProviderId) btn.classList.add("active");

      btn.addEventListener("click", async () => {
        activeProviderId = id;
        await Storage.setActiveProvider(id);
        providerIconsEl.querySelectorAll(".provider-icon-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        populateModels(id);

        const config = allConfigs[id] || {};
        if (!config.selectedModel) {
          config.selectedModel = PROVIDERS[id].models.find(m => m.default)?.id || PROVIDERS[id].models[0].id;
          allConfigs[id] = config;
          await Storage.setProviderConfig(id, config);
        }
      });

      providerIconsEl.appendChild(btn);
    }

    if (!hasConfigured) {
      providerIconsEl.innerHTML = '<span style="font-size:11px;color:#94A3B8;">No providers</span>';
      modelSelect.innerHTML = "";
      return;
    }

    if (!activeProviderId || !allConfigs[activeProviderId]?.apiKey) {
      const firstBtn = providerIconsEl.querySelector(".provider-icon-btn");
      if (firstBtn) {
        firstBtn.click();
        return;
      }
    }

    populateModels(activeProviderId);
  }

  function populateModels(providerId) {
    modelSelect.innerHTML = "";
    if (!providerId || !PROVIDERS[providerId]) return;

    const provider = PROVIDERS[providerId];
    const config = allConfigs[providerId] || {};
    const selectedModel = config.selectedModel || provider.models.find(m => m.default)?.id;

    for (const model of provider.models) {
      const opt = document.createElement("option");
      opt.value = model.id;
      opt.textContent = model.name;
      if (model.id === selectedModel) opt.selected = true;
      modelSelect.appendChild(opt);
    }
  }

  modelSelect.addEventListener("change", async () => {
    const config = allConfigs[activeProviderId] || {};
    config.selectedModel = modelSelect.value;
    allConfigs[activeProviderId] = config;
    await Storage.setProviderConfig(activeProviderId, config);
  });

  let currentStreamEl = null;
  let currentStreamText = "";

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    if (role === "assistant") {
      div.innerHTML = Markdown.parse(text);
    } else {
      div.textContent = text;
    }
    responseArea.appendChild(div);
    responseArea.scrollTop = responseArea.scrollHeight;
  }

  function showLoading() {
    const div = document.createElement("div");
    div.className = "loading-dots";
    div.id = "loading";
    div.innerHTML = "<span></span><span></span><span></span>";
    responseArea.appendChild(div);
    responseArea.scrollTop = responseArea.scrollHeight;
  }

  function removeLoading() {
    const el = document.getElementById("loading");
    if (el) el.remove();
  }

  function appendStreamChunk(text) {
    removeLoading();
    if (!currentStreamEl) {
      currentStreamEl = document.createElement("div");
      currentStreamEl.className = "message assistant";
      responseArea.appendChild(currentStreamEl);
      currentStreamText = "";
    }
    currentStreamText += text;
    currentStreamEl.innerHTML = Markdown.parse(currentStreamText);
    responseArea.scrollTop = responseArea.scrollHeight;
  }

  function finalizeStream() {
    if (currentStreamText) {
      conversationHistory.push({ role: "assistant", content: currentStreamText });
    }
    currentStreamEl = null;
    currentStreamText = "";
  }

  function showError(error) {
    removeLoading();
    const div = document.createElement("div");
    div.className = "message error";
    div.textContent = error;
    responseArea.appendChild(div);
    responseArea.scrollTop = responseArea.scrollHeight;
  }

  function sendFollowup(question) {
    if (!question.trim()) return;
    if (!port) {
      showError("Connection lost. Please close and reopen this panel.");
      return;
    }

    appendMessage("user", question);
    showLoading();

    conversationHistory.push({ role: "user", content: question });

    try {
      port.postMessage({
        type: MSG_TYPES.QUERY_AI,
        selectedText: currentSelectedText,
        customQuestion: question,
        conversationHistory: conversationHistory
      });
    } catch {
      showError("Connection lost. Please close and reopen this panel.");
    }

    followupInput.value = "";
  }

  followupSend.addEventListener("click", () => sendFollowup(followupInput.value));
  followupInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendFollowup(followupInput.value);
  });

  newChatBtn.addEventListener("click", () => {
    conversationHistory = [];
    currentSelectedText = "";
    currentStreamEl = null;
    currentStreamText = "";
    responseArea.innerHTML = `<div class="empty-state"><p>Select text on any webpage and choose an action to get started.</p></div>`;
    contextBar.style.display = "none";
  });

  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  init();
})();
