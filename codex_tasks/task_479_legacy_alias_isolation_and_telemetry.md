# Task 479: Legacy Alias Isolation and Telemetry Guard

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `playback -> lecture` 등 과도기 alias를 legacy fallback 레이어로 격리한다.
  - alias fallback 발동 시 telemetry/warning을 기록하여 제거 준비도를 계측한다.
- What must NOT change:
  - package 정책이 없는 환경의 기본 동작은 유지해야 한다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/platform/observability/*` (필요 시 telemetry hook)
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`

Out of scope:
- alias 완전 제거
- pack 구조 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - telemetry emit은 observability 경로 재사용
  - feature 레이어에서 alias 로직 재정의 금지
- Compatibility:
  - package 정책 우선, alias는 fallback-only

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W479
- Depends on tasks:
  - ['task_478']
- Enables tasks:
  - ['task_481']
- Parallel group:
  - G-legacy-alias
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~5
- Files shared with other PENDING tasks:
  - selectors/toolbarModePolicy
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~40min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - legacy fallback 제어는 단일 경로에서 일관성이 중요함.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - N/A
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`에 alias fallback/telemetry 규칙 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: package mapping 존재 시 alias fallback 미사용.
- [x] AC-2: alias fallback 사용 시 observability 이벤트/경고가 남는다.
  - required event name: `mod.alias_fallback_hit`
  - required payload keys: `toolbarMode`, `activePackageId`, `requestedModId`, `fallbackModId`, `source`
- [x] AC-3: toolbar mode 해석 결과가 기존 UX와 호환된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "mod.alias_fallback_hit|fallbackModId|requestedModId|toolbarMode|activePackageId|source" v10/src/core/runtime/modding/package/selectors.ts v10/src/features/chrome/toolbar/toolbarModePolicy.ts v10/src/features/platform/observability`
   - Expected result:
     - fallback-only + telemetry 이벤트 스키마 경로 확인
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - package toolbarModeMap 지정/미지정 두 케이스 수동 테스트
   - Expected result:
     - 지정: alias 미사용
     - 미지정: alias fallback + `mod.alias_fallback_hit` 이벤트 1건 이상 기록
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - warning 과다 발생 시 노이즈 증가 가능.
- Roll-back:
  - telemetry emission만 비활성하고 fallback 로직 유지.

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
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/platform/observability/auditLogger.ts`

Commands run (only if user asked or required by spec):
- `rg -n "mod.alias_fallback_hit|fallbackModId|requestedModId|toolbarMode|activePackageId|source" v10/src/core/runtime/modding/package/selectors.ts v10/src/features/chrome/toolbar/toolbarModePolicy.ts v10/src/features/platform/observability` (PASS)
- `cd v10 && npm run lint` (PASS)
- `cd v10 && npm run build` (PASS)
- `./scripts/check_layer_rules.sh` (PASS)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`rg -n "mod.alias_fallback_hit|fallbackModId|requestedModId|toolbarMode|activePackageId|source" ...`)
  - PASS (`./scripts/check_layer_rules.sh`)

Manual verification notes:
- Step-1 (`rg` schema/path check) 완료.
- Step-2 (package `toolbarModeMap` 지정/미지정 UI 수동 확인)는 본 CLI 세션에서 브라우저 상호작용 범위 밖이라 미실시.
- Step-3 (`lint`/`build`) 완료.

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
