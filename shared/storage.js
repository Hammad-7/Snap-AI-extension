const Storage = {
  async getProviderConfig(providerId) {
    const result = await chrome.storage.local.get(`provider_${providerId}`);
    return result[`provider_${providerId}`] || { apiKey: "", selectedModel: "" };
  },

  async setProviderConfig(providerId, config) {
    await chrome.storage.local.set({ [`provider_${providerId}`]: config });
  },

  async getActiveProvider() {
    const result = await chrome.storage.local.get("activeProvider");
    return result.activeProvider || "";
  },

  async setActiveProvider(providerId) {
    await chrome.storage.local.set({ activeProvider: providerId });
  },

  async getAllConfigs() {
    const configs = {};
    for (const id of Object.keys(PROVIDERS)) {
      configs[id] = await this.getProviderConfig(id);
    }
    return configs;
  }
};
