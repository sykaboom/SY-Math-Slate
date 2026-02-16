# Guardrails Reference (SY-Math-Slate v10)

## Purpose
Keep v10 changes aligned with repo architecture, safety rules, and long-term maintainability.

## Layer Rules (Hard Boundaries)
- core: imports only core
- ui: imports only ui + core
- features: imports only core + ui
- app: may import features + ui

**Quick checks**
- core must not import @features or @ui
- ui must not import @features
- v10/src must not import @prisma/client
- v10/src/lib must not be reintroduced

## HTML Sanitization Policy
- Any HTML flowing into rendering layers must be sanitized before use.
- Expected flow: user input -> DOMPurify.sanitize -> storage -> render
- When adding new entrypoints (contentEditable, HTML strings, clipboard import), verify sanitize is applied before the data reaches:
  - MathTextBlock
  - AnimatedTextBlock
  - any use of innerHTML / dangerouslySetInnerHTML

## Window Globals Policy
- Do not add new window global assignments.
- Existing exception: v10/src/core/math/loader.ts (MathJax bootstrap) uses window.*.

## Persistence Policy
- PersistedSlateDoc must be JSON-safe.
- Never persist DOM nodes, functions, or browser-only objects.
- Session fields must remain runtime-only.

## Hub Thresholds (Spaghetti Prevention)
Treat a file as a “hub” that needs slicing when **2 or more** are true:
- Lines >= ~900
- Actions/functions >= 25
- Fan-in (imports into it) >= 20
- Mixed domains in one file (e.g., playback + persistence + layout)
- Most changes in a feature require touching this file

**What to do when triggered**
- Slice by domain (e.g., playbackSlice, layoutSlice, mediaSlice, persistenceSlice)
- Keep public API stable; move internals behind narrow exports
- Update AI_READ_ME if core flow changes

## When to Update Docs
- Structure change (files/folders moved/added/removed) -> regenerate v10/AI_READ_ME_MAP.md
- Semantic/flow change (rules, invariants, core flows) -> update v10/AI_READ_ME.md

## Scripts
- scripts/check_layer_rules.sh: fails on layer or prisma violations
- scripts/scan_guardrails.sh: lists risky patterns for manual review
