# Task 128: UI Read Path Migration

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Migrate UI read subscriptions from `useUIStore` to split domain stores.
  - Keep write behavior bridged during this task.
- What must NOT change:
  - No full write-path replacement yet.
  - No deletion of `useUIStore` file.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_128_ui_read_path_migration.md`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/layout/PlayerBar.tsx`
- `v10/src/features/chrome/layout/Prompter.tsx`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/PageViewport.tsx`
- `v10/src/features/editor/canvas/PageGuides.tsx`
- `v10/src/features/editor/canvas/CanvasGuides.tsx`
- `v10/src/features/platform/hooks/useBoardTransform.ts`

Out of scope:
- write-path mutation rewiring
- removal of useUIStore compat bridge

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Reads should subscribe from domain stores only.
  - Avoid unnecessary rerenders during subscription split.
- Compatibility:
  - Visual and interaction behavior unchanged.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_128 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: layout files
    - Implementer-B: toolbar/player files
    - Implementer-C: canvas/view files
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

- [x] AC-1: Targeted components no longer read from `useUIStore` directly.
- [x] AC-2: Domain-store reads produce equivalent runtime behavior.
- [x] AC-3: Build and lint pass after migration.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect imports/selectors in targeted files
   - Expected result: reads use split domain stores
   - Covers: AC-1

2) Step:
   - Command / click path: run host/student view interactions
   - Expected result: behavior unchanged
   - Covers: AC-2

3) Step:
   - Command / click path: lint/build
   - Expected result: pass
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Subscription mismatches can break derived values.
- Roll-back:
  - Revert read migrations per-file.

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
- Phase-2 read migration.
