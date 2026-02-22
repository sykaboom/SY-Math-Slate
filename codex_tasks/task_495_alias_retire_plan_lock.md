# Task 495: Legacy Alias Retire Plan Lock (Freeze + Exit Gate)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - legacy alias fallback 경로를 즉시 제거하지 않고, "증가 금지(freeze) + 제거 조건(exit gate)"를 스크립트로 고정한다.
  - 운영 문서에 alias retire 기준(언제 제거 가능한지)을 명시한다.
- What must NOT change:
  - 현재 runtime fallback 동작(compat lane) 자체는 유지한다.
  - toolbar 렌더 동작/레이아웃/모드 전환 사용자 체감 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_mod_contract.sh`
- `codex_tasks/workflow/mod_alias_retire_budget.env` (new)
- `codex_tasks/workflow/mod_alias_retire_plan.md` (new)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_495_alias_retire_plan_lock.md`

Out of scope:
- alias fallback 실제 제거(코드 경로 삭제)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` UI 변경
- pack schema/adapter 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - freeze/retire 게이트는 `scripts/*`와 workflow 문서 계층에 한정한다.
  - `core/runtime/modding/package/*` 런타임 로직은 본 태스크에서 변경하지 않는다.
- Compatibility:
  - 기존 alias fallback source 문자열(`legacy.toolbar-mode-to-mod-id`, `legacy.mod-id-to-toolbar-mode`) 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-HIGH-05
- Depends on tasks:
  - `task_494`
- Enables tasks:
  - `task_496` alias runtime removal (planned)
- Parallel group:
  - G-ALIAS-RETIRE-GATE
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (script + docs + architecture guardrail)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 게이트 스크립트와 기준 문서는 한 번에 맞춰야 drift 없이 안정적이다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

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

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - `task_494` closeout에서 `task_495 alias retire plan lock`를 downstream으로 명시.
  - alias fallback 경로가 존재하는 상태에서 제거 웨이브 기준이 문서/게이트로 고정되지 않음.
- Sunset criteria:
  - `task_496`에서 alias runtime path 제거 완료 시 본 freeze 규칙은 retire 모드로 전환.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `check_mod_contract.sh`가 alias fallback freeze budget를 로드하고 초과 시 FAIL한다.
- [x] AC-2: alias retire 기준 문서(`mod_alias_retire_plan.md`)가 생성되고 exit gate가 명시된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` + `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path:
     - `sed -n '1,240p' scripts/check_mod_contract.sh`
     - `sed -n '1,200p' codex_tasks/workflow/mod_alias_retire_budget.env`
   - Expected result:
     - check 스크립트가 budget 파일을 로드하고 alias 관련 count threshold를 검증한다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `sed -n '1,260p' codex_tasks/workflow/mod_alias_retire_plan.md`
   - Expected result:
     - retire 단계, 사전조건, rollback 기준이 명시되어 있다.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - threshold를 너무 엄격하게 잡으면 합법적인 전환 단계에서 오탐 가능.
- Roll-back:
  - `check_mod_contract.sh`의 alias budget block만 revert 후 재시도.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이 그렇게 진행하자."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_mod_contract.sh`
- `codex_tasks/workflow/mod_alias_retire_budget.env` (new)
- `codex_tasks/workflow/mod_alias_retire_plan.md` (new)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_495_alias_retire_plan_lock.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: `check_mod_contract.sh`에 `alias-retire-budget` 섹션이 추가되어 env budget 기반 threshold 검증이 수행됨.
- AC-2 PASS: `codex_tasks/workflow/mod_alias_retire_plan.md` 생성, retire readiness/rollback 조건 고정.
- AC-3 PASS: `check_mod_contract.sh`, `lint`, `build` 전체 통과.

Notes:
- 본 태스크는 freeze/plan lock만 수행하며 alias runtime path 제거는 후속(`task_496`) 범위다.
