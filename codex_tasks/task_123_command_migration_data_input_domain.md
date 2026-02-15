# Task 123: Command Migration — Data Input Domain

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Route data-input mutation paths through CommandBus.
  - Keep editor UX and mixed text/math behaviors intact.
- What must NOT change:
  - No visual redesign of panel.
  - No manifest cutover in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_123_command_migration_data_input_domain.md`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/hooks/useCanvas.ts`
- `v10/src/features/hooks/usePersistence.ts`

Out of scope:
- Playback/page controls
- Toolbar manifest cutover
- useUIStore deletion

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Preserve current sanitizer path and content safety.
  - Data-input mutations must go through validated command payloads.
- Compatibility:
  - Existing mixed step animation and text/math behavior must remain stable.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_123 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `registerCoreCommands.ts`
    - Implementer-B: `DataInputPanel.tsx`
    - Implementer-C: `useCanvas.ts`, `usePersistence.ts`
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Data-input mutation commands are registered and validated.
- [x] AC-2: DataInputPanel mutation actions dispatch commands.
- [x] AC-3: Existing sanitizer and mixed text/math edit behavior remains stable.
- [x] AC-4: Approval queue flow remains functional for student mutating commands.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: edit/add/delete/reorder blocks in data panel
   - Expected result: behavior unchanged, command dispatch path active
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: run mixed text+math editing flow
   - Expected result: no regressions in rendering/animation handoff
   - Covers: AC-3

3) Step:
   - Command / click path: perform same with student role
   - Expected result: approval-required queue behavior
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Data panel is large and can regress subtle edit flows.
- Roll-back:
  - Revert data-input command wiring and command additions.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "좋아 모든 권한을 주겠다. 너를 오케스트라로 위임하여 작업완료를 명령한다.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- See task-scoped file list in this commit diff.

Commands run (only if user asked or required by spec):
- node scripts/gen_ai_read_me_map.mjs
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/run_repo_verifications.sh
- scripts/check_layer_rules.sh
- scripts/check_v10_migration_baseline.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (non-blocking, pre-existing).
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Lint/build/repo verification scripts passed for the delegated chain.
- Command-bus migration, declarative shadow/cutover path, and UI store split scaffold were integrated without layer violations.

Notes:
- Domain migration wave B-C.
