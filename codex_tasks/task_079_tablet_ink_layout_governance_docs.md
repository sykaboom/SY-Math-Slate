# Task 079: Tablet Ink Layout Governance Documentation

Status: COMPLETED
Owner: Codex
Target: docs-only
Date: 2026-02-06

## Goal
- What to change:
  - Document an operating model for layout work in v10, treating layout as a core ink UX control surface.
  - Define how Gemini SVG drafts and Codex implementation/redline steps must run for tablet-focused layout changes.
- What must NOT change:
  - No production code edits in `v10/src`.
  - No dependency additions.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `AGENTS.md`
- `GEMINI_CODEX_PROTOCOL.md`
- `PROJECT_BLUEPRINT.md`
- `codex_tasks/task_079_tablet_ink_layout_governance_docs.md`

Out of scope:
- Any runtime UI implementation
- Any CSS/TS/JS production code change

## Dependencies / constraints
- Must remain aligned with existing SVG layout gate and spec-gated workflow.
- Must keep forward-compatibility and anti-spaghetti constraints.
- Must explicitly capture tablet viewport verification expectations.

## Acceptance criteria (must be testable)
- [x] `AGENTS.md` includes tablet ink UX layout governance rules (process + viewport verification matrix).
- [x] `GEMINI_CODEX_PROTOCOL.md` includes a stable SVG redline loop for layout refinement.
- [x] `PROJECT_BLUEPRINT.md` includes an explicit principle that layout control quality is core ink UX quality.
- [x] No production code files are modified.

## Manual verification steps (since no automated tests)
- Read updated docs and confirm the same governance appears consistently across:
  - implementer workflow (`AGENTS.md`)
  - collaboration protocol (`GEMINI_CODEX_PROTOCOL.md`)
  - project constitution (`PROJECT_BLUEPRINT.md`)
- Confirm `git status` shows docs-only changes.

## Risks / roll-back notes
- Risk: Over-constraining layout policy can slow iteration.
- Mitigation: Keep one refinement loop and use small-batch implementation slices.
- Roll-back: revert this task's doc-only changes.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `AGENTS.md`
- `GEMINI_CODEX_PROTOCOL.md`
- `PROJECT_BLUEPRINT.md`
- `codex_tasks/task_079_tablet_ink_layout_governance_docs.md`

Commands run (only if user asked):
- `cat > codex_tasks/task_079_tablet_ink_layout_governance_docs.md`
- `sed -n ... AGENTS.md / GEMINI_CODEX_PROTOCOL.md / PROJECT_BLUEPRINT.md`
- `rg -n ... v10/src/features/chrome/layout ...` (tablet UX risk scan)
- `apply_patch` (docs updates)

Notes:
- Spec created before documentation edits.
- Manual verification:
  - Confirmed governance alignment across implementer workflow (`AGENTS.md`), collaboration protocol (`GEMINI_CODEX_PROTOCOL.md`), and constitution (`PROJECT_BLUEPRINT.md`).
  - Confirmed docs-only scope for this task (no `v10/src` production code edits).
