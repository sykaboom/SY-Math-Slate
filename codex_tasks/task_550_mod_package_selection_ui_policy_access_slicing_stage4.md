# Task 550: mod package selection ui-policy-access slicing (stage4)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/packageSelection/uiPolicyAccess.ts`를 facade + ui policy selector 모듈로 분리한다.
  - toolbar/panel slot access semantics를 유지한다.
- What must NOT change:
  - allow-group/slot 판정 규칙 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess/` (new)
- `codex_tasks/task_550_mod_package_selection_ui_policy_access_slicing_stage4.md`

Out of scope:
- activation/conflicts selectors 수정

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - packageSelection/uiPolicyAccess 내부 분리만 허용
- Compatibility:
  - exported selector names/signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W15
- Depends on tasks:
  - `task_548`
- Enables tasks:
  - `task_551`
- Parallel group:
  - G-P6-SLICE-W15-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5~9
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - selector-only slicing으로 회귀 위험 낮음.

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

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete)
- [x] Semantic/rule changes

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `uiPolicyAccess.ts`는 facade re-export only.
- [x] AC-2: ui policy access semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess.ts`
   - Expected result:
     - facade re-export only.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - active package access helper 누락.
- Roll-back:
  - uiPolicyAccess.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess/base.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess/active.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess/checks.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_550_mod_package_selection_ui_policy_access_slicing_stage4.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/selectors/packageSelection/uiPolicyAccess.ts`
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 단일 export only로 축소되었고, ui policy access 로직은 `uiPolicyAccess/*` 내부로 분리됨.
- AI_READ_ME runtime modding split 이력에 Wave15 반영.
- lint/build/mod-contract 모두 PASS.
