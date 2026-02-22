# Task 553: template-pack manifest selectors slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `templatePackAdapter/manifestSelectors.ts`를 facade + selector 모듈로 분리한다.
  - typed/untyped selector semantics를 유지한다.
- What must NOT change:
  - deterministic order/primary/packId lookup 규칙 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors/` (new)
- `codex_tasks/task_553_template_pack_manifest_selectors_slicing_stage2.md`

Out of scope:
- package selector contracts 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - templatePackAdapter/manifestSelectors 내부 분리만 허용
- Compatibility:
  - exported selector names/signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W16
- Depends on tasks:
  - `task_551`
- Enables tasks:
  - `task_554`
- Parallel group:
  - G-P6-SLICE-W16-B
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
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - selector facade split으로 회귀 위험 낮음.

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

- [x] AC-1: `manifestSelectors.ts`는 facade re-export only.
- [x] AC-2: typed/untyped manifest selector semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors.ts`
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
  - typed selector generic 경로 누락.
- Roll-back:
  - manifestSelectors.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors/index.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors/list.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors/selectById.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors/selectPrimary.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_553_template_pack_manifest_selectors_slicing_stage2.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/templatePackAdapter/manifestSelectors.ts`
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 단일 export only로 축소되었고, manifest selector 로직은 `manifestSelectors/*` 내부로 분리됨.
- AI_READ_ME runtime modding split 이력에 Wave16 반영.
- lint/build/mod-contract 모두 PASS.
