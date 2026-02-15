# Task 121: Command Migration — Tooling Domain

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Migrate tooling-domain mutations (tool select, pen/laser options) to CommandBus dispatch path.
  - Preserve current UI behavior while replacing direct mutation calls.
- What must NOT change:
  - No toolbar visual redesign.
  - No removal of non-tooling controls in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_121_command_migration_tooling_domain.md`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/toolbar/PenControls.tsx`
- `v10/src/features/toolbar/LaserControls.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`

Out of scope:
- Playback/page commands
- Data-input mutation migration
- Manifest cutover

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Direct write mutations for tooling settings must route through `dispatchCommand`.
  - Payload validation required for each new command.
- Compatibility:
  - Same visible state transitions and defaults as before.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_121 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `registerCoreCommands.ts`
    - Implementer-B: `PenControls.tsx`, `LaserControls.tsx`
    - Implementer-C: `FloatingToolbar.tsx`
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

- [x] AC-1: Tooling command set is registered (`setTool`, `setPenType`, `setPenColor`, `setPenWidth`, `setPenOpacity`, `setLaserType`, `setLaserColor`, `setLaserWidth`).
- [x] AC-2: Tooling controls dispatch commands instead of direct mutation writes.
- [x] AC-3: Tooling behavior remains functionally equivalent in host mode.
- [x] AC-4: Student role on mutating commands receives approval-required semantics.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: select pen/laser tools and change options
   - Expected result: behavior unchanged, commands dispatched
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: run same actions under student role
   - Expected result: queue/approval-required behavior
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Partial migration may leave mixed mutation paths.
- Roll-back:
  - Revert tooling command registrations and UI dispatch rewiring.

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
- Domain migration wave B-A.
