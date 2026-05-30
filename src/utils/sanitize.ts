import sanitizeHtml from "sanitize-html";

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

export const sanitizeRichText = (input: string): string =>
  sanitizeHtml(input, sanitizeOptions);

export const sanitizePlainText = (input: string): string =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
