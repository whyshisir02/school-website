import sanitizeHtml from "sanitize-html";

/**
 * Sanitize admin-authored notice HTML before storing.
 * Allows a safe formatting subset; strips <script>, event handlers (onclick…),
 * javascript: URLs, and iframes. Applied on save so stored content is always clean.
 */
export function sanitizeNoticeHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "hr",
      "a", "img",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "style"],
      span: ["style"],
      div: ["style"],
      td: ["style"], th: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Cloudinary/Unsplash images are https — no data: URIs needed
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      // Force safe link behavior on every <a>
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
