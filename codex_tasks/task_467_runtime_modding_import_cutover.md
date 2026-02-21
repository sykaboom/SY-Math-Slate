# Task 467: Runtime Modding Import Cutover

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `v10/src/**` 전체에서 `@core/mod/*` import를 `@core/runtime/modding/*`로 전환한다.
  - scripts/tests의 경로 검사 규칙을 신규 경로 기준으로 전환한다.
- What must NOT change:
  - 기능 동작 변경 금지
  - `core/mod` compat shim 제거 금지 (제거는 task_471)

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/**` (import path rewrite)
- `scripts/check_mod_contract.sh`
- `scripts/check_core_mod_boundary.sh`
- `v10/eslint.config.mjs`
- `v10/tests/**` (경로 assertion 변경 필요 시)

Out of scope:
- `features` 물리 이동
- `core/mod` 삭제

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - deep import 금지 (`@core/runtime/modding/*/internal` 등)
- Compatibility:
  - cutover 후에도 compat shim은 잔존시켜 rollback 통로 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W467
- Depends on tasks:
  - ['task_466']
- Enables tasks:
  - `task_468`
- Parallel group:
  - G-import-cutover
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 40+
- Files shared with other PENDING tasks:
  - `scripts/check_mod_contract.sh`, `v10/eslint.config.mjs`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 3
- Estimated single-agent duration:
  - ~45min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - src/scripts/tests 분할 처리 가능하나 최종 verifier 1회 필수.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Assigned roles:
    - Implementer-A: src import cutover
    - Implementer-B: scripts/tests/eslint cutover
    - Reviewer+Verifier: lint/build/check_mod_contract

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - `node scripts/gen_ai_read_me_map.mjs --check`
  - [ ] Semantic/rule changes:
    - `v10/AI_READ_ME.md` 경로 설명 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `rg -n "@core/mod" v10/src` 결과가 compat shim 파일/문서 외 0건.
- [x] AC-2: mod boundary/script checks가 신규 경로 기준으로 PASS.
- [x] AC-3: `npm run lint` + `npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "@core/mod" v10/src`
   - Expected result:
     - compat 위치 외 참조 없음
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && bash scripts/check_core_mod_boundary.sh`
   - Expected result:
     - PASS
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 대량 경로 치환 중 누락/오치환
- Roll-back:
  - import rewrite 커밋 revert + compat 경로로 즉시 복귀

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Closeout (2026-02-21)

- Result:
  - `@core/mod/*` import usage was cut over to `@core/runtime/modding/*` across runtime code.
  - boundary/lint checks were updated to runtime modding namespace.
- Commands run:
  - `bash scripts/check_mod_contract.sh`
  - `bash scripts/check_core_mod_boundary.sh`
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`
- Verification:
  - PASS
