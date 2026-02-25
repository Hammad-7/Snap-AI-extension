(() => {
  const providersList = document.getElementById("providers-list");
  const activeProviderSelect = document.getElementById("active-provider");
  const saveBtn = document.getElementById("save-btn");
  const statusMsg = document.getElementById("status-msg");

  const providerInputs = {};

  function renderProviders() {
    for (const [id, provider] of Object.entries(PROVIDERS)) {
      const card = document.createElement("div");
      card.className = "provider-card";
      card.dataset.id = id;

      const defaultModel = provider.models.find(m => m.default) || provider.models[0];

      card.innerHTML = `
        <div class="provider-header">
          <div class="provider-name-row">
            <img src="../${provider.iconPath}" alt="${provider.name}" class="provider-icon" width="22" height="22">
            <span class="provider-name">${provider.name}</span>
          </div>
          <span class="provider-status not-configured" data-status="${id}">Not configured</span>
        </div>
        <div class="provider-fields">
          <div>
            <label class="field-label">API Key <a href="${provider.keyUrl}" target="_blank" class="get-key-link">Get key &rarr;</a></label>
            <div class="key-row">
              <input type="password" class="key-input" data-key="${id}" placeholder="Enter your ${provider.name} API key">
              <button class="toggle-vis-btn" data-toggle="${id}">Show</button>
            </div>
          </div>
          <div>
            <label class="field-label">Model</label>
            <select class="select-input" data-model="${id}">
              ${provider.models.map(m => `<option value="${m.id}" ${m.id === defaultModel.id ? "selected" : ""}>${m.name}</option>`).join("")}
            </select>
          </div>
        </div>
      `;

      providersList.appendChild(card);

      // Add to active provider dropdown
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = provider.name;
      activeProviderSelect.appendChild(opt);

      // Store references
      providerInputs[id] = {
        keyInput: card.querySelector(`[data-key="${id}"]`),
        modelSelect: card.querySelector(`[data-model="${id}"]`),
        statusEl: card.querySelector(`[data-status="${id}"]`),
        toggleBtn: card.querySelector(`[data-toggle="${id}"]`)
      };

      // Toggle visibility
      providerInputs[id].toggleBtn.addEventListener("click", () => {
        const input = providerInputs[id].keyInput;
        if (input.type === "password") {
          input.type = "text";
          providerInputs[id].toggleBtn.textContent = "Hide";
        } else {
          input.type = "password";
          providerInputs[id].toggleBtn.textContent = "Show";
        }
      });
    }
  }

  async function loadExistingConfigs() {
    const configs = await Storage.getAllConfigs();
    const activeProvider = await Storage.getActiveProvider();

    for (const [id, config] of Object.entries(configs)) {
      if (config.apiKey) {
        providerInputs[id].keyInput.value = config.apiKey;
        providerInputs[id].statusEl.textContent = "Configured";
        providerInputs[id].statusEl.className = "provider-status configured";
      }
      if (config.selectedModel) {
        providerInputs[id].modelSelect.value = config.selectedModel;
      }
    }

    if (activeProvider) {
      activeProviderSelect.value = activeProvider;
    }
  }

  async function save() {
    let hasKey = false;

    for (const [id, refs] of Object.entries(providerInputs)) {
      const apiKey = refs.keyInput.value.trim();
      const selectedModel = refs.modelSelect.value;

      await Storage.setProviderConfig(id, { apiKey, selectedModel });

      if (apiKey) {
        hasKey = true;
        refs.statusEl.textContent = "Configured";
        refs.statusEl.className = "provider-status configured";
      } else {
        refs.statusEl.textContent = "Not configured";
        refs.statusEl.className = "provider-status not-configured";
      }
    }

    if (!hasKey) {
      statusMsg.textContent = "Please enter at least one API key.";
      statusMsg.className = "status-msg error";
      return;
    }

    const activeId = activeProviderSelect.value;
    if (!activeId) {
      // Auto-select first configured provider
      for (const [id, refs] of Object.entries(providerInputs)) {
        if (refs.keyInput.value.trim()) {
          activeProviderSelect.value = id;
          break;
        }
      }
    }

    const finalActive = activeProviderSelect.value;
    if (finalActive) {
      const activeConfig = await Storage.getProviderConfig(finalActive);
      if (!activeConfig.apiKey) {
        statusMsg.textContent = "The selected default provider has no API key.";
        statusMsg.className = "status-msg error";
        return;
      }
      await Storage.setActiveProvider(finalActive);
    }

    statusMsg.textContent = "Settings saved! You can close this tab and start using SnapAI.";
    statusMsg.className = "status-msg success";
  }

  saveBtn.addEventListener("click", save);

  renderProviders();
  loadExistingConfigs();
})();
