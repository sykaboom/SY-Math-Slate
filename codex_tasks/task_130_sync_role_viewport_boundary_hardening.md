# Task 130: Sync/Role/Viewport Boundary Hardening

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Harden boundaries between local role state, sync viewport state, and command approval semantics.
  - Ensure student kiosk constraints remain deterministic after state split.
- What must NOT change:
  - No MCP protocol redesign.
  - No plugin manifest schema expansion.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_130_sync_role_viewport_boundary_hardening.md`
- `v10/src/features/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/store/useSyncStore.ts`
- `v10/src/features/store/useLocalStore.ts`
- `v10/src/core/engine/commandBus.ts` (if context metadata hardening needed)
- `v10/src/features/extensions/commandExecutionPolicy.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`

Out of scope:
- useUIStore deletion
- toolbar UI redesign

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Student cannot mutate shared doc state directly.
  - Host/shared viewport sync remains deterministic.
- Compatibility:
  - Existing kiosk and teacher-in-the-loop behavior preserved.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_130 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: viewport interaction + AppLayout
    - Implementer-B: local/sync stores
    - Implementer-C: policy hooks + commandBus touchpoints
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

- [x] AC-1: Student viewport interactions remain read-only/local-guarded as designed.
- [x] AC-2: Host viewport updates continue broadcasting through sync store.
- [x] AC-3: Approval queue policies remain enforced for mutating command/tool paths.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run viewport interactions as host/student
   - Expected result: host writable, student constrained and synced
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: run mutating actions as student
   - Expected result: approval queue path enforced
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Boundary hardening can accidentally over-restrict host interactions.
- Roll-back:
  - Revert boundary changes to prior stable behavior.

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
- Phase-2 boundary lock task.
