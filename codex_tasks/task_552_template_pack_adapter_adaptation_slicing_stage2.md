# Task 552: template-pack adapter adaptation slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `templatePackAdapter/adaptation.ts`를 facade + adapter 모듈로 분리한다.
  - adapted package definition/validation semantics를 유지한다.
- What must NOT change:
  - runtime mod id 생성 규칙/adapter validation contract 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation/` (new)
- `codex_tasks/task_552_template_pack_adapter_adaptation_slicing_stage2.md`

Out of scope:
- toolbarDefinition parser 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - templatePackAdapter/adaptation 내부 분리만 허용
- Compatibility:
  - exported adapter function/types 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W16
- Depends on tasks:
  - `task_551`
- Enables tasks:
  - `task_554`
- Parallel group:
  - G-P6-SLICE-W16-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5~10
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~25min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - adapter facade split으로 회귀 위험 제한.

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

- [x] AC-1: `adaptation.ts`는 facade re-export only.
- [x] AC-2: adapted package definition/validation semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts`
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
  - validation failure mapping 누락.
- Roll-back:
  - adaptation.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation/index.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation/types.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation/runtimeModId.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation/definition.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/adaptation/validation.ts`
- `codex_tasks/task_552_template_pack_adapter_adaptation_slicing_stage2.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/templatePackAdapter/adaptation.ts`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 단일 export only로 축소되었고, adaptation 로직은 `adaptation/*` 내부로 분리됨.
- lint/build/mod-contract 모두 PASS.
