(() => {
  const providersList = document.getElementById("providers-list");
  const activeProviderSelect = document.getElementById("active-provider");
  const readyBanner = document.getElementById("ready-banner");

  const providerInputs = {};

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

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

      // Auto-save on typing (debounced) and Enter key
      const debouncedSave = debounce(() => saveProvider(id), 300);
      providerInputs[id].keyInput.addEventListener("input", debouncedSave);
      providerInputs[id].keyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveProvider(id);
        }
      });

      // Auto-save on model change
      providerInputs[id].modelSelect.addEventListener("change", () => saveProvider(id));
    }
  }

  async function saveProvider(id) {
    const refs = providerInputs[id];
    const apiKey = refs.keyInput.value.trim();
    const selectedModel = refs.modelSelect.value;

    await Storage.setProviderConfig(id, { apiKey, selectedModel });

    if (apiKey) {
      refs.statusEl.textContent = "Saved";
      refs.statusEl.className = "provider-status saved";

      setTimeout(() => {
        refs.statusEl.textContent = "Configured";
        refs.statusEl.className = "provider-status configured";
      }, 1200);

      // Auto-select default provider if none selected
      if (!activeProviderSelect.value) {
        activeProviderSelect.value = id;
        await Storage.setActiveProvider(id);
      }
    } else {
      refs.statusEl.textContent = "Not configured";
      refs.statusEl.className = "provider-status not-configured";
    }

    updateReadyBanner();
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

    updateReadyBanner();
  }

  function updateReadyBanner() {
    const hasKey = Object.values(providerInputs).some(r => r.keyInput.value.trim());
    const hasDefault = !!activeProviderSelect.value;
    readyBanner.classList.toggle("visible", hasKey && hasDefault);
  }

  // Auto-save active provider on change
  activeProviderSelect.addEventListener("change", () => {
    const value = activeProviderSelect.value;
    if (value) {
      Storage.setActiveProvider(value);
    }
    updateReadyBanner();
  });

  renderProviders();
  loadExistingConfigs();
})();
