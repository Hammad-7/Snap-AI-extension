const PROVIDERS = {
  openai: {
    name: "OpenAI",
    brandColor: "#10A37F",
    iconPath: "icons/brands/icons8-chatgpt-50.png",
    keyUrl: "https://platform.openai.com/api-keys",
    endpoint: "https://api.openai.com/v1/chat/completions",
    models: [
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano (cheapest)", default: true },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
      { id: "gpt-4.1", name: "GPT-4.1" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "o3-mini", name: "o3-mini" },
      { id: "o4-mini", name: "o4-mini" }
    ],
    buildHeaders(key) {
      return { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" };
    },
    buildBody(model, messages) {
      return { model, messages, stream: true };
    },
    getEndpoint() {
      return this.endpoint;
    },
    parseSSEChunk(data) {
      if (data === "[DONE]") return { done: true };
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        return content ? { text: content } : {};
      } catch { return {}; }
    }
  },

  anthropic: {
    name: "Anthropic",
    brandColor: "#D97706",
    iconPath: "icons/brands/icons8-anthropic-48.png",
    keyUrl: "https://console.anthropic.com/settings/keys",
    endpoint: "https://api.anthropic.com/v1/messages",
    models: [
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 (cheapest)", default: true },
      { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
      { id: "claude-opus-4-6", name: "Claude Opus 4.6" }
    ],
    buildHeaders(key) {
      return {
        "x-api-key": key,
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      };
    },
    buildBody(model, messages) {
      const systemMsg = messages.find(m => m.role === "system");
      const nonSystem = messages.filter(m => m.role !== "system");
      return {
        model,
        messages: nonSystem,
        system: systemMsg?.content || "",
        max_tokens: 4096,
        stream: true
      };
    },
    getEndpoint() {
      return this.endpoint;
    },
    parseSSEChunk(data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta") {
          return { text: parsed.delta?.text || "" };
        }
        if (parsed.type === "message_stop") {
          return { done: true };
        }
        return {};
      } catch { return {}; }
    }
  },

  gemini: {
    name: "Google Gemini",
    brandColor: "#4285F4",
    iconPath: "icons/brands/icons8-gemini-94.png",
    keyUrl: "https://aistudio.google.com/apikey",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={key}",
    models: [
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite (cheapest)", default: true },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)" },
      { id: "gemini-3-pro-preview", name: "Gemini 3 Pro (Preview)" }
    ],
    buildHeaders() {
      return { "Content-Type": "application/json" };
    },
    buildBody(model, messages) {
      const systemMsg = messages.find(m => m.role === "system");
      const contents = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
      const body = { contents };
      if (systemMsg) {
        body.systemInstruction = { parts: [{ text: systemMsg.content }] };
      }
      return body;
    },
    getEndpoint(model, key) {
      return this.endpoint.replace("{model}", model).replace("{key}", key);
    },
    parseSSEChunk(data) {
      try {
        const parsed = JSON.parse(data);
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
        return text ? { text } : {};
      } catch { return {}; }
    }
  },

  deepseek: {
    name: "DeepSeek",
    brandColor: "#536DFE",
    iconPath: "icons/brands/icons8-deepseek-94.png",
    keyUrl: "https://platform.deepseek.com/api_keys",
    endpoint: "https://api.deepseek.com/chat/completions",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat (cheapest)", default: true },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner" }
    ],
    buildHeaders(key) {
      return { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" };
    },
    buildBody(model, messages) {
      return { model, messages, stream: true };
    },
    getEndpoint() {
      return this.endpoint;
    },
    parseSSEChunk(data) {
      if (data === "[DONE]") return { done: true };
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        return content ? { text: content } : {};
      } catch { return {}; }
    }
  }
};
