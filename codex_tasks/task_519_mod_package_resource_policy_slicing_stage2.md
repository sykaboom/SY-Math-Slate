# Task 519: Mod Package guards/resourcePolicy Slicing Stage 2 (facade + rule parser split)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `core/runtime/modding/package/guards/resourcePolicy.ts` 단일 파일(251 lines)을 facade + parser 모듈로 분해한다.
  - 기존 parser API(`parseCommandRules`, `parseShortcutRules`, `parseInputBehaviorRule`)를 유지한다.
- What must NOT change:
  - validation error path/code/message semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/index.ts` (new)
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts` (new)
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules.ts` (new)
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule.ts` (new)
- `codex_tasks/task_519_mod_package_resource_policy_slicing_stage2.md`

Out of scope:
- validateDefinition flow 변경
- 정책 계약(타입) 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - guards 내부 split only.
  - `guards/resourcePolicy.ts`는 facade export-only 형태(<40 lines)로 축소.
- Compatibility:
  - `validateDefinition/uiAndResourcePolicy.ts` 기존 import가 유지되어야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W6
- Depends on tasks:
  - `task_517`
- Enables tasks:
  - `task_520`
- Parallel group:
  - G-P6-SLICE-W6
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - validation 계약 보존이 핵심.

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

- [x] AC-1: `guards/resourcePolicy.ts`가 facade 수준(<=40 lines)으로 축소된다.
- [x] AC-2: `parseCommandRules|parseShortcutRules|parseInputBehaviorRule` exported API 유지.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `wc -l v10/src/core/runtime/modding/package/guards/resourcePolicy.ts`
   - Expected result:
     - 40 lines 이하.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "parse(CommandRules|ShortcutRules|InputBehaviorRule)" v10/src/core/runtime/modding/package/guards`
   - Expected result:
     - API 심볼 존재.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - validation fail path 문자열 변경 가능.
- Roll-back:
  - `guards/resourcePolicy.ts` + 신규 `guards/resourcePolicy/*` 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/index.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/commandRules.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/inputBehaviorRule.ts`
- `codex_tasks/task_519_mod_package_resource_policy_slicing_stage2.md`

Commands run (only if user asked or required by spec):
- `wc -l v10/src/core/runtime/modding/package/guards/resourcePolicy.ts`
- `rg -n \"parse(CommandRules|ShortcutRules|InputBehaviorRule)\" v10/src/core/runtime/modding/package/guards`
- `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
- `bash scripts/check_v10_large_file_budget.sh`
- `bash scripts/run_repo_verifications.sh --stage end`

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
- Blocking:
  - NO
- Mitigation:
  - n/a
