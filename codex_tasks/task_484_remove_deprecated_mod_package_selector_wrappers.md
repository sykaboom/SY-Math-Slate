# Task 484: Remove Deprecated Mod Package Selector Wrappers

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `selectors.ts`에 남아있는 deprecated mapped-mod wrapper API 2개를 제거하고 canonical selector만 유지한다.
- What must NOT change:
  - 활성 mod 선택 결과/toolbar 모드 매핑 결과는 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/index.ts` (필요 시 export 정리)

Out of scope:
- alias telemetry 동작 변경
- pack policy/merge logic 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core 내부 API 정리만 수행한다.
- Compatibility:
  - 외부 참조가 존재하면 먼저 canonical API로 교체 후 wrapper 제거.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - CW1
- Depends on tasks:
  - []
- Enables tasks:
  - []
- Parallel group:
  - G-cleanup-core
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 1~2
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~15min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
  - 다른 CW1 태스크와 병렬 가능
- Rationale:
  - low-risk API 정리 작업이며 파일 충돌이 거의 없다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `selectModPackageActivationToolbarModeMappedModId` 제거.
- [ ] AC-2: `selectActiveModPackageActivationToolbarModeMappedModId` 제거.
- [ ] AC-3: `scripts/check_layer_rules.sh` 통과.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` 통과.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "select(ModPackageActivationToolbarModeMappedModId|ActiveModPackageActivationToolbarModeMappedModId)" v10/src`
   - Expected result:
     - 검색 결과 0건
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
    - `scripts/check_layer_rules.sh`
   - Expected result:
    - PASS
   - Covers: AC-3

3) Step:
   - Command / click path:
    - `cd v10 && npm run lint && npm run build`
   - Expected result:
    - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 숨은 참조가 있을 경우 타입 오류 발생 가능.
- Roll-back:
  - wrapper 함수 복구 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors.ts`

Commands run (only if user asked or required by spec):
- `rg -n "select(ModPackageActivationToolbarModeMappedModId|ActiveModPackageActivationToolbarModeMappedModId)" v10/src`
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- `rg` returned 0 matches in `v10/src` (exit code 1 due to no matches).
- Deprecated wrappers removed from package selectors; canonical selectors unchanged.

Notes:
- Failure classification: no pre-existing failures observed in required gates; no newly introduced failures; blocking issues none.
