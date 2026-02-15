# Task 188: Approval Queue Integration for Drafts

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Integrate Input Studio draft proposals with existing approval queue (pendingAIQueue) and host approval path.
- What must NOT change:
  - Existing command/tool approval queue behavior must remain intact.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_188_approval_queue_integration_for_drafts.md`
- `v10/src/features/input-studio/approval/*`
- `v10/src/features/store/useSyncStore.ts`
- `v10/src/features/toolbar/useApprovalLogic.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

Out of scope:
- Role policy redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Queue entry payloads remain JSON-safe.
- Compatibility:
  - Existing pending approval panel keeps functioning for previous queue types.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3
- Depends on tasks:
  - [`task_186`, `task_187`]
- Enables tasks:
  - [`task_190`]
- Parallel group:
  - G3-input
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

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Input Studio draft proposals can be enqueued as pending approvals.
- [x] AC-2: Host approval flow can apply queued Input Studio draft proposals.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: enqueue draft proposal and approve as host
   - Expected result: queue entry consumed and draft applied
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Queue meta parsing collision with existing command queue entries.
- Roll-back:
  - Scope queued draft entry type behind explicit `queueType` guard.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "w3 위임모드 실행. 서브에이전트 최적 설계하여 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/input-studio/approval/inputStudioApproval.ts`
- `v10/src/features/toolbar/useApprovalLogic.ts`
- `v10/src/features/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/layout/DataInputPanel.tsx src/features/input-studio`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
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
  - None
- Newly introduced failures:
  - None
- Blocking:
  - None
- Mitigation:
  - N/A

Manual verification notes:
- Queue envelope/meta parsing for `input-studio-draft` is wired in approval logic; host approval consumes and imports draft blocks.

Notes:
- `DataInputPanel` now exposes explicit “승인 큐 전송” path for candidate drafts.
