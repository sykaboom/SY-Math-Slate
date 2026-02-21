# Task 388: Phase 6 Gate Closeout

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Phase 6 Gate Closeout를 P6 단계에서 실행 가능한 단위로 구현한다.
- What must NOT change:
  - 본 태스크 범위를 벗어난 기능 추가/리팩토링을 금지한다.

---

## Scope (Base Required)

Touched files/directories:
- v10/src/core/session-policy, v10/src/features/viewer, v10/src/core/trust

Out of scope:
- 새 AI 파이프라인

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Follow scripts/check_layer_rules.sh and scripts/check_mod_contract.sh.
  - No direct mod or package import from layout internals except designated bridge.
- Compatibility:
  - 승인된 정책 컷오버 외의 동작 호환성 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - P6
- Depends on tasks:
  - ['task_386','task_387']
- Enables tasks:
  - ['task_389']
- Parallel group:
  - G-P6-CLOSE
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3 to 9
- Files shared with other PENDING tasks:
  - AppLayout, FloatingToolbar, panelAdapters, registry/store hotspots when applicable
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - about 25 to 45min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, one-file-one-owner lock mandatory.
- Rationale:
  - 임계 파일은 직렬로, 독립 파일은 병렬로 처리해 속도와 안정성을 함께 확보.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO
- If YES, fill all items:
  - [ ] SVG path in design_drafts/
  - [ ] SVG has explicit viewBox
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded
  - [ ] Codex verified SVG exists

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - Run node scripts/gen_ai_read_me_map.mjs
    - Verify v10/AI_READ_ME_MAP.md
  - [ ] Semantic/rule changes:
    - Verify v10/AI_READ_ME.md

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: P6 공유/접근 정책이 회귀 없이 닫힘
- [ ] AC-2: viewer E2E matrix 통과
- [ ] AC-3: P7 진입 조건 문서화

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - viewer share e2e matrix 재실행
   - Expected result:
     - AC-1, AC-2 만족
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - cd v10 && npm run lint && npm run build
   - Expected result:
     - AC-3 만족 및 회귀 없음
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 접근 정책 회귀
- Roll-back:
  - P6 커밋 묶음 revert

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - (file / command / reason)
- Newly introduced failures:
  - (file / command / reason)
- Blocking or non-blocking:
  - BLOCKING | NON-BLOCKING
