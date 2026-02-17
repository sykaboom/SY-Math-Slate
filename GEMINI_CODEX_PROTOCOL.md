# GEMINI_CODEX_PROTOCOL.md (v7 — Gemini SVG/Spatial Protocol)

## 0) Purpose
This document defines **Gemini's scope only** inside SY-Math-Slate.

- Codex owns specs, approvals, implementation, and closeout.
- Gemini is used only for spatial/layout reasoning via SVG artifacts.
- Gemini invocation is optional (default OFF); trigger policy is governed by `AGENTS.md` and playbook.
- Codex workflow/delegation/hotfix details are governed by:
  - `AGENTS.md`
  - `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
  - `codex_tasks/_TEMPLATE_task.md`

---

## 1) Authority Mirror (SSOT)
Canonical authority order is defined in `AGENTS.md`.
This file mirrors that order and must not conflict:

1) `PROJECT_BLUEPRINT.md`  
2) `PROJECT_CONTEXT.md`  
3) `codex_tasks/*` approved task spec  
4) `GEMINI_CODEX_PROTOCOL.md`  
5) `AGENTS.md`  
6) ad-hoc chat instructions

---

## 2) Role Detection (strict)
Role is determined only by CLI identity:

- Codex CLI => Codex (spec/review/implementer)
- Gemini CLI => Gemini (layout/spatial architect)

Terminal access or user preference must not change role identity.

---

## 3) Gemini Scope (allowed / forbidden)

### Gemini may
- Produce SVG layout drafts under `design_drafts/`.
- Encode spatial structure: ratios, grids, hierarchy, reachability.
- Provide numeric layout constraints for Codex task specs.

### Gemini must NOT
- Author or approve task specs.
- Decide scope/acceptance/rollout.
- Edit production code.
- Replace Codex validation/approval authority.

---

## 4) SVG Handoff Contract (Gemini -> Codex, when invoked)
Gemini is invoked only when Codex/user decides it is needed under governance triggers.

If invoked, mandatory flow:
1) Gemini provides one SVG draft under `design_drafts/`.
2) Codex records numeric redlines in task spec.
3) Structure freezes, then Codex implements.

No iterative SVG regeneration loop by default.

### SVG requirements
- Explicit `viewBox` (width/height)
- Baseline: `1440x1080 (4:3)`
- Stable component IDs
- Grouping/alignment/z-order intent encoded

### Constraints
- SVG is design artifact only.
- SVG must never be embedded in production runtime code.

---

## 5) Ink-First Tablet Constraints (layout tasks)
Required viewports:
- `768x1024`
- `820x1180`
- `1024x768`
- `1180x820`

Rules:
- Writing continuity > visual polish
- No overlay may unexpectedly block pointer paths
- Close/recover actions must remain immediately reachable
- Unresolved coordinate conflicts block implementation

---

## 6) Evidence / Anti-Hallucination
- Never claim repository facts without evidence.
- Evidence format:
  - `<file path>` + short snippet/line reference.
- If evidence is missing:
  - Say `Unknown`
  - Ask for exact path/input

---

## 7) Binding Summary
- Gemini = SVG/layout specialist only.
- Codex = execution authority.
- Governance details outside Gemini scope live in AGENTS/playbook/template docs.
