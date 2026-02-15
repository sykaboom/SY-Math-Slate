# Task 179: Clipboard Paste Normalization Pipeline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Centralize clipboard paste parsing/normalization for canvas and paste-helper modal.
- What must NOT change:
  - No change to image insertion API contract used by `useImageInsert`.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_179_clipboard_paste_normalization_pipeline.md`
- `v10/src/features/canvas/paste/pasteNormalization.ts`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/PasteHelperModal.tsx`

Out of scope:
- OCR/LLM parsing for pasted text and media upload backend.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep normalization pure; no store import in parser.
- Compatibility:
  - Existing image-paste behavior remains working in both global paste and modal paste.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_175`]
- Enables tasks:
  - [`task_206`, `task_212`]
- Parallel group:
  - G3-runtime
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W2 (`task_175~182`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - paste normalization module single-owner; stage/modal integration sequential merge
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `pasteNormalization.ts` provides normalized clipboard extraction helper.
- [x] AC-2: `CanvasStage` and `PasteHelperModal` use shared normalization helper path.
- [x] AC-3: lint passes for touched files.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/canvas/paste/pasteNormalization.ts src/features/canvas/CanvasStage.tsx src/features/canvas/PasteHelperModal.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Clipboard item iteration differences across browsers/tablets.
- Roll-back:
  - Restore per-component paste handlers.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이 w2 진행해. 당연 서브에이전트 관리 잘하고."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_179_clipboard_paste_normalization_pipeline.md`
- `v10/src/features/canvas/paste/pasteNormalization.ts`
- `v10/src/features/canvas/CanvasStage.tsx`
- `v10/src/features/canvas/PasteHelperModal.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/canvas/paste/pasteNormalization.ts src/features/canvas/CanvasStage.tsx src/features/canvas/PasteHelperModal.tsx`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- CanvasStage global paste and PasteHelperModal paste both route through shared normalization helper and preserve image insert behavior.

Notes:
- Type-safe clipboard source guard added to keep Next build type-check stable.
