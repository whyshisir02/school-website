import sanitizeHtml from "sanitize-html";

export function noticeExcerpt(html: string, limit = 120): string {
  // Separate block boundaries before stripping tags; inline formatting stays joined.
  const spaced = html.replace(/<\/?(?:p|div|br|li|h[1-6]|blockquote|tr|td|th|hr)\b[^>]*>/gi, " ");
  const escaped = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} });
  const entities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"' };
  const text = escaped.replace(/&(?:amp|lt|gt|quot);/g, (entity) => entities[entity]).replace(/\s+/g, " ").trim();
  if (!text) return "Open this notice to view the full announcement.";
  return text.length > limit ? text.slice(0, limit).trimEnd() + "\u2026" : text;
}
