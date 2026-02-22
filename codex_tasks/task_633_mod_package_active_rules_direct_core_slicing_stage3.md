# Task 633: mod package active rules direct core slicing stage3

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `activePackageRules/direct.ts`를 facade로 축소하고 구현 본체를 `direct/core.ts`로 분리한다.
- What must NOT change:
  - selector 반환 계약/동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/direct.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/direct/core.ts`
- `codex_tasks/task_633_mod_package_active_rules_direct_core_slicing_stage3.md`

Out of scope:
- active/runtime selector 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - package selector 레이어 내부 분리만 수행
- Compatibility:
  - 기존 export symbol 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W38
- Depends on tasks:
  - `task_632`
- Enables tasks:
  - `task_636`
- Parallel group:
  - G-P6-SLICE-W38-A
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
  - `~10min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 독립 파일 분리 작업으로 충돌 없이 batch 가능.

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

- [x] AC-1: `direct.ts`는 facade export만 가진다.
- [x] AC-2: 구현 로직은 `direct/core.ts`로 이동된다.
- [x] AC-3: lint/build/repo verification PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,80p' v10/src/core/runtime/modding/package/selectors/activePackageRules/direct.ts`
   - Expected result:
     - facade export only
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
  - re-export 경로 오타 시 TS fail.
- Roll-back:
  - `direct/core.ts` 내용을 `direct.ts`로 복귀.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/direct.ts`
- `v10/src/core/runtime/modding/package/selectors/activePackageRules/direct/core.ts`
- `codex_tasks/task_633_mod_package_active_rules_direct_core_slicing_stage3.md`

Commands run:
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- `direct.ts` facade 확인, `core.ts` 로직 분리 확인.

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
