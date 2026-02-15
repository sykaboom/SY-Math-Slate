# Task 127: UI State Domain Split Scaffold

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce split UI domain stores to replace monolithic `useUIStore` responsibilities.
  - Provide compatibility bridge for incremental migration.
- What must NOT change:
  - No immediate removal of `useUIStore` in this task.
  - No behavior regressions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_127_ui_state_domain_split_scaffold.md`
- `v10/src/features/store/useToolStore.ts` (new)
- `v10/src/features/store/useViewportStore.ts` (new)
- `v10/src/features/store/usePlaybackStore.ts` (new)
- `v10/src/features/store/useChromeStore.ts` (new)
- `v10/src/features/store/useCapabilityStore.ts` (new)
- `v10/src/features/store/useUIStoreBridge.ts` (new)
- `v10/src/features/store/useUIStore.ts` (compat wrapper only)

Out of scope:
- Full read-path migration
- Full write-path migration
- Removal of useUIStore references

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - New stores must stay JSON-safe and domain-focused.
  - Bridge layer only; no duplicated business logic divergence.
- Compatibility:
  - Existing `useUIStore` consumers continue to run via bridge.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_127 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: tool+viewport stores
    - Implementer-B: playback+chrome stores
    - Implementer-C: capability+bridge+compat wrapper
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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: New UI domain stores exist and compile.
- [x] AC-2: Compatibility bridge exposes current `useUIStore` shape for incremental migration.
- [x] AC-3: Existing app behavior remains unchanged after scaffolding.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect new store files and bridge
   - Expected result: domain split scaffold is present
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: run app interactions without migration changes
   - Expected result: behavior unchanged
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Bridge mismatch can cause subtle state drift.
- Roll-back:
  - Revert split stores and keep monolithic store intact.

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
- Phase-2 scaffolding.
