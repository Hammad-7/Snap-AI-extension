const ACTIONS = [
  {
    id: "explain",
    label: "Explain",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 1 4 12.9V17H8v-2.1A7 7 0 0 1 12 2z"/></svg>`,
    prompt: "Explain the following text clearly and concisely:"
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h12"/><path d="M4 18h8"/></svg>`,
    prompt: "Summarize the following text in a few sentences:"
  },
  {
    id: "fix_grammar",
    label: "Fix Grammar",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    prompt: "Fix any grammar or spelling issues in the following text:"
  },
  {
    id: "key_points",
    label: "Key Points",
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="4" cy="18" r="1.5"/><path d="M9 6h11"/><path d="M9 12h11"/><path d="M9 18h11"/></svg>`,
    prompt: "Extract the key points from the following text as a bullet list:"
  }
];

const MSG_TYPES = {
  QUERY_AI: "QUERY_AI",
  STREAM_CHUNK: "STREAM_CHUNK",
  STREAM_DONE: "STREAM_DONE",
  STREAM_ERROR: "STREAM_ERROR",
  OPEN_SIDE_PANEL: "OPEN_SIDE_PANEL",
  GET_CONTEXT: "GET_CONTEXT",
  CONTEXT_DATA: "CONTEXT_DATA"
};
