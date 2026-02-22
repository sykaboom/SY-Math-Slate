# Cleanup Bundle Dispatch Plan — 2026-02-22

## Scope
- task_482 ~ task_487
- Objective: dead definition 제거 + 중복 계산/중복 로직 축소 + 레거시 shim 정리

## Wave Plan

### Wave CW1 (parallel)
- `task_484` (selectors.ts 전담 정리)
- `task_485` (fullscreen helper 단일화)
- `task_486` (toolbar step metrics helper 단일화)
- `task_487` (core/math shim 제거)

Notes:
- `task_484`는 `selectors.ts` 파일 단독 소유로 실행한다.
- `task_485`와 `task_486`는 toolbar 파일 잠금 충돌 가능성이 있으므로 동시에 돌릴 경우 file ownership lock 엄격 적용.
- 충돌 회피 우선이면 CW1을 `484+487` 먼저, 이후 `485` -> `486` 순차 권장.

### Wave CW2 (serial)
- `task_482` (dead dock action prune)

### Wave CW3 (serial)
- `task_483` (toolbar base definition SSOT 통합)

## Critical Path
- `task_482 -> task_483`

## File Lock Policy (Mandatory)
- `selectors.ts`:
  - `task_484` 전용 수정 파일로 고정.
  - `task_482`, `task_483`은 selectors 수정 금지.
- `base-education/modules.ts`, `base-education/manifest.ts`:
  - `task_482 -> task_483` 직렬 잠금.
- toolbar files:
  - `task_485`, `task_486` 동시 실행 금지(또는 file owner lock 1인 강제).

## Expected Duration (rough)
- Serial: ~160 min
- Batch (safe parallel): ~105 min
- Time saved: ~34%

## Verification Policy
- CW1 완료 후 `scripts/check_layer_rules.sh` + `cd v10 && npm run lint && npm run build`
- CW3 완료 후 `cd v10 && npm run lint && npm run build`
- Structural/boundary sanity:
  - `scripts/check_layer_rules.sh`
- Structure-changed tasks (`483`, `485`, `486`, `487`) 완료 시:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md`/`v10/AI_READ_ME.md` 동기화 확인
