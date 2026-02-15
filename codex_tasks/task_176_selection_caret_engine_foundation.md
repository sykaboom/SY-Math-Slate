# Task 176: Selection/Caret Engine Foundation

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add a reusable caret/selection foundation module for DataInput editing actions.
- What must NOT change:
  - No UX regressions for existing text selection formatting actions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_176_selection_caret_engine_foundation.md`
- `v10/src/features/editor-core/selection/caretEngine.ts`
- `v10/src/features/layout/dataInput/types.ts`
- `v10/src/features/layout/dataInput/segmentCommands.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

Out of scope:
- Command bus changes and toolbar shortcut bindings.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Selection foundation must be deterministic and not import store modules.
- Compatibility:
  - Existing segment command outputs remain HTML-compatible with current sanitizer.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_175`]
- Enables tasks:
  - [`task_177`, `task_182`]
- Parallel group:
  - G1-core
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
    - caret engine + segment command files are single-owner
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

- [x] AC-1: `caretEngine.ts` provides typed snapshot/capture/resolve helpers.
- [x] AC-2: `segmentCommands.ts` consumes caret foundation without breaking wrap operations.
- [x] AC-3: lint passes on touched files.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/editor-core/selection/caretEngine.ts src/features/layout/dataInput/segmentCommands.ts src/features/layout/DataInputPanel.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Selection snapshot mismatch can break inline wrapping behavior.
- Roll-back:
  - Revert caret foundation usage and restore direct `Range` path.

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
- `codex_tasks/task_176_selection_caret_engine_foundation.md`
- `v10/src/features/editor-core/selection/caretEngine.ts`
- `v10/src/features/layout/dataInput/types.ts`
- `v10/src/features/layout/dataInput/segmentCommands.ts`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/editor-core/selection/caretEngine.ts src/features/layout/dataInput/types.ts src/features/layout/dataInput/segmentCommands.ts`
- `scripts/check_layer_rules.sh`
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
- Caret snapshot capture/resolve foundation is active and segment wrap operations remain functional with backward-compatible API.

Notes:
- DataInputPanel continues to store selection refs while segmentCommands now supports snapshot-based restoration.
