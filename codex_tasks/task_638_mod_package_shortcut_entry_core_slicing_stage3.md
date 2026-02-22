# Task 638: mod package shortcut entry core slicing stage3

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-23

---

## Goal (Base Required)
- What to change:
  - `resourcePolicy/shortcutRules/validators/entry.ts`를 facade로 축소하고 본체를 `entry/core.ts`로 분리한다.
- What must NOT change:
  - shortcut rule parse 결과/검증 규칙 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/entry.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/entry/core.ts`
- `codex_tasks/task_638_mod_package_shortcut_entry_core_slicing_stage3.md`

Out of scope:
- operation/when validator 계약 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - shortcutRules validator lane 내부 분리만 수행
- Compatibility:
  - `parseShortcutRuleEntry` export 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-W39
- Depends on tasks:
  - `task_636`
- Enables tasks:
  - `task_639`
- Parallel group:
  - G-P6-SLICE-W39-B
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
  - 독립 validator entry 분리.

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
- [x] AC-2: 구현은 `entry/core.ts`로 이동한다.
- [x] AC-3: lint/build/repo verification PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,40p' v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/entry.ts`
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
  - 상대경로 오타로 TS fail.
- Roll-back:
  - `entry/core.ts`를 `entry.ts`로 되돌림.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/entry.ts`
- `v10/src/core/runtime/modding/package/guards/resourcePolicy/shortcutRules/validators/entry/core.ts`
- `codex_tasks/task_638_mod_package_shortcut_entry_core_slicing_stage3.md`

Commands run:
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/run_repo_verifications.sh --stage end`

Manual verification notes:
- facade/core 분리 후 shortcut parse path 회귀 없음.

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
