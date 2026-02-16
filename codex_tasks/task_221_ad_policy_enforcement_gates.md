# Task 221: Ad Policy Enforcement Gates

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add deterministic ad-policy gating for community post/comment creation.
  - Block policy-violating payloads with explicit error codes.
- What must NOT change:
  - Existing non-violating community flows remain unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_221_ad_policy_enforcement_gates.md`
- `v10/src/features/community/policy/adPolicy.ts` (new)
- `v10/src/app/api/community/route.ts`
- `v10/src/features/community/useCommunityActions.ts`

Out of scope:
- Rights claim/takedown model changes.
- Invalid traffic telemetry model changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Ad policy logic must stay pure and deterministic.
  - API returns fail-closed code on blocked content.
- Compatibility:
  - Contract-level payload validation remains intact.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W8
- Depends on tasks:
  - [`task_220`]
- Enables tasks:
  - [`task_222`, `task_223`]
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

- [x] AC-1: `create-post` and `create-comment` pass ad-policy checks before mutation.
- [x] AC-2: Violating payload returns explicit deterministic ad-policy error response.
- [x] AC-3: Client community action path surfaces ad-policy block as typed failure.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: submit violating post/comment payload.
   - Expected result: blocked with ad-policy code.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: submit normal payload.
   - Expected result: accepted and snapshot updates.
   - Covers: AC-1

3) Step:
   - Command / click path: invoke `useCommunityActions` create API path.
   - Expected result: block reason is returned as typed client failure.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict patterns could over-block normal content.
- Roll-back:
  - Revert ad policy module + route checks.

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
- `v10/src/features/community/policy/adPolicy.ts`
- `v10/src/app/api/community/route.ts`
- `v10/src/features/community/useCommunityActions.ts`
- `codex_tasks/task_221_ad_policy_enforcement_gates.md`

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
- Violating payloads are rejected with deterministic ad-policy codes and no state mutation.
- Client action hook propagates the same typed failure path.

Notes:
- Ad policy gate is implemented both client preflight and server authoritative check.
