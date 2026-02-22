# Task 577: mod-package template toolbar parsers slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `templatePackAdapter/toolbarDefinition/parsers.ts`를 facade + 하위 parser 모듈로 분해한다.
- What must NOT change:
  - toolbar definition parse/validation semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers/`
- `codex_tasks/task_577_mod_package_template_toolbar_parsers_slicing_stage2.md`

Out of scope:
- template pack manifest schema 변경
- toolbar resolver behavior 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/runtime/modding/package` lane 내부 분해 only
- Compatibility:
  - exported parser function names/signatures unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W24
- Depends on tasks:
  - `task_576`
- Enables tasks:
  - `task_580`
- Parallel group:
  - G-P6-SLICE-W24-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~5
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
  - parser 내부 블록 분해로 복잡도 축소.

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `parsers.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [x] AC-2: mode/action/surface parser가 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts`
   - Expected result:
     - <= 40
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - parser 분기 누락 시 invalid pack reject/accept regression 가능.
- Roll-back:
  - 기존 단일 `parsers.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers/modeDefinitions.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers/actionCatalog.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers/actionSurfaceRules.ts`
- `codex_tasks/task_577_mod_package_template_toolbar_parsers_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/parsers.ts`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `parsers.ts` line count is `25`, and parser internals are separated into `parsers/*`.
