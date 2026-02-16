---
name: sy-slate-architecture-guardrails
description: Enforce SY-Math-Slate v10 architecture guardrails and safety rules. Use when adding/refactoring v10 code, moving files, changing layout/persistence flows, or reviewing for spaghetti risk, layer violations, unsafe HTML, or new dependencies.
---

# Sy Slate Architecture Guardrails

## Overview
Use this skill to keep the v10 codebase aligned with repo guardrails (layer rules, safety, JSON-safe persistence, and doc freshness). Defaults to FAST mode to keep work moving; use FULL mode for major refactors or core-flow changes.

## Workflow (FAST mode — default)
1) Read order: AGENTS.md -> GEMINI_CODEX_PROTOCOL.md -> PROJECT_BLUEPRINT.md + PROJECT_CONTEXT.md -> task spec -> v10/AI_READ_ME.md -> v10/AI_READ_ME_MAP.md (if structure changed).
2) Confirm scope (v10 vs root) and whether the change is structural or semantic.
3) Run scripts:
   - scripts/check_layer_rules.sh (fails on boundary violations)
4) Quick checks:
   - No new window globals (MathJax loader is the only exception).
   - innerHTML/dangerouslySetInnerHTML only after DOMPurify sanitize upstream.
   - Persisted data is JSON-safe.
   - No new dependencies without explicit user approval.
5) If structure changed, run `node scripts/gen_ai_read_me_map.mjs` in the repo.
6) If rules/flows changed, update `v10/AI_READ_ME.md`.

## Workflow (FULL mode — when needed)
Use FULL mode for major refactors, store rewrites, or changes to core flows (layout, playback, persistence).
1) Run FAST mode steps.
2) Run scripts:
   - scripts/scan_guardrails.sh (lists risky patterns)
3) If hub thresholds are crossed, propose slice/categorization plan (see references/guardrails.md).

## Guardrails Checklist
- Layer boundaries: core only imports core; ui only imports ui/core; features only import core/ui; app imports features/ui.
- No new global window assignments (existing MathJax loader is the only exception).
- innerHTML/dangerouslySetInnerHTML only after DOMPurify sanitize upstream.
- Persisted data must be JSON-safe; no DOM/Function in persisted payloads.
- No new dependencies without explicit user approval.
- No src/lib resurrection; no Prisma client in v10/src.
- Hub thresholds (FULL mode): if a file exceeds ~900 lines, 25+ actions, fan-in >= 20, or mixed domains, recommend slicing.

## Resources
- scripts/check_layer_rules.sh
- scripts/scan_guardrails.sh
- references/guardrails.md
