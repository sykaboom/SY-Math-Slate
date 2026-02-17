# Task 270: Design Token Neon/Swatch 통합 (Phase 2)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - `neon-*`/`swatch-*` 중복 색상 정의를 하나의 정식 계층으로 통합한다.
  - 권장 정식 계층은 `swatch-*`로 고정하고, `neon-*`는 제거 또는 임시 alias로 축소한다.
- What must NOT change:
  - 사용자에게 보이는 컬러 결과 변화 금지.
  - 기능/UI 구조 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/app/globals.css` (read/write)
- `v10/tailwind.config.ts` (read/write, 필요 시)
- `v10/src/**` (read/write: 토큰 이름 치환이 필요한 파일에 한함)

Out of scope:
- 새로운 테마 프리셋 추가
- Feature CSS 모듈 분리

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 색상 값의 시각 결과를 바꾸지 않고 이름만 정리.
  - alias 기간을 두는 경우 sunset 조건을 명시.
- Compatibility:
  - 기존 클래스/토큰 참조가 깨지지 않아야 함.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3
- Depends on tasks: [task_269]
- Enables tasks: [task_271]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2~N
- Files shared with other PENDING tasks: `v10/src/app/globals.css`
- Cross-module dependency: YES (token consumers 다수)
- Parallelizable sub-units: 1
- Estimated single-agent duration: ~30min
- Recommended mode: MANUAL
- Batch-eligible: NO
  - 토큰 리네이밍은 전역 영향도가 높아 일괄 검증이 필요.
- Rationale:
  - 전역 토큰 변경은 file conflict + 회귀 위험이 커서 단일 파이프라인 처리 권장.

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
  - [ ] Structure changes (file/folder add/move/delete):
    - 구조 변경 없으면 AI_READ_ME_MAP 업데이트 불필요
  - [ ] Semantic/rule changes:
    - 토큰 표준(`swatch` 정식화) 변경 시 `v10/AI_READ_ME.md` 반영

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `globals.css`에서 중복 정의된 `neon-*`/`swatch-*`가 단일 체계로 통합됨.
- [ ] AC-2: 선택된 정식 체계 외 이름은 alias 최소화 또는 제거됨.
- [ ] AC-3: 색상 시각 결과가 유지됨(리디자인 없음).
- [ ] AC-4: `cd v10 && npm run lint` 통과
- [ ] AC-5: `cd v10 && npm run build` 통과
- [ ] AC-6: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 토큰 중복 제거 확인
   - Command / click path: `rg -n "neon-|swatch-" v10/src/app/globals.css`
   - Expected result: 중복 정의가 정리되어 표준 체계로 수렴
   - Covers: AC-1, AC-2

2) Step: 참조 일관성 확인
   - Command / click path: `rg -n "neon-|swatch-" v10/src`
   - Expected result: 참조가 의도한 표준 체계 기준으로 정렬
   - Covers: AC-2, AC-3

3) Step: 게이트 실행
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-4, AC-5

4) Step: 종합 스크립트 게이트
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 토큰 alias 제거 타이밍이 빠르면 기존 참조가 깨질 수 있음.
- Roll-back:
  - alias 유지 상태로 즉시 되돌리거나 commit revert.

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
- task_267를 phase 분할한 2단계 실행 스펙.
