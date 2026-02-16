# Chaos and Recovery Drills (W9)

## Purpose
- Validate fail-closed behavior and recovery paths before release candidate cut.
- All drills are deterministic and executable without external paid services.

## Drill 1: Invalid Traffic Burst Block
- Target: `POST /api/community` mutation path.
- Inject:
  - Repeat high-frequency mutation requests from same fingerprint.
- Expected:
  - API returns `429` with `community-invalid-traffic-blocked`.
  - `trafficSignals` contains `riskLevel=blocked` records.
- Recovery:
  - Wait for burst window decay and verify normal requests succeed.

## Drill 2: UGC Safety Block
- Target: `create-post` and `create-comment`.
- Inject:
  - Submit blocked safety phrase.
- Expected:
  - API returns `422` with `community-ugc-safety-blocked`.
  - No post/comment mutation occurs.
  - `safetyEvents` appends `verdict=block`.
- Recovery:
  - Submit clean content and verify mutation success.

## Drill 3: Host Token Misconfiguration
- Target: host-only actions (`moderate-report`, `review-rights-claim`, `trust-safety-slo`).
- Inject:
  - Missing or invalid host token headers.
- Expected:
  - API returns `403` or `500` fail-closed errors.
- Recovery:
  - Restore valid role/token headers and confirm action success.

## Drill 4: Realtime Backplane Degradation
- Target: `features/sync/realtime/backplane.ts`.
- Inject:
  - Missing `NEXT_PUBLIC_SYNC_REALTIME_URL` and websocket unavailable.
- Expected:
  - backplane transport falls back to `broadcast-channel` or `none` without crash.
- Recovery:
  - Re-enable canonical endpoint key and verify websocket transport resumes.

## Drill 5: Snapshot Contract Guard
- Target: community snapshot validation.
- Inject:
  - Missing required snapshot arrays (e.g., `safetyEvents`).
- Expected:
  - `validateCommunitySnapshot` fails deterministically.
- Recovery:
  - Restore full snapshot shape and ensure validation succeeds.

## Exit Criteria
- All 5 drills pass in automated checks.
- No client-side crash introduced.
- Repo verification end-stage is green.
