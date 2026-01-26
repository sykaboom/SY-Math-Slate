"use client";

const SCRIPT_ID = "mathjax-script";
const MATHJAX_SRC = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";

export type MathJaxApi = {
  tex2svgPromise?: (tex: string, options?: { display?: boolean }) => Promise<HTMLElement>;
  startup?: { defaultPageReady?: () => Promise<void>; promise?: Promise<void> };
};

declare global {
  interface Window {
    MathJax?: MathJaxApi & { __slateConfigured?: boolean };
    isMathJaxReady?: boolean;
  }
}

let loaderPromise: Promise<void> | null = null;

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const buildConfig = (resolve: () => void) => ({
  loader: {
    load: ["[tex]/html", "[tex]/bbox"],
  },
  tex: {
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
    processEscapes: true,
    packages: ["base", "ams", "noerrors", "noundefined", "html", "bbox"],
  },
  svg: {
    fontCache: "none",
    scale: 1.0,
    displayAlign: "left",
    internalSpeechTitles: false,
  },
  options: {
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "tex2jax_process",
    renderActions: {
      assistiveMml: [],
    },
  },
  startup: {
    typeset: false,
    pageReady: () => {
      return (window.MathJax?.startup?.defaultPageReady?.() || Promise.resolve()).then(
        () => {
          window.isMathJaxReady = true;
          resolve();
        }
      );
    },
  },
});

const ensureScript = (onError: () => void) => {
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (script) return script;
  script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = MATHJAX_SRC;
  script.addEventListener("error", onError);
  document.head.appendChild(script);
  return script;
};

export const loadMathJax = () => {
  if (!isBrowser()) return Promise.resolve();
  if (window.isMathJaxReady) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (window.MathJax?.startup?.promise) {
      window.MathJax.startup.promise
        .then(() => {
          window.isMathJaxReady = true;
          resolve();
        })
        .catch(reject);
      return;
    }

    if (!window.MathJax || !window.MathJax.__slateConfigured) {
      window.MathJax = Object.assign(buildConfig(resolve), { __slateConfigured: true });
    }

    ensureScript(() => {
      loaderPromise = null;
      reject(new Error("MathJax failed to load"));
    });
  });

  return loaderPromise;
};

export const getMathJax = () => {
  if (!isBrowser()) return null;
  return window.MathJax ?? null;
};
