# Task 010: MathJax Integration & Modular Rendering (Slate Standard)

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 009 (Text Layer)
**Reference:** `PROJECT_CONTEXT.md`

## Context
As defined in `PROJECT_CONTEXT.md`, **Slate establishes the math standard**. We need a MathJax v3 integration that:
- matches the legacy math-pdf-builder behavior where it matters (delimiters + display rules),
- is modular (rules + renderer + loader split),
- can be reused when the pdf-builder refactor is ready.

## Goals
1. **Math Engine:** Load MathJax v3 (`tex-svg`) with a manual, reusable loader.
2. **Modular Rules:** Create `src/lib/math/rules.ts` for auto-correction rules.
3. **Renderer Pipeline:** Build a small renderer that parses `$...$` / `$$...$$` and uses `tex2svgPromise`.
4. **Content Integration:** Render math inside `ContentLayer` without breaking DOMPurify.
5. **Performance:** Cache rendered formulas + avoid re-typesetting on stroke updates.

## Requirements

### 1. Dependencies
* **Do not add** `better-react-mathjax` for this task.
* Load MathJax v3 via CDN (`tex-svg`) using a custom loader.

### 2. Math Rules (`src/lib/math/rules.ts`)
* **Functions:**
  * `applyMathDisplayRules(tex: string): string`
  * `normalizeMathInText(text: string): string`
  * `normalizeMathTex(tex: string): string`
* **Rules (Auto-correction):**
  * Prepend `\displaystyle` when missing.
  * Replace `\frac` → `\dfrac` **outside** script/subscript scopes.
* **Source of truth:** align with legacy logic in `math-pdf-builder` (`math-tokenize.js`).

### 3. Math Loader (`src/lib/math/loader.ts`)
* **Purpose:** one-time MathJax bootstrapping (client-only).
* **Config (match legacy where possible):**
  * `tex.inlineMath = [['$', '$']]`
  * `tex.displayMath = [['$$', '$$']]`
  * `tex.processEscapes = true`
  * `tex.packages = ['base', 'ams', 'noerrors', 'noundefined', 'html', 'bbox']`
  * `loader.load = ['[tex]/html', '[tex]/bbox']`
  * `svg.displayAlign = 'left'`, `svg.fontCache = 'none'`
  * `startup.typeset = false`
* Expose a `loadMathJax(): Promise<void>` that resolves when `window.isMathJaxReady === true`.

### 4. Math Renderer (`src/lib/math/render.ts`)
* **Function:** `buildMathFragmentFromText(text, options)`
  * Parse with regex: `/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g`
  * For each token: apply rules → `MathJax.tex2svgPromise` → cache result.
  * Return `DocumentFragment` containing text + math nodes.
* **Memoization:** cache by `(finalTex + displayFlag)`.

### 5. Content Integration (`ContentLayer.tsx`)
* **Approach:** Keep DOMPurify sanitization, then typeset **after** DOM is mounted.
* Create a small component (e.g., `MathTextBlock`) that:
  1. Renders sanitized HTML via `dangerouslySetInnerHTML`.
  2. On `useEffect`, calls `typesetElement(el)` which replaces `$...$` / `$$...$$` with MathJax SVG nodes.
* **Important:** Only re-typeset when `item.content` changes (avoid reprocessing during stroke updates).

## Deliverables
* `src/lib/math/loader.ts`
* `src/lib/math/rules.ts`
* `src/lib/math/render.ts`
* `src/components/canvas/MathTextBlock.tsx` (or equivalent)
* Updated `src/components/canvas/ContentLayer.tsx`
* Optional: small CSS additions for `.math-atom` or `mjx-container` to align baseline.

## Acceptance Criteria
1. **Auto-correction:** `\frac` renders as display fraction (via rules module).
2. **Delimiters:** `$...$` and `$$...$$` only; no `\(...\)` for now.
3. **Mixed Content:** Text + multiple formulas render correctly inside `ContentLayer`.
4. **Performance:** No re-typeset on pen strokes; only when text content changes.
5. **Compatibility:** MathJax config matches legacy `math-pdf-builder` settings where possible.
