(() => {
  const providerIconsEl = document.getElementById("provider-icons");
  const modelSelect = document.getElementById("model-select");
  const settingsBtn = document.getElementById("settings-btn");

  let allConfigs = {};
  let activeProviderId = "";

  async function init() {
    activeProviderId = await Storage.getActiveProvider();
    allConfigs = await Storage.getAllConfigs();

    renderProviderIcons();
    populateModels(activeProviderId);
  }

  function renderProviderIcons() {
    providerIconsEl.innerHTML = "";

    for (const [id, provider] of Object.entries(PROVIDERS)) {
      if (!allConfigs[id]?.apiKey) continue;

      const btn = document.createElement("button");
      btn.className = "provider-icon-btn";
      btn.style.setProperty("--brand-color", provider.brandColor);
      btn.title = provider.name;
      const img = document.createElement("img");
      img.src = `../${provider.iconPath}`;
      img.alt = provider.name;
      img.width = 16;
      img.height = 16;
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

    // If no providers configured, show hint
    if (!providerIconsEl.children.length) {
      providerIconsEl.innerHTML = '<span style="font-size:11px;color:#94A3B8;">No providers</span>';
      modelSelect.innerHTML = "";
    }
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

  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  init();
})();
