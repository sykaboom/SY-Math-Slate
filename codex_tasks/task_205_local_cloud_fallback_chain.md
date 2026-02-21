# Task 205: Local-Cloud Fallback Chain

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add deterministic local-first/cloud-fallback adapter chain resolver.
  - Integrate fallback chain into tool execution route hook without bypassing policy/approval checks.
- What must NOT change:
  - Command bus preflight and tool approval policy behavior must not be bypassed.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_205_local_cloud_fallback_chain.md`
- `v10/src/features/platform/extensions/routing/localCloudFallback.ts` (new)
- `v10/src/features/platform/extensions/routing/types.ts`
- `v10/src/features/platform/extensions/routing/index.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/core/extensions/connectors.ts` (route hook integration if required)

Out of scope:
- External remote provider billing/rate-limit integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Fallback resolver must be pure selection logic; no store mutation.
- Compatibility:
  - If no local adapter available, existing W4 router behavior remains as fallback.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - [`task_200`, `task_201`, `task_202`, `task_203`, `task_204`]
- Enables tasks:
  - [`task_206`, `task_207`]
- Parallel group:
  - G5-routing
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

- [x] AC-1: Fallback chain resolver produces deterministic ordered candidates (`local-first`).
- [x] AC-2: Runtime path can resolve through fallback chain while preserving policy gates.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: evaluate fallback resolver with local available/unavailable fixtures.
   - Expected result: local preferred when healthy, cloud fallback selected when local unavailable.
   - Covers: AC-1

2) Step:
   - Command / click path: execute tool request path with fallback-enabled routing.
   - Expected result: selected adapter follows fallback order; policy denial/approval still enforced.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misordered chain could force cloud use even when local is available.
- Roll-back:
  - keep fallback chain feature-flagged and retain prior W4 route path as default fallback.

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
- `v10/src/features/platform/extensions/routing/localCloudFallback.ts`
- `v10/src/features/platform/extensions/routing/types.ts`
- `v10/src/features/platform/extensions/routing/index.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
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
- fallback resolver가 local-preferred 체인 정렬/선택을 deterministic하게 수행함을 확인.
- bootstrap 라우팅에서 baseline capability route 후 local-cloud fallback override가 동작하며 policy path 우회 없음.

Notes:
- fallback route decision은 기존 extension audit 이벤트로 기록됨.
