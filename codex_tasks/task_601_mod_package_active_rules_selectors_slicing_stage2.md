# Task 601: mod-package active rules selectors slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `selectors/activePackageRules/active.ts`를 facade + selector helper로 분해한다.
- What must NOT change:
  - active package rule selection semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active/selectors.ts`
- `codex_tasks/task_601_mod_package_active_rules_selectors_slicing_stage2.md`

Out of scope:
- active package rule public API 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - selectors lane 내부 분해 only
- Compatibility:
  - exported selector names 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W30
- Depends on tasks:
  - `task_600`
- Enables tasks:
  - `task_604`
- Parallel group:
  - G-P6-SLICE-W30-A
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~15min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 반복 selector 래핑 로직 분리.

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

- [ ] AC-1: `active.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [ ] AC-2: active selector helper가 분리된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/selectors/activePackageRules/active.ts`
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
  - active package contribution selection drift 가능.
- Roll-back:
  - 기존 단일 `active.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/active/selectors.ts`
- `codex_tasks/task_601_mod_package_active_rules_selectors_slicing_stage2.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `active.ts` reduced to facade (8 lines).
- active selection implementations moved to `active/selectors.ts`.
