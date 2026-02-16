# Task 237: Slate Windowed Panels (Preserve Canvas Area)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Define a declarative panel behavior contract for modding before UI cutover.
  - Introduce panel-level policy fields so each module can switch between windowed/docked/fixed behavior without code edits.
  - Establish runtime-ready schema for open/close, drag-move, reset, default position, and role-based visibility.
- What must NOT change:
  - Do not alter command semantics or persistence contracts.
  - Do not change host/student permission policy outcomes.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories (expected):
- `codex_tasks/task_237_slate_windowed_panels_preserve_canvas_area.md`
- `v10/src/features/layout/windowing/panelBehavior.types.ts` (new)
- `v10/src/features/layout/windowing/panelBehavior.schema.ts` (new/manual validator)
- `v10/src/core/config/panel-policy.ts` (new or update)
- `v10/src/features/extensions/ui/registerCoreSlots.ts` (contract surface only; no cutover)

Out of scope:
- Any AppLayout cutover or panel renderer migration.
- DataInput/FloatingToolbar UI internals.
- Canvas rendering or pointer logic.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep logic/view separation and existing layer rules.
  - Preserve touch target minimums and safe-area handling.
- Compatibility:
  - Existing shortcuts, role routing, and fullscreen ink mode should continue to work.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-A2
- Depends on tasks:
  - []
- Enables tasks:
  - [`task_238`, `task_240`]
- Parallel group:
  - G-policy
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

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

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Panel behavior contract includes `displayMode: 'windowed' | 'docked'`, `movable`, `defaultPosition`, `rememberPosition`, `roleOverride`.
- [ ] AC-2: Contract validation path exists (manual validator/type guard), rejects unknown keys and invalid mode values.
- [ ] AC-3: Core module registration path can carry behavior config without direct AppLayout condition branches.
- [ ] AC-4: Student/host visibility can be expressed in data contract (policy), not hardcoded UI logic.
- [ ] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: Inspect contract type/schema definitions.
   - Expected result: required keys and strict mode/value constraints are present.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: Inspect core slot/module registration mapping.
   - Expected result: registration accepts declarative panel behavior payload.
   - Covers: AC-3, AC-4

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict schema could block legacy module registration.
  - If contract names are unstable, downstream tasks may require rename churn.
- Roll-back:
  - Revert contract/policy files and keep existing module registration behavior.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- (to be filled)

Notes:
- (to be filled)
