"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { loadMathJax } from "@core/math/loader";
import { typesetElement } from "@core/math/render";

const hasMathToken = (value: string) => value.includes("$");

type MathTextBlockProps = {
  html: string;
  className?: string;
  style?: CSSProperties;
};

export function MathTextBlock({ html, className, style }: MathTextBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const renderId = useRef(0);
  const lastHtmlRef = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (lastHtmlRef.current !== html) {
      el.innerHTML = html;
      lastHtmlRef.current = html;
    }
    if (!hasMathToken(html)) return;
    renderId.current += 1;
    const current = renderId.current;

    const run = async () => {
      await loadMathJax();
      if (current !== renderId.current) return;
      const el = ref.current;
      if (!el) return;
      await typesetElement(el);
    };

    run();
  }, [html]);

  return <div ref={ref} className={className} style={style} />;
}
