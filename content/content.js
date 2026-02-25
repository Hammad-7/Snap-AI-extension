(() => {
  let hostEl = null;
  let shadowRoot = null;
  let currentPort = null;
  let responseText = "";
  let selectedText = "";
  let lastMouseUpTime = 0;

  const SHADOW_STYLES = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .snapai-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(226, 232, 240, 0.8);
      max-width: 520px;
      animation: snapai-fadein 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .snapai-actions-row {
      display: flex;
      gap: 4px;
      width: 100%;
    }

    @keyframes snapai-fadein {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .snapai-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 7px 8px;
      background: #FFFFFF;
      color: #1E1B4B;
      border: 1px solid #E2E8F0;
      border-radius: 9px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      white-space: nowrap;
      line-height: 1;
    }

    .snapai-btn:hover {
      background: #EEF2FF;
      border-color: #C7D2FE;
      color: #4F46E5;
    }

    .snapai-btn:active {
      transform: scale(0.97);
    }

    .snapai-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.06);
    }

    .snapai-btn .icon {
      display: flex;
      align-items: center;
      color: #64748B;
      transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .snapai-btn .icon svg {
      width: 13px;
      height: 13px;
    }

    .snapai-btn:hover .icon {
      color: #4F46E5;
    }

    .snapai-provider-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      margin-top: 5px;
    }

    .snapai-provider-icons {
      display: flex;
      gap: 3px;
    }

    .snapai-picon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: 1.5px solid transparent;
      background: #F1F5F9;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.15s ease;
    }

    .snapai-picon img {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      opacity: 0.5;
      transition: opacity 0.15s ease;
    }

    .snapai-picon:hover {
      background: #F8FAFC;
      border-color: #CBD5E1;
    }

    .snapai-picon:hover img {
      opacity: 0.8;
    }

    .snapai-picon.active {
      border-color: #E2E8F0;
      background: #FFFFFF;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    }

    .snapai-picon.active img {
      opacity: 1;
    }

    .snapai-model-sel {
      flex: 1;
      min-width: 0;
      padding: 2px;
      background: transparent;
      color: #94A3B8;
      border: none;
      font-size: 11px;
      font-weight: 500;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    .snapai-model-sel:hover {
      color: #64748B;
    }

    .snapai-custom-row {
      display: flex;
      gap: 5px;
      width: 100%;
      margin-top: 5px;
    }

    .snapai-input {
      flex: 1;
      padding: 7px 12px;
      background: #FFFFFF;
      color: #1E1B4B;
      border: 1px solid #E2E8F0;
      border-radius: 9px;
      font-size: 12.5px;
      outline: none;
      font-family: inherit;
      transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .snapai-input::placeholder { color: #94A3B8; }
    .snapai-input:focus {
      border-color: #C7D2FE;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.06);
    }

    .snapai-send-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      background: #4F46E5;
      color: #FFFFFF;
      border: none;
      border-radius: 9px;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      line-height: 1;
    }

    .snapai-send-btn:hover { background: #4338CA; }
    .snapai-send-btn:active { transform: scale(0.97); }

    .snapai-response-container {
      margin-top: 8px;
      padding: 14px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 11px;
      max-height: 300px;
      overflow-y: auto;
      width: 100%;
    }

    .snapai-response-text {
      color: #1E1B4B;
      font-size: 13px;
      line-height: 1.65;
      word-wrap: break-word;
    }

    .snapai-response-text p { margin: 0 0 6px 0; }
    .snapai-response-text p:last-child { margin-bottom: 0; }
    .snapai-response-text br { display: block; margin: 4px 0; content: ""; }
    .snapai-response-text strong { font-weight: 600; color: #1E1B4B; }
    .snapai-response-text em { font-style: italic; color: #334155; }
    .snapai-response-text h3, .snapai-response-text h4, .snapai-response-text h5 {
      font-weight: 600; color: #1E1B4B; margin: 10px 0 4px 0;
    }
    .snapai-response-text h3 { font-size: 14px; }
    .snapai-response-text h4 { font-size: 13px; }
    .snapai-response-text h5 { font-size: 12.5px; }
    .snapai-response-text ul, .snapai-response-text ol {
      margin: 4px 0 6px 0; padding-left: 18px;
    }
    .snapai-response-text li { margin-bottom: 2px; }
    .snapai-response-text code {
      background: #F1F5F9; padding: 1px 5px; border-radius: 4px;
      font-family: "SF Mono", Menlo, monospace; font-size: 12px; color: #4F46E5;
    }
    .snapai-response-text pre {
      background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;
      padding: 10px 12px; margin: 6px 0; overflow-x: auto;
    }
    .snapai-response-text pre code {
      background: none; padding: 0; font-size: 12px; color: #1E1B4B;
    }

    .snapai-response-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
      margin-top: 10px;
    }

    .snapai-expand-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px;
      background: #EEF2FF;
      color: #4F46E5;
      border: 1px solid #C7D2FE;
      border-radius: 7px;
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .snapai-expand-btn:hover {
      background: #4F46E5;
      color: #FFFFFF;
      border-color: #4F46E5;
    }

    .snapai-expand-btn:active {
      transform: scale(0.97);
    }

    .snapai-loading {
      display: inline-flex;
      gap: 5px;
      padding: 4px 0;
    }

    .snapai-loading span {
      width: 6px; height: 6px;
      background: #4F46E5;
      border-radius: 50%;
      animation: snapai-bounce 1.2s infinite;
    }

    .snapai-loading span:nth-child(2) { animation-delay: 0.15s; }
    .snapai-loading span:nth-child(3) { animation-delay: 0.3s; }

    @keyframes snapai-bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }

    .snapai-error {
      color: #DC2626;
      font-size: 12px;
      padding: 10px;
      background: #FEF2F2;
      border-radius: 9px;
      border: 1px solid #FECACA;
    }

    .snapai-response-container::-webkit-scrollbar { width: 4px; }
    .snapai-response-container::-webkit-scrollbar-track { background: transparent; }
    .snapai-response-container::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 2px;
    }
  `;

  const ARROW_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>`;

  const EXTERNAL_LINK_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

  function removeToolbar() {
    if (hostEl) {
      hostEl.remove();
      hostEl = null;
      shadowRoot = null;
    }
    if (currentPort) {
      try { currentPort.disconnect(); } catch {}
      currentPort = null;
    }
    responseText = "";
  }

  function createToolbar(x, y) {
    removeToolbar();

    hostEl = document.createElement("div");
    hostEl.className = "snapai-host";
    shadowRoot = hostEl.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = SHADOW_STYLES;
    shadowRoot.appendChild(style);

    const toolbar = document.createElement("div");
    toolbar.className = "snapai-toolbar";

    // Action buttons in one row
    const actionsRow = document.createElement("div");
    actionsRow.className = "snapai-actions-row";
    for (const action of ACTIONS) {
      const btn = document.createElement("button");
      btn.className = "snapai-btn";
      btn.innerHTML = `<span class="icon">${action.icon}</span>${action.label}`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleAction(action.id, toolbar);
      });
      actionsRow.appendChild(btn);
    }
    toolbar.appendChild(actionsRow);

    // Custom question row
    const customRow = document.createElement("div");
    customRow.className = "snapai-custom-row";

    const input = document.createElement("input");
    input.className = "snapai-input";
    input.placeholder = "Ask anything about this text...";
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter" && input.value.trim()) {
        handleAction(null, toolbar, input.value.trim());
      }
    });

    const sendBtn = document.createElement("button");
    sendBtn.className = "snapai-send-btn";
    sendBtn.innerHTML = `Ask ${ARROW_SVG}`;
    sendBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (input.value.trim()) {
        handleAction(null, toolbar, input.value.trim());
      }
    });

    customRow.appendChild(input);
    customRow.appendChild(sendBtn);
    toolbar.appendChild(customRow);

    // Provider icon bar (below input)
    const providerBar = document.createElement("div");
    providerBar.className = "snapai-provider-bar";

    const iconsWrap = document.createElement("div");
    iconsWrap.className = "snapai-provider-icons";

    const modelSel = document.createElement("select");
    modelSel.className = "snapai-model-sel";

    function fillModels(pid, configs) {
      modelSel.innerHTML = "";
      if (!pid || !PROVIDERS[pid]) return;
      const p = PROVIDERS[pid];
      const cfg = configs[pid] || {};
      const sel = cfg.selectedModel || p.models.find(m => m.default)?.id;
      for (const m of p.models) {
        const o = document.createElement("option");
        o.value = m.id;
        o.textContent = m.name;
        if (m.id === sel) o.selected = true;
        modelSel.appendChild(o);
      }
    }

    (async () => {
      let activePid = await Storage.getActiveProvider();
      const configs = await Storage.getAllConfigs();

      for (const [id, provider] of Object.entries(PROVIDERS)) {
        if (!configs[id]?.apiKey) continue;

        const btn = document.createElement("button");
        btn.className = "snapai-picon";
        btn.title = provider.name;
        const img = document.createElement("img");
        img.src = chrome.runtime.getURL(provider.iconPath);
        img.alt = provider.name;
        btn.appendChild(img);
        if (id === activePid) btn.classList.add("active");

        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          activePid = id;
          await Storage.setActiveProvider(id);
          iconsWrap.querySelectorAll(".snapai-picon").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const latest = await Storage.getAllConfigs();
          fillModels(id, latest);
          const cfg = latest[id] || {};
          if (!cfg.selectedModel) {
            cfg.selectedModel = PROVIDERS[id].models.find(m => m.default)?.id || PROVIDERS[id].models[0].id;
            await Storage.setProviderConfig(id, cfg);
          }
        });

        iconsWrap.appendChild(btn);
      }

      fillModels(activePid, configs);

      modelSel.addEventListener("change", async (e) => {
        e.stopPropagation();
        const latest = await Storage.getAllConfigs();
        const cfg = latest[activePid] || {};
        cfg.selectedModel = modelSel.value;
        await Storage.setProviderConfig(activePid, cfg);
      });
    })();

    providerBar.appendChild(iconsWrap);
    providerBar.appendChild(modelSel);
    toolbar.appendChild(providerBar);

    shadowRoot.appendChild(toolbar);

    // Position the toolbar
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    hostEl.style.left = `${x + scrollX}px`;
    hostEl.style.top = `${y + scrollY + 8}px`;

    document.body.appendChild(hostEl);

    // Adjust if off-screen
    requestAnimationFrame(() => {
      const rect = hostEl.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        hostEl.style.left = `${window.innerWidth - rect.width - 10 + scrollX}px`;
      }
      if (rect.left < 0) {
        hostEl.style.left = `${10 + scrollX}px`;
      }
      if (rect.bottom > window.innerHeight) {
        hostEl.style.top = `${y + scrollY - rect.height - 8}px`;
      }
    });
  }

  function handleAction(actionId, toolbar, customQuestion) {
    // Show loading in response area
    let responseContainer = shadowRoot.querySelector(".snapai-response-container");
    if (!responseContainer) {
      responseContainer = document.createElement("div");
      responseContainer.className = "snapai-response-container";
      toolbar.appendChild(responseContainer);
    }

    // Check extension context before any chrome.runtime call
    if (!chrome.runtime?.id) {
      responseContainer.innerHTML = `<div class="snapai-error">Extension was updated or reloaded. Please refresh this page.</div>`;
      return;
    }

    responseContainer.innerHTML = `<div class="snapai-loading"><span></span><span></span><span></span></div>`;
    responseText = "";

    // Disconnect previous port safely
    if (currentPort) {
      try { currentPort.disconnect(); } catch {}
      currentPort = null;
    }
    try {
      currentPort = chrome.runtime.connect({ name: "ai-stream" });
    } catch {
      responseContainer.innerHTML = `<div class="snapai-error">Extension was updated or reloaded. Please refresh this page.</div>`;
      return;
    }

    const responseEl = document.createElement("div");
    responseEl.className = "snapai-response-text";

    currentPort.onDisconnect.addListener(() => {
      currentPort = null;
    });

    currentPort.onMessage.addListener((msg) => {
      if (msg.type === MSG_TYPES.STREAM_CHUNK) {
        responseText += msg.text;
        responseContainer.innerHTML = "";
        responseEl.innerHTML = Markdown.parse(responseText);
        responseContainer.appendChild(responseEl);

        // Add expand button
        let actions = shadowRoot.querySelector(".snapai-response-actions");
        if (!actions) {
          actions = document.createElement("div");
          actions.className = "snapai-response-actions";
          const expandBtn = document.createElement("button");
          expandBtn.className = "snapai-expand-btn";
          expandBtn.innerHTML = `Open in Panel ${EXTERNAL_LINK_SVG}`;
          expandBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!chrome.runtime?.id) {
              responseContainer.innerHTML = `<div class="snapai-error">Extension was updated or reloaded. Please refresh this page.</div>`;
              return;
            }
            try {
              chrome.runtime.sendMessage({
                type: MSG_TYPES.OPEN_SIDE_PANEL,
                data: { selectedText, responseText, actionId, customQuestion }
              });
            } catch {
              responseContainer.innerHTML = `<div class="snapai-error">Extension was updated or reloaded. Please refresh this page.</div>`;
            }
          });
          actions.appendChild(expandBtn);
          responseContainer.appendChild(actions);
        }

        responseContainer.scrollTop = responseContainer.scrollHeight;
      }

      if (msg.type === MSG_TYPES.STREAM_DONE) {
        // Streaming complete
      }

      if (msg.type === MSG_TYPES.STREAM_ERROR) {
        responseContainer.innerHTML = `<div class="snapai-error">${msg.error}</div>`;
      }
    });

    currentPort.postMessage({
      type: MSG_TYPES.QUERY_AI,
      action: actionId,
      selectedText,
      customQuestion
    });
  }

  // Listen for mouseup to detect text selection
  document.addEventListener("mouseup", (e) => {
    // Throttle
    const now = Date.now();
    if (now - lastMouseUpTime < 200) return;
    lastMouseUpTime = now;

    // Don't trigger on our own toolbar
    if (hostEl && hostEl.contains(e.target)) return;

    // Don't trigger on inputs/textareas
    const tag = e.target.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (!text || text.length === 0) {
        // Don't remove toolbar if clicking inside it
        if (hostEl) {
          const path = e.composedPath();
          if (!path.includes(hostEl)) {
            removeToolbar();
          }
        }
        return;
      }

      selectedText = text;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      createToolbar(rect.left, rect.bottom);
    }, 10);
  });

  // Dismiss on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") removeToolbar();
  });
})();
