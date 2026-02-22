# Task 635: mod package ui parse entry core slicing stage3

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `uiPolicy/parseUIItemRules/parse/entry.ts`를 facade로 축소하고 구현을 `entry/core.ts`로 분리한다.
- What must NOT change:
  - UI item parse/normalize/validation 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse/entry.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse/entry/core.ts`
- `codex_tasks/task_635_mod_package_ui_parse_entry_core_slicing_stage3.md`

Out of scope:
- validator 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - uiPolicy parse lane 내부 분리
- Compatibility:
  - `parseUIItemRuleEntry` export 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W38
- Depends on tasks:
  - `task_632`
- Enables tasks:
  - `task_636`
- Parallel group:
  - G-P6-SLICE-W38-C
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
  - entry-level 함수 분리로 독립 수행 가능.

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

- [x] AC-1: `entry.ts`는 facade export만 가진다.
- [x] AC-2: `entry/core.ts`가 parse 본체를 소유한다.
- [x] AC-3: lint/build/repo verification PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,80p' v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse/entry.ts`
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
  - 상대 경로 오타 시 build fail.
- Roll-back:
  - `entry/core.ts` 내용을 `entry.ts`로 환원.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse/entry.ts`
- `v10/src/core/runtime/modding/package/guards/uiPolicy/parseUIItemRules/parse/entry/core.ts`
- `codex_tasks/task_635_mod_package_ui_parse_entry_core_slicing_stage3.md`

Commands run:
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade/core 분리 후 UI parse flow 회귀 없음.

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
