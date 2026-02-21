# Task 214: Host/Student Role Sync Hardening

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Harden collaborative sync acceptance rules so student clients only accept host-authoritative updates.
  - Add monotonic/staleness guards for inbound sync envelopes.
- What must NOT change:
  - Host-only authoring capabilities and trusted-role flow in runtime bootstrap must remain compatible.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_214_host_student_role_sync_hardening.md`
- `v10/src/features/collaboration/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/collaboration/sync/realtime/roleSyncGuard.ts` (new)
- `v10/src/features/platform/store/useSyncStore.ts`

Out of scope:
- Presence/laser stream rendering (`task_215`).
- Community and moderation data models (`task_217`, `task_218`).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Guard logic stays in sync/store layers and must not import UI components.
- Compatibility:
  - Unknown or stale envelopes must be ignored (deny-by-default), not crash the runtime.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W7
- Depends on tasks:
  - [`task_213`]
- Enables tasks:
  - [`task_215`, `task_216`]
- Parallel group:
  - G7-collab
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

- [x] AC-1: Student-side sync applies only host-authoritative and monotonic envelopes.
- [x] AC-2: Stale/out-of-order/invalid role envelopes are safely dropped with deterministic handling.
- [x] AC-3: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: send host and non-host envelopes to student runtime.
   - Expected result: only host-authoritative envelopes mutate synced state.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: replay stale sequence envelopes.
   - Expected result: stale updates are ignored.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-strict guard can suppress valid host updates.
- Roll-back:
  - retain prior acceptance path behind isolated guard call to allow targeted revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 위임모드로 진행! 역시 서브에이전트 설계부터하고 하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/collaboration/sync/realtime/roleSyncGuard.ts`
- `v10/src/features/collaboration/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/platform/store/useSyncStore.ts`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`, `run_repo_verifications`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - N/A
- Mitigation:
  - N/A

Manual verification notes:
- Student apply path now rejects non-host, stale/duplicate, and untrusted-host envelopes under fail-closed role resolution.

Notes:
- Sync cursor persisted in `useSyncStore.lastHostEnvelopeCursor` for deterministic monotonic application.
