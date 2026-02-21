# Task 175: Editor Surface Domain Model v1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce a dedicated editor-surface domain model for draft blocks/insertion metadata so W2 modules share one typed foundation.
- What must NOT change:
  - No visual redesign and no behavior regression in existing DataInput open/apply flow.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_175_editor_surface_domain_model_v1.md`
- `v10/src/features/editor/editor-core/model/editorSurface.ts`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Out of scope:
- Selection DOM APIs, command bus protocol changes, or new persistence format.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep domain model as pure TypeScript; no React imports in model file.
- Compatibility:
  - Existing `StepBlock` contract remains backward-compatible.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_174`]
- Enables tasks:
  - [`task_176`, `task_177`, `task_178`, `task_181`]
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
    - `editorSurface.ts` single-owner; `DataInputPanel.tsx` single-owner during patch window
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

- [x] AC-1: `editorSurface.ts` exports typed editor-surface model and deterministic helpers from `StepBlock[]`.
- [x] AC-2: `DataInputPanel` reads insertion/preview data through the new model helper path.
- [x] AC-3: `cd v10 && npm run lint` passes for touched files.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/editor/editor-core/model/editorSurface.ts src/features/chrome/layout/DataInputPanel.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Divergent draft/index computation if model mapping is inconsistent with existing panel assumptions.
- Roll-back:
  - Revert `editorSurface.ts` integration and restore direct panel derivations.

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
- `codex_tasks/task_175_editor_surface_domain_model_v1.md`
- `v10/src/features/editor/editor-core/model/editorSurface.ts`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/editor/editor-core/model/editorSurface.ts src/features/chrome/layout/DataInputPanel.tsx`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

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
- Editor surface model helper is integrated for insertion marker and block preview derivations in DataInputPanel.
- No regression observed in DataInput open/apply flows during gate verification.

Notes:
- W2 delegated execution: sub-agent implementation merged and verified by Codex.
