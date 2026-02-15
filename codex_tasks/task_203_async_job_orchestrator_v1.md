# Task 203: Async Job Orchestrator V1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add async job orchestration utility for local AI execution lifecycle (`queued/running/succeeded/failed/cancelled`).
  - Provide deterministic in-memory scheduling primitives usable by local adapter/fallback flows.
- What must NOT change:
  - Existing command bus and connector resolution contracts must not be replaced.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_203_async_job_orchestrator_v1.md`
- `v10/src/features/extensions/jobs/types.ts` (new)
- `v10/src/features/extensions/jobs/asyncJobOrchestrator.ts` (new)
- `v10/src/features/extensions/jobs/index.ts` (new)

Out of scope:
- Persisting jobs to storage/DB.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Orchestrator must be JSON-safe and pure TS utility (no UI/store coupling).
- Compatibility:
  - Existing synchronous tool paths remain available.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - [`task_199`]
- Enables tasks:
  - [`task_204`, `task_205`, `task_206`]
- Parallel group:
  - G5-orchestration
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

- [x] AC-1: Orchestrator can enqueue/start/resolve/fail/cancel jobs with deterministic IDs.
- [x] AC-2: Job snapshots are JSON-safe and bounded for observability.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run orchestrator unit-style lifecycle sequence in local script/test harness.
   - Expected result: state transitions follow contract and IDs are deterministic.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Queue growth without bounds could affect memory.
- Roll-back:
  - enforce configurable bounded history and drop oldest snapshots.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음웨이브 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/extensions/jobs/types.ts`
- `v10/src/features/extensions/jobs/asyncJobOrchestrator.ts`
- `v10/src/features/extensions/jobs/index.ts`

Commands run (only if user asked or required by spec):
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
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- enqueue/start/succeed/fail/cancel 전이와 deterministic job id 생성 확인.
- history limit 및 JSON-safe snapshot helper 동작 확인.

Notes:
- 동기 경로와 분리된 in-memory orchestrator로 구현되어 기존 connector path를 대체하지 않음.
