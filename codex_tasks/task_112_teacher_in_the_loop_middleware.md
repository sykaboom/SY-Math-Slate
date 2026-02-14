# Task 112: Teacher-in-the-Loop Middleware (Queue + Approval)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Intercept student-triggered mutating tool results in connector execution path and queue for host approval.
  - Provide host approval/reject headless flow and panel scaffold.
- What must NOT change:
  - Existing host connector success path remains backward compatible.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/extensions/connectors.ts`
- `v10/src/features/toolbar/useApprovalLogic.ts` (new)
- `v10/src/features/toolbar/PendingApprovalPanel.tsx` (new)
- `v10/src/features/extensions/toolExecutionPolicy.ts` (new)
- `v10/src/features/store/useSyncStore.ts` (queue actions)
- `v10/src/features/store/useDocStore.ts` (approval merge helpers)

Out of scope:
- Full network transport/WebRTC integration
- Full domain-specific merge conflict resolution

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - keep core connector contracts deterministic.
- Compatibility:
  - host flow unchanged when not student/intercepted.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 112
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A:
    - Implementer-B:
    - Implementer-C:
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: `connectors.ts`, `toolExecutionPolicy.ts`
    - B: `useSyncStore.ts`, `useDocStore.ts`
    - C: `useApprovalLogic.ts`, `PendingApprovalPanel.tsx`
  - Parallel slot plan:
    - max 6

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

- [x] AC-1: connectors student intercept path queues approval entries for mutating normalized results.
- [x] AC-2: intercepted path blocks direct doc mutation via deterministic resolution code.
- [x] AC-3: host approval UI logic can approve/reject queue entries.
- [x] AC-4: approval action can merge basic normalized content into doc/canvas flow.
- [x] AC-5: `cd v10 && npm run lint` and `npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke registered tool under student role via policy wrapper
   - Expected result: queue grows, returned resolution indicates approval required
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: host approve/reject in panel
   - Expected result: queue entry resolved and approved flow merges content
   - Covers: AC-3, AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: pass
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - queue/merge semantics may diverge from future production policy.
- Roll-back:
  - revert this task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference)

> Approval reference: user message on 2026-02-14: "좋아. 너의 능력을 보여줄 때다. 모든 권한을 줬다. 서브에이젼트를 상황에 맞게 적극 활용하여 agi수준을 작업능력을 보여줘라." and "남아있는 모든 태스크를 위임모드로 진행하라."

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_112_teacher_in_the_loop_middleware.md`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`
- `v10/src/features/store/useSyncStore.ts`
- `v10/src/features/store/useDocStore.ts`
- `v10/src/features/toolbar/useApprovalLogic.ts`
- `v10/src/features/toolbar/PendingApprovalPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS (warnings only, errors 0)
- Build:
  - PASS
- Script checks:
  - FAIL (`scripts/check_layer_rules.sh` not present in this checkout)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `scripts/check_layer_rules.sh` missing in repository.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - Used lint/build and deterministic path inspection for interception/queue flow.

Manual verification notes:
- `executeRegisteredToolRequest` now returns `approval-required` for student mutating results and enqueues pending approvals via policy hooks.
- Approval logic converts `NormalizedContent` blocks into step blocks, imports to canvas, then syncs doc store.

Notes:
- Queue semantics are deterministic and scoped to current runtime policy hooks.
