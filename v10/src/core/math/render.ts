import { applyMathDisplayRules } from "./rules";
import { getMathJax } from "./loader";

const MATH_REGEX = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
const mathCache = new Map<string, Element>();

const getMathCache = (cache?: Map<string, Element>) => cache ?? mathCache;

const isInsideMathNode = (node: Text) => {
  const parent = node.parentElement;
  if (!parent) return false;
  return Boolean(parent.closest("mjx-container") || parent.closest(".math-atom"));
};

export const buildMathFragmentFromText = async (
  text: string,
  options: { cache?: Map<string, Element> } = {}
) => {
  const fragment = document.createDocumentFragment();
  if (!text) return fragment;
  const cache = getMathCache(options.cache);
  const mathJax = getMathJax();
  const tex2svgPromise = mathJax?.tex2svgPromise;
  let lastIndex = 0;
  MATH_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = MATH_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const fullTex = match[0];
    const isDisplay = fullTex.startsWith("$$");
    const cleanTex = isDisplay ? fullTex.slice(2, -2) : fullTex.slice(1, -1);
    const finalTex = applyMathDisplayRules(cleanTex);
    const cacheKey = `${finalTex}${isDisplay ? "_D" : "_I"}`;
    let mjxNode: Element | null = null;

    if (cache.has(cacheKey)) {
      mjxNode = cache.get(cacheKey)?.cloneNode(true) as Element;
    } else if (typeof tex2svgPromise === "function") {
      try {
        const rendered = await tex2svgPromise(finalTex, { display: isDisplay });
        if (rendered) {
          rendered.setAttribute("data-tex", cleanTex);
          rendered.setAttribute("display", String(isDisplay));
          rendered.setAttribute("contenteditable", "false");
          rendered.classList.add("math-atom");
          cache.set(cacheKey, rendered.cloneNode(true) as Element);
          mjxNode = rendered;
        }
      } catch {
        mjxNode = null;
      }
    }

    if (mjxNode) fragment.appendChild(mjxNode);
    else fragment.appendChild(document.createTextNode(fullTex));
    lastIndex = MATH_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
};

export const typesetElement = async (
  element: HTMLElement,
  options: { cache?: Map<string, Element> } = {}
) => {
  if (!element) return;
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (!(node instanceof Text)) return NodeFilter.FILTER_REJECT;
        if (isInsideMathNode(node)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.includes("$")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.nodeValue || "";
    if (!text || !text.includes("$")) continue;
    const fragment = await buildMathFragmentFromText(text, options);
    const parent = node.parentNode;
    if (parent) parent.replaceChild(fragment, node);
  }
};
