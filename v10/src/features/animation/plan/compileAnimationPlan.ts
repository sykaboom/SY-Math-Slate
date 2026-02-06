import type { CompiledAnimationPlan, AnimationRun } from "@features/animation/runtime/types";

const getHighlightColor = (node: Node) => {
  let current = node.parentElement;
  while (current) {
    if (current.classList.contains("hl-yellow")) {
      return "yellow";
    }
    if (current.classList.contains("hl-cyan")) {
      return "cyan";
    }
    current = current.parentElement;
  }
  return null;
};

const hasVisibleText = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!(node instanceof Text)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest("mjx-container")) {
        return NodeFilter.FILTER_REJECT;
      }
      if (node.nodeValue.replace(/\s+/g, "") === "") {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  return Boolean(walker.nextNode());
};

type TextRunDraft = {
  type: "text";
  nodes: Text[];
};

type MathRunDraft = {
  type: "math";
  node: HTMLElement;
};

const buildCharSpansForNodes = (textNodes: Text[]) => {
  const spans: HTMLElement[] = [];
  textNodes.forEach((textNode) => {
    const text = textNode.textContent ?? "";
    const highlightColor = getHighlightColor(textNode);
    const fragment = document.createDocumentFragment();
    for (const char of text) {
      const span = document.createElement("span");
      span.textContent = char;
      if (highlightColor) {
        span.dataset.highlight = "1";
        span.dataset.highlightColor = highlightColor;
      }
      span.className = "tw-char";
      fragment.appendChild(span);
      spans.push(span);
    }
    textNode.parentNode?.replaceChild(fragment, textNode);
  });
  return spans;
};

const buildRuns = (root: HTMLElement): AnimationRun[] => {
  const drafts: Array<TextRunDraft | MathRunDraft> = [];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const textNode = node as Text;
          if (!textNode.nodeValue || textNode.nodeValue.replace(/\s+/g, "") === "") {
            return NodeFilter.FILTER_REJECT;
          }
          if (textNode.parentElement?.closest("mjx-container")) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          if (el.tagName.toLowerCase() === "mjx-container") {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_REJECT;
      },
    }
  );

  let textNodes: Text[] = [];

  const flushText = () => {
    if (textNodes.length === 0) return;
    drafts.push({ type: "text", nodes: textNodes });
    textNodes = [];
  };

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
      continue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName.toLowerCase() === "mjx-container") {
        flushText();
        drafts.push({ type: "math", node: el });
      }
    }
  }
  flushText();

  return drafts.map((draft) => {
    if (draft.type === "math") return draft;
    const spans = buildCharSpansForNodes(draft.nodes);
    const highlightSpans = spans.filter((span) => span.dataset.highlight === "1");
    return { type: "text", spans, highlightSpans };
  });
};

export const compileAnimationPlan = (
  root: HTMLElement,
  _sourceHtml: string
): CompiledAnimationPlan => {
  const hasMath = root.querySelectorAll("mjx-container").length > 0;
  const runs = buildRuns(root);
  const hasText = hasVisibleText(root);

  if (hasMath && hasText) return { mode: "mixed", runs };
  if (hasMath) return { mode: "math", runs };
  return { mode: "text", runs };
};
