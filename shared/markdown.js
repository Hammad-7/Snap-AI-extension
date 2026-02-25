/**
 * Lightweight markdown-to-HTML parser.
 * Escapes HTML first to prevent XSS, then applies formatting.
 */
const Markdown = (() => {
  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parse(text) {
    if (!text) return "";

    // Escape HTML entities first
    let html = escapeHtml(text);

    // Code blocks (``` ... ```) — must be processed before inline rules
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code>${code.replace(/\n$/, "")}</code></pre>`;
    });

    // Split into lines for block-level processing
    const lines = html.split("\n");
    const output = [];
    let inList = false;
    let listType = null; // "ul" or "ol"

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip lines inside <pre> blocks (already handled)
      if (line.includes("<pre>") || line.includes("</pre>")) {
        if (inList) {
          output.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        output.push(line);
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        if (inList) {
          output.push(`</${listType}>`);
          inList = false;
          listType = null;
        }
        const level = headingMatch[1].length;
        output.push(`<h${level + 2}>${inlineFormat(headingMatch[2])}</h${level + 2}>`);
        continue;
      }

      // Unordered list items (- or *)
      const ulMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
      if (ulMatch) {
        if (!inList || listType !== "ul") {
          if (inList) output.push(`</${listType}>`);
          output.push("<ul>");
          inList = true;
          listType = "ul";
        }
        output.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
        continue;
      }

      // Ordered list items (1. 2. etc)
      const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
      if (olMatch) {
        if (!inList || listType !== "ol") {
          if (inList) output.push(`</${listType}>`);
          output.push("<ol>");
          inList = true;
          listType = "ol";
        }
        output.push(`<li>${inlineFormat(olMatch[1])}</li>`);
        continue;
      }

      // Close open list if we hit a non-list line
      if (inList) {
        output.push(`</${listType}>`);
        inList = false;
        listType = null;
      }

      // Empty line = paragraph break
      if (line.trim() === "") {
        output.push("<br>");
        continue;
      }

      // Regular paragraph
      output.push(`<p>${inlineFormat(line)}</p>`);
    }

    // Close any remaining open list
    if (inList) {
      output.push(`</${listType}>`);
    }

    return output.join("\n");
  }

  function inlineFormat(text) {
    // Inline code (must come before bold/italic to avoid conflicts)
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Italic (single * not preceded/followed by space to avoid list conflicts)
    text = text.replace(/(?<!\*)\*([^*\s](?:[^*]*[^*\s])?)\*(?!\*)/g, "<em>$1</em>");
    return text;
  }

  return { parse };
})();
