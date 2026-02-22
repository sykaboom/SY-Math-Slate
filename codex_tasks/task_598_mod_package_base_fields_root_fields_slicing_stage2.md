# Task 598: mod-package base-fields root-fields parsing slicing (stage2)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `baseFields/parse/rootFields.ts`를 facade + validator helper로 분해한다.
- What must NOT change:
  - `packId/version/label` 필수 검증 semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields/validate.ts`
- `codex_tasks/task_598_mod_package_base_fields_root_fields_slicing_stage2.md`

Out of scope:
- root manifest field contract 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - base-fields parse lane 내부 분해 only
- Compatibility:
  - `parseBaseManifestRoot` exported API 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W29
- Depends on tasks:
  - `task_596`
- Enables tasks:
  - `task_600`
- Parallel group:
  - G-P6-SLICE-W29-B
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
  - 단일 파일 분해 + 필드 validator 추출.

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

- [ ] AC-1: `rootFields.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [ ] AC-2: root fields validator helper가 분리된다.
- [ ] AC-3: lint/build PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields.ts`
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
  - base root required fields 검증 drift 가능.
- Roll-back:
  - 기존 단일 `rootFields.ts`로 즉시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields.ts`
- `v10/src/core/runtime/modding/package/guards/validateDefinition/baseFields/parse/rootFields/validate.ts`
- `codex_tasks/task_598_mod_package_base_fields_root_fields_slicing_stage2.md`

Commands run:
- `bash scripts/check_v10_large_file_budget.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `rootFields.ts` reduced to facade (26 lines).
- root field required-checks moved to `rootFields/validate.ts` without contract drift.
