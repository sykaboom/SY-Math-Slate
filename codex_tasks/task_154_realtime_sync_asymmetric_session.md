# Task 154: Realtime Asymmetric Sync and Session Resilience

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add host/student asymmetric realtime sync for step/viewport/pointer/approval queue.
  - Ensure reconnect/resume behavior with deterministic conflict handling.
- What must NOT change:
  - No direct doc mutation on student clients without approval path.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/sync/**` (new)
- `v10/src/features/store/useSyncStore.ts`
- `v10/src/features/canvas/viewport/**`
- `v10/src/features/layout/**`

Out of scope:
- External SaaS infrastructure provisioning.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (unless transport library approval is granted)
- Boundary rules:
  - Sync state remains separate from doc persistence state.
  - Student flow remains approval-gated for doc mutations.
- Compatibility:
  - Single-user mode must still work.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: sync transport/state model
    - B: viewport/step sync wiring
    - C: reconnect/recovery handling
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Host step/viewport changes propagate to student sessions.
- [ ] AC-2: Student doc-changing actions route through approval queue.
- [ ] AC-3: Reconnect restores session state without doc corruption.
- [ ] AC-4: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run host+student sessions and step through content.
   - Expected result: student follows host state.
   - Covers: AC-1

2) Step:
   - Command / click path: student triggers doc mutation tool request.
   - Expected result: request enqueued, not directly applied.
   - Covers: AC-2

3) Step:
   - Command / click path: disconnect/reconnect student session.
   - Expected result: session resumes without corruption.
   - Covers: AC-3

4) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Sync race conditions can produce stale state.
- Roll-back:
  - Disable realtime mode and keep local-only session path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/store/useSyncStore.ts` (existing API reused)

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`
- `scripts/run_beta_quality_gate.sh`

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
- BroadcastChannel 기반 host->student step/viewport/laser 동기화 경로 탑재.
- student 접속 시 state-request, host 응답(state-update) 핸드셰이크로 재연결 복원 경로 확보.
- student 문서 변경은 기존 approval queue 경로 유지.

Notes:
- 외부 transport dependency 없이 single-user 호환 모드 보존.
