importScripts(
  "../shared/constants.js",
  "../shared/providers.js",
  "../shared/storage.js"
);

// Store current context for side panel
let currentContext = null;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("onboarding/onboarding.html") });
  }
});

// Handle long-lived connections for streaming
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "ai-stream") {
    port.onMessage.addListener(async (msg) => {
      if (msg.type === MSG_TYPES.QUERY_AI) {
        await handleQuery(port, msg);
      }
    });
  }

  if (port.name === "side-panel") {
    port.onMessage.addListener(async (msg) => {
      if (msg.type === MSG_TYPES.GET_CONTEXT) {
        safeSend(port, { type: MSG_TYPES.CONTEXT_DATA, data: currentContext });
      }
      if (msg.type === MSG_TYPES.QUERY_AI) {
        await handleQuery(port, msg);
      }
    });
  }
});

// Handle one-off messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === MSG_TYPES.OPEN_SIDE_PANEL) {
    currentContext = msg.data;
    chrome.sidePanel.open({ tabId: sender.tab.id });
    sendResponse({ ok: true });
  }
  return true;
});

function safeSend(port, message) {
  try { port.postMessage(message); }
  catch { /* port disconnected */ }
}

async function handleQuery(port, msg) {
  const { action, selectedText, customQuestion, conversationHistory } = msg;

  try {
    const activeProviderId = await Storage.getActiveProvider();
    if (!activeProviderId) {
      safeSend(port, { type: MSG_TYPES.STREAM_ERROR, error: "No active provider configured. Please open settings." });
      return;
    }

    const provider = PROVIDERS[activeProviderId];
    if (!provider) {
      safeSend(port, { type: MSG_TYPES.STREAM_ERROR, error: "Invalid provider." });
      return;
    }

    const config = await Storage.getProviderConfig(activeProviderId);
    if (!config.apiKey) {
      safeSend(port, { type: MSG_TYPES.STREAM_ERROR, error: `No API key configured for ${provider.name}. Please open settings.` });
      return;
    }

    const model = config.selectedModel || provider.models.find(m => m.default)?.id || provider.models[0].id;

    // Build messages
    let messages;
    if (conversationHistory) {
      messages = conversationHistory;
    } else {
      const actionDef = ACTIONS.find(a => a.id === action);
      let userContent;
      if (customQuestion) {
        userContent = `Regarding the following text:\n\n"${selectedText}"\n\n${customQuestion}`;
      } else if (actionDef) {
        userContent = `${actionDef.prompt}\n\n"${selectedText}"`;
      } else {
        userContent = selectedText;
      }

      messages = [
        { role: "system", content: "You are a helpful AI assistant integrated into a browser extension. Provide clear, concise, and well-formatted responses. Use markdown formatting when helpful." },
        { role: "user", content: userContent }
      ];
    }

    const headers = provider.buildHeaders(config.apiKey);
    const body = provider.buildBody(model, messages, config.apiKey);
    const endpoint = provider.getEndpoint
      ? provider.getEndpoint(model, config.apiKey)
      : provider.endpoint;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.error?.type || errorText;
      } catch {
        errorMsg = errorText;
      }
      safeSend(port, { type: MSG_TYPES.STREAM_ERROR, error: `API Error (${response.status}): ${errorMsg}` });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        const result = provider.parseSSEChunk(data);

        if (result.done) {
          safeSend(port, { type: MSG_TYPES.STREAM_DONE });
          return;
        }
        if (result.text) {
          safeSend(port, { type: MSG_TYPES.STREAM_CHUNK, text: result.text });
        }
      }
    }

    safeSend(port, { type: MSG_TYPES.STREAM_DONE });

  } catch (err) {
    safeSend(port, { type: MSG_TYPES.STREAM_ERROR, error: err.message || "An unexpected error occurred." });
  }
}
