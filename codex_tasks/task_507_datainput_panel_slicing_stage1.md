# Task 507: DataInputPanel Slicing Stage 1 (section/component split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `DataInputPanel.tsx`의 섹션별 UI/로직을 분리해 component + hook 단위로 재구성한다.
  - 대형 단일 컴포넌트(1264 lines) 변경 충돌 위험을 줄인다.
- What must NOT change:
  - DataInput 기능/단축키/저장 동작 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/layout/data-input/DataInputHeader.tsx` (new)
- `v10/src/features/chrome/layout/data-input/DataInputActions.tsx` (new)
- `v10/src/features/chrome/layout/data-input/DataInputBody.tsx` (new)
- `v10/src/features/chrome/layout/data-input/useDataInputPanelRuntime.ts` (new)
- `v10/src/features/chrome/layout/data-input/index.ts` (new)
- `codex_tasks/task_507_datainput_panel_slicing_stage1.md`

Out of scope:
- schema 구조 변경
- LLM data input API 변경
- panel policy 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `features/chrome/layout/data-input/*` 하위로만 분해.
  - core/runtime 직접 import 추가 금지.
- Compatibility:
  - 기존 DataInput open/close/submit 흐름 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-DATAINPUT
- Depends on tasks:
  - `task_503`
- Enables tasks:
  - `task_508`
- Parallel group:
  - G-P6-SLICE-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - `~60min`
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES (task_504와 병렬 가능)
- Rationale:
  - 대형 단일 컴포넌트 분해로 내부 충돌 관리가 중요.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - DataInputPanel 분해 및 조립
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: runtime extraction
    - Implementer-B: presentational component split
    - Implementer-C: integration
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - `DataInputPanel.tsx` 단일 오너 잠금
  - Parallel slot plan:
    - max 3 slots
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - largest-risk-first
    - Requested orchestration mode:
      - max orchestration mode off (default)
    - Initial slot split:
      - 2 implementers + 1 verifier
    - Ready-queue refill trigger:
      - runtime 추출 완료 후 component split 투입
    - Agent close/reuse policy:
      - 완료 즉시 close
    - Heartbeat policy:
      - Soft ping threshold: 120s
      - Reassignment threshold: 300s
      - Long-running exceptions: merge conflict
    - Reassignment safety rule:
      - diff 보호 후 재할당
  - Delegated closeout metrics:
    - Peak active slots:
    - Average active slots:
    - Slot refill count:
    - Reassignment count:

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [ ] Semantic/rule changes:
  - N/A

---

## Acceptance Criteria (Base Required)

- [x] AC-1: DataInputPanel의 헤더/액션/바디 섹션이 분리 컴포넌트로 이동.
- [x] AC-2: DataInputPanel의 상태/핸들러 계산이 `useDataInputPanelRuntime`로 이동.
- [x] AC-3: `DataInputPanel.tsx` 라인 수가 baseline(1264) 대비 감소.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "DataInputHeader|DataInputActions|DataInputBody|useDataInputPanelRuntime" v10/src/features/chrome/layout/DataInputPanel.tsx v10/src/features/chrome/layout/data-input/*.ts*`
   - Expected result:
     - 섹션/런타임 분리 확인.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `wc -l v10/src/features/chrome/layout/DataInputPanel.tsx`
   - Expected result:
     - 기존 1264보다 감소.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 핸들러 전달 누락으로 특정 버튼 동작 회귀 가능.
- Roll-back:
  - 분해 파일 + parent 파일 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/layout/data-input/DataInputHeader.tsx`
- `v10/src/features/chrome/layout/data-input/DataInputActions.tsx`
- `v10/src/features/chrome/layout/data-input/DataInputBody.tsx`
- `v10/src/features/chrome/layout/data-input/useDataInputPanelRuntime.ts`
- `v10/src/features/chrome/layout/data-input/index.ts`

Commands run (only if user asked or required by spec):
- `rg -n "DataInputHeader|DataInputBody|DataInputActions|useDataInputPanelRuntime" v10/src/features/chrome/layout/DataInputPanel.tsx v10/src/features/chrome/layout/data-input/*.ts*`
- `wc -l v10/src/features/chrome/layout/DataInputPanel.tsx`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- ...
