# Task 476: BaseProvider Injection and Boundary Lock

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - Host 하드코딩 정의(`toolbarModePolicy`, `toolbarActionCatalog`, `toolbarSurfacePolicy`)를 BaseProvider 입력 계층으로 승격한다.
  - Core 런타임이 feature 경로를 import하지 않도록 injection 경로를 고정한다.
- What must NOT change:
  - 사용자 기능/레이아웃 동작 회귀 금지
  - 아직 pack-first 완전 전환(정책 우선순위 재해석)은 본 태스크에서 수행하지 않음

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/registry.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/eslint.config.mjs`

Out of scope:
- merge engine 고도화
- alias telemetry

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `@core/runtime/**`에서 `@features/**` import 금지
  - BaseProvider 등록은 feature bootstrap에서 수행
- Compatibility:
  - provider 미등록 시 기존 기본 정책으로 fallback 가능해야 함

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W476
- Depends on tasks:
  - ['task_475']
- Enables tasks:
  - ['task_477', 'task_478']
- Parallel group:
  - G-provider-boundary
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - `FloatingToolbar.tsx`, toolbar catalog/policy files
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~60min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 경계 규칙과 핵심 toolbar 경로를 동시에 변경하므로 단일 소유 구현이 안전함.

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
  - 필요 시 `node scripts/gen_ai_read_me_map.mjs`
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` 경계/toolbar SSOT 갱신 검토

---

## Acceptance Criteria (Base Required)

- [x] AC-1: BaseProvider 입력 모델이 정의되고 host 하드코딩은 provider 경유로만 사용된다.
- [x] AC-2: `core/runtime` -> `features` import 0건.
- [x] AC-3: eslint 경계 규칙 위반 시 CI/검증에서 fail된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "from ['\"][^'\"]*(@features/|features/)" v10/src/core/runtime`
   - Expected result:
     - 결과 0건
   - Covers: AC-2

2) Step:
   - Command / click path:
     - `rg -n "no-restricted-imports|restricted" v10/eslint.config.mjs`
   - Expected result:
     - core->features 차단 규칙 존재
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - provider 초기화 누락 시 toolbar plan 생성 실패 가능.
- Roll-back:
  - provider fallback 경로 유지 + 커밋 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/registry.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/eslint.config.mjs`

Commands run (only if user asked or required by spec):
- `rg -n "from ['\"][^'\"]*(@features/|features/)" v10/src/core/runtime` (PASS; 0 matches)
- `rg -n "no-restricted-imports|restricted" v10/eslint.config.mjs` (PASS; restriction rules present)
- `cd v10 && npm run lint` (PASS)
- `cd v10 && npm run build` (PASS)
- `./scripts/check_layer_rules.sh` (PASS)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`rg -n "from ['\"][^'\"]*(@features/|features/)" v10/src/core/runtime` => 0 matches)
  - PASS (`rg -n "no-restricted-imports|restricted" v10/eslint.config.mjs` => rules present)
  - PASS (`./scripts/check_layer_rules.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
