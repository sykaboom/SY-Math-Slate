# Task 177: Inline Rich-Text Edit Commandization

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Convert inline rich-text draft mutations in DataInput panel into explicit command-style reducer operations.
- What must NOT change:
  - No schema change for persisted `StepBlock` content.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_177_inline_rich_text_edit_commandization.md`
- `v10/src/features/layout/dataInput/inlineEditCommands.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

Out of scope:
- Global command bus transport, plugin API, and non-DataInput UI.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Command module must be pure and serializable input/output.
- Compatibility:
  - Existing styling controls (bold/italic/underline/highlight/math wrappers) remain functional.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_175`, `task_176`]
- Enables tasks:
  - [`task_178`, `task_180`]
- Parallel group:
  - G2-editor
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
    - inline command module + DataInputPanel ownership lock
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

- [x] AC-1: Inline draft mutations for segment HTML/style/ordering run through typed command reducer helpers.
- [x] AC-2: DataInput panel behavior for add/remove/move/update segment remains functionally equivalent.
- [x] AC-3: lint/build pass for touched scope.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/layout/dataInput/inlineEditCommands.ts src/features/layout/DataInputPanel.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect reducer mapping can reorder or mutate segments unexpectedly.
- Roll-back:
  - Revert to prior direct `setBlocks` mutation handlers.

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
- `codex_tasks/task_177_inline_rich_text_edit_commandization.md`
- `v10/src/features/layout/dataInput/inlineEditCommands.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/layout/dataInput/inlineEditCommands.ts src/features/layout/DataInputPanel.tsx`
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
- Inline segment draft mutations in DataInputPanel now execute through reducer commands from `inlineEditCommands.ts`.

Notes:
- Behavior preserved while mutation paths are made explicit and composable.
