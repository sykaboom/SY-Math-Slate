# Task 131: Remove useUIStore and Bridge Cleanup

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Remove `useUIStore` legacy implementation after read/write migrations complete.
  - Cleanup bridge compatibility layers and dead references.
- What must NOT change:
  - No behavior regressions in core app flows.
  - No command bus or gateway policy weakening.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_131_remove_useuistore_and_bridge_cleanup.md`
- `v10/src/features/platform/store/useUIStore.ts` (remove or replace with deprecation shim)
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- all remaining `v10/src/**` references to `useUIStore`
- `v10/AI_READ_ME.md`

Out of scope:
- new feature additions
- design language refresh

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `rg -n "@features/store/useUIStore\"" v10/src` must be zero.
- Compatibility:
  - Existing role/viewport/playback/tooling/data-input behavior maintained.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_131 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: store removal/bridge cleanup
    - Implementer-B: remaining refs replacement
    - Implementer-C: docs update
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

- [x] AC-1: No imports from legacy `@features/store/useUIStore` path remain.
- [x] AC-2: Legacy bridge paths are removed or reduced to inert shims.
- [x] AC-3: Lint/build/verifications pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "@features/store/useUIStore\"" v10/src`
   - Expected result: zero legacy import-path references
   - Covers: AC-1

2) Step:
   - Command / click path: inspect store directory
   - Expected result: bridge cleanup complete
   - Covers: AC-2

3) Step:
   - Command / click path: lint/build/verifications
   - Expected result: pass
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Missing deep references can break runtime.
- Roll-back:
  - Restore `useUIStore` and reintroduce bridge layer temporarily.

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
- Deletion gate task.
