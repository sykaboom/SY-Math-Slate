# Task 316: Toolbar Cross-Viewport Contract Gate (Desktop/Mobile/Tablet)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Add an explicit contract gate for toolbar UX parity across desktop/mobile/tablet after tasks 310~315.
  - Prevent regression of mode split, control discoverability, and placement safety.
- What must NOT change:
  - Do not enforce brittle screenshot pixel snapshots.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_toolbar_contract.sh` (new)
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md` (if structure map changes)
- `codex_tasks/batch_dispatch_plan_2026_02_19_toolbar_phase2.md` (new, optional wave plan)

Out of scope:
- Toolbar feature implementation itself (validation only)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Gate script must be deterministic and CI-friendly.
  - Use source-pattern + semantic checks; avoid flaky visual assertions.
- Compatibility:
  - Existing verify pipeline stage integration should be optional and non-breaking at first.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-Z
- Depends on tasks:
  - [`task_311`, `task_312`, `task_313`, `task_314`, `task_315`]
- Enables tasks:
  - next toolbar/product waves
- Parallel group:
  - GZ-contract-gate
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2~4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
- Rationale:
  - Contract gate must run last after behavior changes land.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - 반복적인 toolbar 회귀와 환경별 상이 동작 보고.
- Sunset criteria:
  - Contract gate가 정착되면 일회성 수동 회귀 문서 제거.

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

- [ ] AC-1: New toolbar contract script exists and can run locally.
- [ ] AC-2: Contract checks include desktop/mobile/tablet coverage assertions.
- [ ] AC-3: Gate can classify failure as blocking/non-blocking with clear messages.
- [ ] AC-4: `cd v10 && npm run lint && npm run build` pass after gate integration.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `bash scripts/check_toolbar_contract.sh`
   - Expected result: pass/fail with deterministic messages
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: script output에서 viewport matrix 항목 확인
   - Expected result: desktop/mobile/tablet 계약 항목 존재
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 과도한 strict rule로 개발 속도 저하.
- Roll-back:
  - gate script를 soft mode로 전환 또는 pre-push 미연동 유지.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_toolbar_contract.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `scripts/check_toolbar_contract.sh`
- `node scripts/gen_ai_read_me_map.mjs --check`
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
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- New contract gate script validates no blocking modal/no silent catch and key toolbar parity hooks.
- AI_READ_ME updated with toolbar runtime policy and contract gate reference.

Notes:
- ...
