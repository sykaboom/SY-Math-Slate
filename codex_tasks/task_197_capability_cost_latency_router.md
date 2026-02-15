# Task 197: Capability/Cost/Latency Router

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add deterministic adapter selection router based on tool capabilities, estimated cost, and latency hints.
- What must NOT change:
  - Command bus and approval policy behavior must not be bypassed.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_197_capability_cost_latency_router.md`
- `v10/src/features/extensions/routing/capabilityRouter.ts` (new)
- `v10/src/features/extensions/routing/types.ts` (new)
- `v10/src/features/extensions/routing/index.ts` (new)
- `v10/src/core/extensions/connectors.ts` (add optional router hook)
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`

Out of scope:
- Cloud/local fallback chain (W5).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Router remains pure selector logic (no direct store mutation).
- Compatibility:
  - If router yields no candidate, legacy adapter resolution path still works.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W4
- Depends on tasks:
  - [`task_191`, `task_192`, `task_193`, `task_194`, `task_195`, `task_196`]
- Enables tasks:
  - [`task_198`, `task_199`]
- Parallel group:
  - G4-routing
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

- [x] AC-1: Router ranks/selects adapter IDs deterministically from tool + capability input.
- [x] AC-2: Connector execution path can optionally use router-selected adapter.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: execute routing helper with fixed candidate list repeatedly.
   - Expected result: same adapter selected for same input.
   - Covers: AC-1

2) Step:
   - Command / click path: invoke registered tool request with router option.
   - Expected result: resolved adapter ID follows router choice; fallback path still functional.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Routing preference may accidentally select incompatible adapters.
- Roll-back:
  - Guard router output by category compatibility checks and fallback to legacy resolution.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 wave 진행하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/extensions/routing/types.ts`
- `v10/src/features/extensions/routing/capabilityRouter.ts`
- `v10/src/features/extensions/routing/index.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`

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
- 고정 입력에 대해 adapter 선택 결과가 stable order로 결정됨을 확인.
- connector 실행 옵션에 route hook을 추가해 routed adapter 선택이 가능하고 fallback 경로 유지 확인.

Notes:
- runtime bootstrap에서 routed adapter wrapper를 등록해 기존 호출 경로를 깨지 않고 라우팅을 주입함.
