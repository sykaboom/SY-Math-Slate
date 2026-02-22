# Task 547: mod package activation mapping base slicing (stage3)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/packageSelection/activationMapping/base.ts`를 facade + base mapping 모듈로 분리한다.
  - activation mapping semantics를 유지한다.
- What must NOT change:
  - package-map 기반 forward/reverse resolution contract 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base/` (new)
- `codex_tasks/task_547_mod_package_activation_mapping_base_slicing_stage3.md`

Out of scope:
- active.ts/reverse.ts 수정, alias fallback 정책 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - activationMapping/base 내부 분리만 허용
- Compatibility:
  - exported selector names/signatures 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W14
- Depends on tasks:
  - `task_545`
- Enables tasks:
  - `task_548`
- Parallel group:
  - G-P6-SLICE-W14-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~8
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
  - mapping selector 분리로 회귀 범위 제한.

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

- [x] AC-1: `activationMapping/base.ts`는 facade re-export only.
- [x] AC-2: forward/reverse toolbarMode↔modId mapping semantics 회귀 없음.
- [x] AC-3: lint/build/check_mod_contract PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "^export \* from" v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base.ts`
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
  - toolbarModeMap 탐색 누락.
- Roll-back:
  - base.ts 단일파일로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base/index.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base/defaults.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base/mapToMod.ts`
- `v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base/mapToToolbar.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_547_mod_package_activation_mapping_base_slicing_stage3.md`

Commands run:
- `rg -n "^export \\* from" v10/src/core/runtime/modding/package/selectors/packageSelection/activationMapping/base.ts`
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- facade는 단일 export only로 축소되었고, base mapping 로직은 `activationMapping/base/*` 내부로 분리됨.
- AI_READ_ME runtime modding split 이력에 Wave14 반영.
- lint/build/mod-contract 모두 PASS.
