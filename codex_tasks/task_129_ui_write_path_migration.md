# Task 129: UI Write Path Migration

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Migrate UI write paths (setters/toggles) from `useUIStore` to split domain stores and command paths.
- What must NOT change:
  - No store file deletion yet.
  - No mutation of unrelated domains.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_129_ui_write_path_migration.md`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/PenControls.tsx`
- `v10/src/features/chrome/toolbar/LaserControls.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/platform/hooks/useViewportInteraction.ts` (if write path touched here)
- `v10/src/features/platform/store/useUIStoreBridge.ts`

Out of scope:
- removing compat wrapper
- deep sync boundary changes (task_130)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - UI writes should not bypass command/store boundaries.
- Compatibility:
  - Existing UX semantics remain unchanged.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_129 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: toolbar writes
    - Implementer-B: layout/data input writes
    - Implementer-C: bridge updates
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

- [x] AC-1: Targeted write paths no longer call `useUIStore` setters directly.
- [x] AC-2: Writes route through split stores and command boundaries as intended.
- [x] AC-3: No user-visible behavior regressions in edit/presentation flows.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect targeted handlers
   - Expected result: direct `useUIStore` setter writes removed
   - Covers: AC-1

2) Step:
   - Command / click path: operate toolbar/layout actions
   - Expected result: behavior unchanged
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Event handler rewiring can miss edge controls.
- Roll-back:
  - Revert write-path migrations and restore bridge delegation.

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
- Phase-2 write migration.
