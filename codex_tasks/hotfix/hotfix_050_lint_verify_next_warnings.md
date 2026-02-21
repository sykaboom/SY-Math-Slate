# Hotfix 2026-02-15: Lint Warnings + Verification Bottleneck + Next Build Warnings

**Status:** COMPLETED  
**Context:** 사용자 요청으로 3개 핫픽스를 한 번에 처리:
1) 기존 lint warning 2건 제거  
2) 검증 경량화(변경 파일 lint 중심 + 필요 시 full build)  
3) Next build 경고(`workspace root`, `MODULE_TYPELESS_PACKAGE_JSON`) 제거

## Hotfix Approval
- Explicit user hotfix approval quote:
  - "좋아 3 개 한 번에 핫픽스해."

## Scope (Exact Files)
- `v10/src/features/editor/animation/plan/compileAnimationPlan.ts`
- `v10/src/features/editor/canvas/actors/ChalkActor.tsx`
- `scripts/check_v10_changed_lint.sh` (new)
- `v10/next.config.ts`
- `v10/package.json`
- `codex_tasks/hotfix/hotfix_050_lint_verify_next_warnings.md`

## Changes
- Lint warning #1 제거:
  - `compileAnimationPlan`의 미사용 파라미터 `_sourceHtml`을 `sourceHtml`로 교체하고 `void sourceHtml;` 처리.
- Lint warning #2 제거:
  - `ChalkActor`의 미사용 prop `_isMoving`을 `isMoving`으로 연결하고 `data-moving` 속성에 반영.
- 검증 경량화 스크립트 추가:
  - `scripts/check_v10_changed_lint.sh` 신설.
  - 기본값: 변경된 `v10/**` JS/TS 파일에 대해서만 lint 수행.
  - `VERIFY_LINT_SCOPE=full` 설정 시 전체 lint 수행.
  - `VERIFY_FULL_BUILD=1` 설정 시 full build 추가 수행(웨이브 종료 게이트 용도).
  - 기존 `scripts/run_repo_verifications.sh`는 `check_*.sh` 자동 실행 구조이므로 새 스크립트를 자동 포함.
- Next build 경고 제거:
  - `v10/next.config.ts`에 `turbopack.root: process.cwd()` 추가.
  - `v10/package.json`에 `"type": "module"` 추가.

## Commands Run
- `chmod +x scripts/check_v10_changed_lint.sh`
- `scripts/check_v10_changed_lint.sh`
- `VERIFY_FULL_BUILD=1 scripts/check_v10_changed_lint.sh`
- `bash scripts/run_repo_verifications.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Manual Verification Notes
- `npm run lint`: 기존 warning 2건 모두 해소(0 warning).
- `npm run build`: 이전의 root/module-type 경고 미출력 확인.
- `scripts/run_repo_verifications.sh`: 새 `check_v10_changed_lint.sh` 포함 PASS.
- 경량/풀 검증 모드:
  - 경량: `scripts/check_v10_changed_lint.sh`
  - 웨이브 종료: `VERIFY_LINT_SCOPE=full VERIFY_FULL_BUILD=1 scripts/check_v10_changed_lint.sh`
