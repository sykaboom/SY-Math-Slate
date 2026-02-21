# Task 381: Theme Runtime and Token Order

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - Theme Runtime and Token Order를 P5 단계에서 실행 가능한 단위로 구현한다.
- What must NOT change:
  - 본 태스크 범위를 벗어난 기능 추가/리팩토링을 금지한다.

---

## Scope (Base Required)

Touched files/directories:
- v10/src/core/theme, v10/src/features/theme, v10/src/features/store

Out of scope:
- 세션/공유 변경

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
  - P5
- Depends on tasks:
  - ['task_380']
- Enables tasks:
  - ['task_382','task_383']
- Parallel group:
  - G-P5-THEME
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - mid

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
  - DELEGATED
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

- [ ] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - current task only
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: subagent
  - Implementer-B: subagent
  - Implementer-C: subagent
  - Reviewer+Verifier: subagent
- File ownership lock plan:
  - one file, one implementer
- Parallel slot plan:
  - up to 6 active slots
- Scheduler plan:
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule:
    - critical-path-first with file-conflict-avoidance
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 3 implementers + 2 verifiers + 1 overflow
  - Ready-queue refill trigger:
    - on task completion or blocker resolution
  - Agent close/reuse policy:
    - close completed agents immediately and refill
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 180s
    - Long-running exceptions:
      - lint/build/test tasks may exceed threshold
  - Reassignment safety rule:
    - reassign only after no-output timeout and no shared-file lock conflict
- Delegated closeout metrics:
  - Peak active slots: TBD
  - Average active slots: TBD
  - Slot refill count: TBD
  - Reassignment count: TBD

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

- [ ] AC-1: global/module/preferences theme 상태 분리
- [ ] AC-2: token resolution order 고정
- [ ] AC-3: 기존 preset parity 유지

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - preset 전환 후 새로고침 유지 확인
   - Expected result:
     - AC-1, AC-2 만족
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - cd v10 && npm run lint
   - Expected result:
     - AC-3 만족 및 회귀 없음
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 토큰 우선순위 꼬임
- Roll-back:
  - theme runtime 변경분 revert

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
