# Task 271: Feature CSS Scope 분리 + 문서 동기화 (Phase 3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - `globals.css`에 섞인 feature-specific CSS(`mjx`, `.hl-*`, `.tw-*`, `.force-break`, `.prompter-glass` 등)를 기능별 파일로 분리한다.
  - globals는 토큰/리셋 중심으로 축소한다.
  - 분리 구조를 `AI_READ_ME.md`와 `AI_READ_ME_MAP.md`에 동기화한다.
- What must NOT change:
  - 기능 동작/시각 결과 변경 금지(리디자인 아님).
  - 레이어 경계 위반 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/app/globals.css` (read/write)
- `v10/src/features/**` (read/write; feature CSS 파일 생성/이관)
- `v10/src/**` (read/write; CSS import wiring)
- `v10/AI_READ_ME.md` (read/write)
- `v10/AI_READ_ME_MAP.md` (generated update)

Out of scope:
- 신규 테마 토큰 설계
- 컴포넌트 API 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 기능별 CSS는 해당 feature 경로에서 소유.
  - globals.css는 공통 토큰 + 리셋 + 앱 전역 최소 규칙만 유지.
- Compatibility:
  - 기존 렌더링/상호작용 회귀 금지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W4
- Depends on tasks: [task_270]
- Enables tasks: []
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 4~N
- Files shared with other PENDING tasks: `v10/src/app/globals.css`
- Cross-module dependency: YES (canvas/layout/prompter styles)
- Parallelizable sub-units: 1
- Estimated single-agent duration: ~45-60min
- Recommended mode: MANUAL
- Batch-eligible: NO
  - import order/우선순위 검증이 필요하여 순차 처리 권장.
- Rationale:
  - 스타일 이관 + 문서/맵 동기화까지 포함된 단일 마이그레이션 성격.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - `node scripts/gen_ai_read_me_map.mjs` 실행
    - `v10/AI_READ_ME_MAP.md` 변경 확인
  - [ ] Semantic/rule changes:
    - `v10/AI_READ_ME.md`에 CSS ownership 규칙 반영 (deferred: file lock by `task_277`)

---

## Acceptance Criteria (Base Required)

- [x] AC-1: globals.css에서 feature-specific selector가 제거/이관됨.
- [x] AC-2: 생성된 feature CSS 파일이 각 기능 경로에 위치함.
- [x] AC-3: 이관된 CSS가 올바른 import 경로로 로드됨.
- [x] AC-4: `node scripts/gen_ai_read_me_map.mjs` 실행 후 맵이 구조와 일치.
- [ ] AC-5: `cd v10 && npm run lint` 통과 (deferred by user constraint: do not run full lint yet)
- [ ] AC-6: `cd v10 && npm run build` 통과 (deferred by user constraint: do not run full build yet)
- [ ] AC-7: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` 통과 (deferred with AC-5/AC-6)

---

## Manual Verification Steps (Base Required)

1) Step: globals feature selector 잔존 확인
   - Command / click path: `rg -n "mjx-container|\\.hl-|\\.tw-char|\\.force-break|\\.prompter-glass" v10/src/app/globals.css`
   - Expected result: 0건 또는 의도된 최소 공통 규칙만 잔존
   - Covers: AC-1

2) Step: feature CSS 파일 존재/위치 확인
   - Command / click path: `rg --files v10/src/features | rg "\\.css$"`
   - Expected result: 이관 파일들이 feature 경로에 존재
   - Covers: AC-2, AC-3

3) Step: 문서 맵 재생성
   - Command / click path: `node scripts/gen_ai_read_me_map.mjs`
   - Expected result: `v10/AI_READ_ME_MAP.md`가 현재 구조로 갱신
   - Covers: AC-4

4) Step: 게이트 실행
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-5, AC-6

5) Step: 종합 스크립트 게이트
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - import 순서 변경으로 CSS 우선순위 역전 가능.
- Roll-back:
  - globals.css 및 신규 feature CSS 파일 단위 revert + 맵 재생성.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/app/globals.css`
- `v10/src/app/layout.tsx`
- `v10/src/features/canvas/styles/content-layer.css` (new)
- `v10/src/features/canvas/styles/mathjax.css` (new)
- `v10/src/features/animation/styles/rich-text-animation.css` (new)
- `v10/src/features/layout/styles/prompter.css` (new)
- `v10/AI_READ_ME_MAP.md` (generated)
- `codex_tasks/task_271_feature_css_scope_split_and_docs.md`

Commands run (only if user asked or required by spec):
- `rg -n "mjx-container|\\.hl-|\\.tw-char|\\.force-break|\\.prompter-glass" v10/src/app/globals.css`
  - result: no matches (feature selectors removed from globals)
- `rg --files v10/src/features | rg "\\.css$" | sort`
  - result:
    - `v10/src/features/animation/styles/rich-text-animation.css`
    - `v10/src/features/canvas/styles/content-layer.css`
    - `v10/src/features/canvas/styles/mathjax.css`
    - `v10/src/features/layout/styles/prompter.css`
- `rg -n "features/.+\\.css" v10/src/app/layout.tsx`
  - result: 4 imports added (content-layer, mathjax, rich-text-animation, prompter)
- `node scripts/gen_ai_read_me_map.mjs`
  - result: `Wrote v10/AI_READ_ME_MAP.md`
- `rg -n "mjx-container|\\.hl-yellow|\\.hl-cyan|\\.tw-char|\\.force-break|\\.prompter-glass|\\.text-layer|\\.text-item|\\.step-label|\\.break-label" v10/src/features/*/styles/*.css`
  - result: moved selectors verified in feature-owned CSS files
- `bash scripts/check_layer_rules.sh`
  - result: `[check_layer_rules] PASS (no layer violations)`

## Gate Results (Codex fills)

- Lint:
  - SKIPPED (explicit user constraint: do not run full lint yet)
- Build:
  - SKIPPED (explicit user constraint: do not run full build yet)
- Script checks:
  - PASS: `node scripts/gen_ai_read_me_map.mjs`
  - PASS: task-local grep checks
  - PASS: `bash scripts/check_layer_rules.sh`

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Unknown (full lint/build/repo verification intentionally not run in this slice)
- Newly introduced failures:
  - None observed in executed checks
- Blocking:
  - None for this slice
- Mitigation:
  - Defer full-gate run (`lint`, `build`, `VERIFY_STAGE=end`) to orchestrator follow-up window

Manual verification notes:
- Step 1 (globals feature selector 잔존 확인): PASS (no matches in `v10/src/app/globals.css`)
- Step 2 (feature CSS 파일 존재/위치 확인): PASS (4 feature CSS files present under `v10/src/features/**`)
- Step 3 (문서 맵 재생성): PASS (`node scripts/gen_ai_read_me_map.mjs` wrote `v10/AI_READ_ME_MAP.md`)
- Step 4/5 (full gate + 종합 스크립트 게이트): DEFERRED by user instruction for this run

Notes:
- task_267를 phase 분할한 3단계 실행 스펙.
- `v10/AI_READ_ME.md` semantic update deferred 항목은 `task_277` 완료 후 오케스트레이터가 반영 완료.
