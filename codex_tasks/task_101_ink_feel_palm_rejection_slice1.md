# Task 101: Ink Feel + Palm Rejection Slice 1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - pen 입력 직후 touch 입력을 일정 시간 차단해 팜리젝션을 보강한다.
  - stroke smoothing threshold를 정리해 끊김/진동 체감을 줄인다.
  - `useCanvas`와 `useOverlayCanvas` 입력 규칙을 일관화한다.
- What must NOT change:
  - 저장 포맷(`StrokeItem`) 스키마 변경 금지.
  - 신규 dependency 추가 금지.
  - 레이아웃/UI 구조 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_101_ink_feel_palm_rejection_slice1.md`
- `v10/src/features/hooks/useCanvas.ts`
- `v10/src/features/hooks/useOverlayCanvas.ts`

Out of scope:
- `v10/src/features/layout/**`
- `v10/src/features/toolbar/**`
- `v10/src/core/**`

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox` (width / height / ratio label): N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints

- New dependencies allowed: NO
- Boundary rules:
  - 입력 제어는 hook 내부 상태/로직으로만 처리.
  - store 인터페이스 확장 금지.
- Compatibility:
  - 기존 pen/eraser/laser 툴 동작 의미 유지.

---

## Agent Assignment (execution planning)

- Execution mode: DELEGATED
- If delegated, chain scope:
  - `task_100` ~ `task_102`
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: N/A
  - Implementer-B: Ink hook worker
  - Implementer-C: N/A
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `useCanvas.ts`, `useOverlayCanvas.ts`는 단일 구현자 소유.

---

## Speculative Defense Check (guardrail)

- [x] Any defensive branches added: NO

---

## Documentation Update Check

- [x] Structure changes (file/folder add/move/delete):
  - N/A
- [x] Semantic / rule changes (layers, invariants, core flows):
  - 변경 없음 (`v10/AI_READ_ME.md` 업데이트 불필요)

---

## Acceptance Criteria (must be testable)

- [x] AC-1: pen 입력 직후 touch pointer로 인한 의도치 않은 stroke 생성이 차단된다.
- [x] AC-2: smoothing min-distance 처리로 미세 진동 구간에서 path 노이즈가 감소한다.
- [x] AC-3: `useCanvas`/`useOverlayCanvas` 입력 규칙이 동일 기준으로 적용된다.
- [x] AC-4: `cd v10 && npm run lint`에서 error 0.
- [x] AC-5: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

1) 코드 경로 확인:
   - Command / click path: `rg -n "pointerType|touch|pen|palm|minDistance|smoothing" v10/src/features/hooks/useCanvas.ts v10/src/features/hooks/useOverlayCanvas.ts`
   - Expected result: touch 차단 + smoothing 기준 코드 존재
   - Covers: AC-1, AC-2, AC-3

2) 품질/범위 확인:
   - Command / click path: `cd v10 && npm run lint`, `git status --short -- v10/src/features/hooks/useCanvas.ts v10/src/features/hooks/useOverlayCanvas.ts codex_tasks/task_101_ink_feel_palm_rejection_slice1.md`
   - Expected result: lint error 0, scope 내 변경
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes

- Risks:
  - 터치 차단 규칙이 과하면 손가락 입력 기반 사용성 저하 가능.
- Roll-back:
  - hook 2개 파일 revert로 즉시 복구 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_101_ink_feel_palm_rejection_slice1.md`
- `v10/src/features/hooks/useCanvas.ts`
- `v10/src/features/hooks/useOverlayCanvas.ts`

Commands run (only if user asked or required by spec):
- `sed -n '1,420p' v10/src/features/hooks/useCanvas.ts`
- `sed -n '1,420p' v10/src/features/hooks/useOverlayCanvas.ts`
- `rg -n "pointerType|touch|pen|palm|minDistance|smoothing" v10/src/features/hooks/useCanvas.ts v10/src/features/hooks/useOverlayCanvas.ts`
- `cd v10 && npm run lint`
- `cd v10 && npm run build` (escalated)
- `./scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS (`0 errors, 7 warnings`)
- Build:
  - PASS (escalated 실행)
- Script checks:
  - `scripts/check_layer_rules.sh` 미존재로 N/A
  - `./scripts/run_repo_verifications.sh` 실행 결과: `[verify-sh] No verification scripts matched.`

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warning 7건 (본 태스크 범위 외 기존 경고 포함)
- Newly introduced failures:
  - 없음
- Blocking:
  - 없음
- Mitigation:
  - N/A

Manual verification notes:
- `TOUCH_PALM_REJECTION_MS=520ms`로 pen 직후 touch 입력 억제 추가.
- `getMinDistanceForPointer`로 touch/pen 기준 분리.
- `useCanvas`/`useOverlayCanvas` 동일 규칙으로 동기화 완료.

Notes:
- 본 태스크는 필기감/오입력 감소를 위한 입력 엔진 소배치다.
