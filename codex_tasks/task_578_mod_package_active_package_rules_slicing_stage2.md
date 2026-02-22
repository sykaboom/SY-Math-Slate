# Task 578: mod-package active-package-rules slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/activePackageRules.ts`를 facade + 하위 selector 모듈로 분해한다.
- What must NOT change:
  - active package rule selection semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/`
- `codex_tasks/task_578_mod_package_active_package_rules_slicing_stage2.md`

Out of scope:
- package selection algorithm 변경
- runtime registry behavior 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors lane 내부 분해 only
- Compatibility:
  - exported selector names/signatures unchanged

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W24
- Depends on tasks:
  - `task_576`
- Enables tasks:
  - `task_580`
- Parallel group:
  - G-P6-SLICE-W24-B
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
  - active package selectors를 역할별로 분해.

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

- [x] AC-1: `activePackageRules.ts`가 facade 수준으로 축소된다(<=40 lines 목표).
- [x] AC-2: direct/active/runtime selector 블록이 하위 모듈로 분리된다.
- [x] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/activePackageRules.ts`
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
  - active package selection wrapper wiring 누락 가능.
- Roll-back:
  - 기존 단일 `activePackageRules.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/direct.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/runtime.ts`
- `codex_tasks/task_578_mod_package_active_package_rules_slicing_stage2.md`

Commands run:
- `wc -l v10/src/core/runtime/modding/package/selectors/activePackageRules.ts`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade file line count is `17`; selection logic is split into direct/active/runtime modules.
