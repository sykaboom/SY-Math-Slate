# Task 482: Prune Dead Canvas Dock Actions from Base Pack

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `base-education` pack에 정의되어 있으나 런타임에서 소비되지 않는 `canvas.dock.left|center|right` 액션 정의를 제거한다.
  - pack/manifest/action-source 간 불필요 정의를 정리해 정책-실행 불일치를 줄인다.
- What must NOT change:
  - 기존 툴바 모드 전환, fullscreen/sound, draw/playback/canvas 동작은 변경하지 않는다.
  - 새로운 도킹 기능을 추가하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/packs/base-education/modules.ts`
- `v10/src/mod/packs/base-education/manifest.ts`

Out of scope:
- 도킹 런타임 신규 구현
- AppLayout/Toolbar UI 구조 변경
- 패키지 merge engine 로직 변경
- `v10/src/core/runtime/modding/package/selectors.ts` 수정 (selectors 정리는 별도 task 전담)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - pack 정의 정리 범위만 수행한다.
  - `core -> features` 신규 import 금지.
  - `selectors.ts`는 본 태스크에서 수정 금지.
- Compatibility:
  - 기존 `base-education` pack 활성화 시 UI/행동 동등성을 유지한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - CW1
- Depends on tasks:
  - []
- Enables tasks:
  - [`task_483`]
- Parallel group:
  - G-cleanup-policy
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2~3
- Files shared with other PENDING tasks:
  - `v10/src/mod/packs/base-education/modules.ts`
  - `v10/src/mod/packs/base-education/manifest.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
  - `task_483`보다 먼저 수행 필요(같은 파일 잠금)
- Rationale:
  - 정책 dead-definition 정리는 파일 잠금 충돌 가능성이 높아 단일 실행이 안전하다.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `canvas.dock.left|center|right` 문자열이 `modules.ts`, `manifest.ts`에서 제거된다.
- [ ] AC-2: `v10/src/**` 전체에서 `canvas.dock.left|center|right` 참조가 `0건`이다.
- [ ] AC-3: `selectors.ts` 파일은 본 태스크에서 변경되지 않는다.
- [ ] AC-4: `scripts/check_layer_rules.sh` 통과.
- [ ] AC-5: `cd v10 && npm run lint && npm run build` 통과.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "canvas\.dock\.(left|center|right)" v10/src/mod/packs/base-education`
   - Expected result:
     - 검색 결과 0건
   - Covers: AC-1

2) Step:
   - Command / click path:
    - `rg -n "canvas\.dock\.(left|center|right)" v10/src`
   - Expected result:
    - 검색 결과 0건
   - Covers: AC-2

3) Step:
   - Command / click path:
    - `git diff --name-only -- v10/src/core/runtime/modding/package/selectors.ts`
   - Expected result:
    - 출력 없음
   - Covers: AC-3

4) Step:
   - Command / click path:
    - `scripts/check_layer_rules.sh`
   - Expected result:
    - PASS
   - Covers: AC-4

5) Step:
   - Command / click path:
    - `cd v10 && npm run lint && npm run build`
   - Expected result:
    - PASS
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 삭제 대상이 숨은 경로에서 사용 중이면 버튼 누락/런타임 경고가 발생할 수 있다.
- Roll-back:
  - 2개 파일 변경 revert 후 재실행.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/mod/packs/base-education/modules.ts`
- `v10/src/mod/packs/base-education/manifest.ts`
- `codex_tasks/task_482_prune_dead_canvas_dock_actions.md` (closeout section)

Commands run (only if user asked or required by spec):
- `rg -n "canvas\.dock\.(left|center|right)" v10/src/mod/packs/base-education v10/src` (exit 1, no matches)
- `scripts/check_layer_rules.sh` (PASS)
- `cd v10 && npm run lint && npm run build`
  - first attempt: lint PASS, build blocked by external `.next/lock`
  - second attempt: lint PASS, build PASS
- `git diff --name-only -- v10/src/core/runtime/modding/package/selectors.ts` (path listed; existing unrelated workspace modification)

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS (after retry once lock cleared)
- Script checks:
  - PASS (`check_layer_rules`)

Manual verification notes:
- AC-1/AC-2: `canvas.dock.left|center|right` references are removed (`rg` returned no matches across base-education and `v10/src`).
- AC-3: `selectors.ts` was not edited in this task; command output indicates the file already has unrelated workspace modifications by another agent.
- AC-4/AC-5: required script/lint/build gates passed.

Notes:
- Newly introduced failures: none observed.
- Pre-existing/external transient failure: first build attempt failed on `.next/lock` due concurrent `next build`; non-blocking after retry.
