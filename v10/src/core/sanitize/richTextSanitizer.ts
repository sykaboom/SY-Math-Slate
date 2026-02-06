import { ALLOWED_RICH_TEXT_CLASSES } from "@core/config/typography";

const ALLOWED_TAGS = new Set([
  "span",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "sub",
  "sup",
  "div",
  "p",
]);

const ALLOWED_CLASS_SET = new Set(ALLOWED_RICH_TEXT_CLASSES);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeClassName = (value: string) => {
  const tokens = value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && ALLOWED_CLASS_SET.has(token));
  return tokens.join(" ");
};

const unwrapNode = (node: HTMLElement) => {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) {
    parent.insertBefore(node.firstChild, node);
  }
  parent.removeChild(node);
};

export const sanitizeRichTextHtml = (
  value: unknown,
  options?: { ensureNotEmpty?: boolean }
): string => {
  const ensureNotEmpty = options?.ensureNotEmpty ?? false;
  if (typeof value !== "string") {
    return ensureNotEmpty ? "&nbsp;" : "";
  }
  if (value.trim().length === 0) {
    return ensureNotEmpty ? "&nbsp;" : "";
  }
  if (typeof document === "undefined") {
    const escaped = escapeHtml(value);
    if (ensureNotEmpty) {
      return escaped.trim().length > 0 ? escaped : "&nbsp;";
    }
    return escaped;
  }

  const template = document.createElement("template");
  template.innerHTML = value;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object") {
      el.remove();
      return;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      unwrapNode(el);
      return;
    }

    Array.from(el.attributes).forEach((attr) => {
      if (attr.name !== "class") {
        el.removeAttribute(attr.name);
      }
    });
    if (el.className) {
      const safeClass = sanitizeClassName(el.className);
      if (safeClass.length > 0) {
        el.className = safeClass;
      } else {
        el.removeAttribute("class");
      }
    }

    Array.from(el.childNodes).forEach((child) => walk(child));
  };

  Array.from(template.content.childNodes).forEach((node) => walk(node));
  const sanitized = template.innerHTML.trim();
  if (sanitized.length > 0) return sanitized;
  return ensureNotEmpty ? "&nbsp;" : "";
};
