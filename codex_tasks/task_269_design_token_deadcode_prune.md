# Task 269: Design Token Dead-Code Prune (Phase 1)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - `globals.css`에서 실제로 사용되지 않는 디자인 토큰(dead code)만 제거한다.
  - 1차 대상: `chalk-*`, `sidebar-*`, `chart-*`, 중복/재할당된 레거시 폴백 토큰 블록.
- What must NOT change:
  - 시각적 리디자인 금지 (토큰 정리만 수행).
  - 컴포넌트/기능 로직 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/app/globals.css` (read/write)
- `v10/tailwind.config.ts` (read)
- `v10/src/` (read-only 참조 검색)

Out of scope:
- 토큰 네이밍 체계 재설계
- Feature CSS 분리 작업

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 삭제 전 코드베이스 참조 검색으로 미사용 여부 확인.
  - 활성 토큰(`--theme-*`, `--toolbar-*`, shadcn 기본 토큰) 훼손 금지.
- Compatibility:
  - 빌드/런타임 시각 회귀가 없어야 함.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W2
- Depends on tasks: [task_266, task_268]
- Enables tasks: [task_270]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 1 (주요 write)
- Files shared with other PENDING tasks: `v10/src/app/globals.css`
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~20min
- Recommended mode: MANUAL
- Batch-eligible: NO
  - 이후 토큰 통합(task_270)과 동일 파일 충돌.
- Rationale:
  - 단일 파일 정리 작업이며 후속 태스크와 순차 의존이 강함.

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

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `globals.css`에 `chalk-` 토큰 정의가 0건이다.
- [ ] AC-2: `globals.css`에 `sidebar-` 토큰 정의가 0건이다.
- [ ] AC-3: `globals.css`에 `chart-` 토큰 정의가 0건이다.
- [ ] AC-4: 제거된 토큰이 코드베이스에서 참조되지 않는다.
- [ ] AC-5: `cd v10 && npm run lint` 통과
- [ ] AC-6: `cd v10 && npm run build` 통과
- [ ] AC-7: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 토큰 제거 확인
   - Command / click path: `rg -n "chalk-|sidebar-|chart-" v10/src/app/globals.css`
   - Expected result: 검색 결과 0건
   - Covers: AC-1, AC-2, AC-3

2) Step: 참조 누락 확인
   - Command / click path: `rg -n "chalk-|sidebar-|chart-" v10/src`
   - Expected result: 런타임 참조 없음(또는 제거 정리 완료)
   - Covers: AC-4

3) Step: 게이트 실행
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-5, AC-6

4) Step: 종합 스크립트 게이트
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 숨은 참조 토큰을 삭제하면 일부 스타일 누락 가능.
- Roll-back:
  - `git revert <commit>` 또는 `globals.css` 단일 revert.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - N/A
- Mitigation:
  - N/A

Manual verification notes:
- N/A

Notes:
- task_267를 phase 분할한 1단계 실행 스펙.
