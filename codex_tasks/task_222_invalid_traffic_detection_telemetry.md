# Task 222: Invalid Traffic Detection Telemetry

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add deterministic invalid-traffic detection heuristics for community mutation endpoints.
  - Persist bounded telemetry signals for elevated/blocked traffic.
- What must NOT change:
  - Normal traffic path remains allowed and stable.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_222_invalid_traffic_detection_telemetry.md`
- `v10/src/core/contracts/community.ts`
- `v10/src/features/community/traffic/invalidTraffic.ts` (new)
- `v10/src/app/api/community/route.ts`
- `v10/src/features/community/store/useCommunityStore.ts`
- `v10/src/features/moderation/useModerationConsole.ts`
- `v10/src/features/moderation/ModerationConsolePanel.tsx`

Out of scope:
- Ad policy rule content.
- Rights-claim semantics.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Detection logic must be deterministic and bounded-memory.
  - Telemetry exposure must avoid raw PII leakage.
- Compatibility:
  - Existing community snapshot consumers continue to function.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W8
- Depends on tasks:
  - [`task_220`, `task_221`]
- Enables tasks:
  - [`task_223`]
- Parallel group:
  - G8-ads
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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Community mutations run invalid-traffic assessment and block severe bursts.
- [x] AC-2: Elevated/blocked signals are captured in bounded telemetry snapshot.
- [x] AC-3: Moderation console renders latest invalid-traffic signals for host.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: simulate repeated mutation calls from same identity.
   - Expected result: elevated/blocked detection is triggered deterministically.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect returned snapshot telemetry list.
   - Expected result: bounded signal entries contain risk/reason/timestamp.
   - Covers: AC-2

3) Step:
   - Command / click path: open moderation panel host view.
   - Expected result: telemetry list visible and ordered.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Threshold tuning may under/over block in synthetic traffic.
- Roll-back:
  - Revert invalid traffic module and route integration.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 진행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/community/traffic/invalidTraffic.ts`
- `v10/src/core/contracts/community.ts`
- `v10/src/app/api/community/route.ts`
- `v10/src/features/community/store/useCommunityStore.ts`
- `v10/src/features/moderation/useModerationConsole.ts`
- `v10/src/features/moderation/ModerationConsolePanel.tsx`
- `codex_tasks/task_222_invalid_traffic_detection_telemetry.md`

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
  - None observed
- Newly introduced failures:
  - None observed
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Invalid-traffic policy now emits elevated/blocked signals with bounded retention and blocks sustained burst requests (429).
- Moderation panel displays latest traffic signals for host review.

Notes:
- Traffic fingerprinting stores hashed identifier only (no raw IP persisted in snapshot payload).
