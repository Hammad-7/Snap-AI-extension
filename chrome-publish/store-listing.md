# SnapAI — Chrome Web Store Listing

## Name
SnapAI

## Summary (132 characters max)
Select text on any webpage and instantly get AI-powered explanations, summaries, grammar fixes, and key points.

## Detailed Description

SnapAI lets you select any text on the web and instantly analyze it with AI. A sleek floating toolbar appears right where you need it — no tab-switching, no copy-pasting.

**What you can do:**
• Explain — Get clear, concise explanations of complex text
• Summarize — Condense long passages into quick summaries
• Fix Grammar — Correct spelling and grammar issues instantly
• Key Points — Extract the main ideas as a bullet list

**How it works:**
1. Select any text on a webpage
2. Click an action from the floating toolbar
3. Get an AI-powered response in seconds — inline or in the side panel

**Bring your own AI provider:**
SnapAI works with your API key from any of these providers:
• OpenAI (GPT-4.1, GPT-4o, o3-mini, o4-mini)
• Anthropic (Claude Haiku 4.5, Claude Sonnet 4.5/4.6, Claude Opus 4.6)
• Google Gemini (Gemini 2.5 Flash/Pro, Gemini 3 Flash/Pro)
• DeepSeek (DeepSeek Chat, DeepSeek Reasoner)

**Privacy first:**
Your API keys are stored locally on your device and never leave your browser. Selected text is sent only to the AI provider you choose — SnapAI has no servers, no analytics, and no tracking.

**Features:**
• Floating toolbar appears on text selection
• Side panel for full conversations with follow-up questions
• Markdown rendering with syntax highlighting
• Works on any webpage
• Multiple AI providers and models to choose from
• Dark, modern interface
• Quick setup — paste your API key and go

## Category
Workflow & Planning

## Single Purpose Description
Analyzes user-selected text on webpages using AI APIs chosen by the user to provide explanations, summaries, grammar corrections, and key points.

---

## Permission Justifications

### `storage`
Used to save the user's API keys, selected AI provider, chosen model, and preferences locally on their device. No data is synced or transmitted externally.

### `sidePanel`
Opens the SnapAI side panel where users can view AI responses in a full conversation format with follow-up support, without leaving the current page.

### `activeTab`
Accesses the currently active tab to read user-selected text when the user triggers an AI action from the floating toolbar or context menu.

### `contextMenus`
Adds SnapAI actions (Explain, Summarize, Fix Grammar, Key Points) to the browser's right-click context menu so users can analyze selected text directly.

### Host Permission: `https://api.openai.com/*`
Sends the user's selected text to the OpenAI API for AI processing when the user has configured OpenAI as their provider.

### Host Permission: `https://api.anthropic.com/*`
Sends the user's selected text to the Anthropic API for AI processing when the user has configured Anthropic as their provider.

### Host Permission: `https://generativelanguage.googleapis.com/*`
Sends the user's selected text to the Google Gemini API for AI processing when the user has configured Gemini as their provider.

### Host Permission: `https://api.deepseek.com/*`
Sends the user's selected text to the DeepSeek API for AI processing when the user has configured DeepSeek as their provider.
