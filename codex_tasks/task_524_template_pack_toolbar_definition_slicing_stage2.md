# Task 524: TemplatePackAdapter toolbarDefinition Slicing Stage 2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts`를 facade + parser modules로 분해한다.
  - `selectTemplatePackToolbarDefinition` API를 유지한다.
- What must NOT change:
  - toolbar definition validation/normalization semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/index.ts` (new)
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/guards.ts` (new)
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts` (new)
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/selector.ts` (new)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_524_template_pack_toolbar_definition_slicing_stage2.md`

Out of scope:
- adaptation/manifest selectors 동작 변경

---

## Dependencies / Constraints (Base Required)
- New dependencies allowed: NO
- `toolbarDefinition.ts`는 facade export-only(<40 lines).

---

## DAG / Wave Metadata (Base Required)
- Wave ID: W-P6-SLICE-W8
- Depends on tasks: `task_523`
- Enables tasks: `task_527`
- Parallel group: G-P6-SLICE-W8
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Acceptance Criteria (Base Required)
- [x] AC-1: `toolbarDefinition.ts` facade(<=40 lines)
- [x] AC-2: `selectTemplatePackToolbarDefinition` API 유지
- [x] AC-3: lint/build/check_mod_contract PASS

---

## Manual Verification Steps (Base Required)
1) `wc -l v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts`
2) `rg -n "selectTemplatePackToolbarDefinition" v10/src/core/runtime/modding/package/templatePackAdapter`
3) `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`

---

## Risks / Roll-back Notes (Base Required)
- Risks: parser 분리 중 mode/surface validation drift
- Roll-back: toolbarDefinition 관련 파일 동시 revert

---

## Approval Gate (Base Required)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/index.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/guards.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/selector.ts`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_524_template_pack_toolbar_definition_slicing_stage2.md`
Commands run:
- `wc -l v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts`
- `rg -n "selectTemplatePackToolbarDefinition" v10/src/core/runtime/modding/package/templatePackAdapter`
- `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/run_repo_verifications.sh --stage end`
Gate Results:
- Lint: PASS
- Build: PASS
- Script checks: PASS
Failure Classification:
- Pre-existing failures: none
- Newly introduced failures: none
- Blocking: NO
- Mitigation: n/a
