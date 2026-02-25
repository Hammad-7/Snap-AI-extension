# Contributing to SnapAI

Thanks for your interest in contributing! Here's how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Snap-AI-extension.git
   ```
3. Load the extension in Chrome:
   - Go to `chrome://extensions`
   - Enable Developer mode
   - Click "Load unpacked" and select the project folder

## Making Changes

1. Create a branch for your change:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test the extension locally by reloading it in `chrome://extensions`
4. Commit your changes with a clear message:
   ```bash
   git commit -m "Add: description of your change"
   ```
5. Push and open a pull request

## Guidelines

- Keep changes focused — one feature or fix per PR
- Test on at least one AI provider before submitting
- Follow the existing code style (no build step, vanilla JS)
- Don't add external dependencies — the extension uses no frameworks or bundlers
- Update the README if your change affects usage or setup

## Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser version and OS

## Adding a New AI Provider

To add a new provider, add an entry to `shared/providers.js` following the existing pattern. Each provider needs:
- `name`, `brandColor`, `iconPath`, `keyUrl`
- `endpoint` — the API URL
- `models[]` — array of available models
- `buildHeaders(key)` — returns auth headers
- `buildBody(model, messages)` — returns the request body
- `parseSSEChunk(data)` — parses streaming response chunks

Then add the corresponding host permission to `manifest.json`.
