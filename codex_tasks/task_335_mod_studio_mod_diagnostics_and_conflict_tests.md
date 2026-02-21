# Task 335: Mod Studio Mod Diagnostics + Conflict Test Pack

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Extend Mod Studio diagnostics to include mod enable/order/conflict visibility.
  - Add regression checks for mod routing/contribution conflicts.
- What must NOT change:
  - No runtime permission model relaxation.
  - No direct execution of untrusted remote mod code.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/core/mod/host/manager.ts`
- `v10/.eslintrc.*` or `v10/eslint.config.*` (mod-boundary `no-restricted-imports` rules)
- `scripts/check_mod_contract.sh` (new)
- `scripts/scan_guardrails.sh` (integration line only if needed)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_335_mod_studio_mod_diagnostics_and_conflict_tests.md`

Out of scope:
- Full marketplace/distribution UX.
- Remote signing infrastructure.
- CRDT/multi-active-mod execution.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Diagnostics consume manager state; must not become mutation authority.
  - Enforcement rules must fail CI on boundary violations (no warning downgrade for restricted imports).
- Compatibility:
  - Existing module diagnostics remain valid for non-mod flows.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6-mod-hardening
- Depends on tasks:
  - [`task_334`]
- Enables tasks:
  - []
- Parallel group:
  - G-mod-diagnostics
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5-7
- Files shared with other PENDING tasks:
  - `v10/src/core/mod/host/manager.ts`
- Cross-module dependency:
  - YES (mod runtime + studio + scripts)
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~45min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - Only after `task_334` lands.
- Rationale:
  - Primarily diagnostics/check path additions, with minimal runtime mutation.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
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
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update

---

## Acceptance Criteria (Base Required)

- [x] AC-1:
  - Mod Studio can display active mod order, priority conflicts, and blocked contributions.
- [x] AC-2:
  - Conflict diagnostics identify command/toolbar shortcut collisions with deterministic reasons.
- [x] AC-3:
  - `scripts/check_mod_contract.sh` validates core mod contract invariants and exits non-zero on violations.
- [x] AC-4:
  - ESLint restricted-import rules block at least:
    - `core/mod/builtin/* -> features/layout|features/store|features/layout/windowing`
    - `core/mod/host/* -> features/*`
    - `features/ui-host/* -> core/mod/**/internal/*`
- [x] AC-5:
  - `cd v10 && npm run lint`, `cd v10 && npm run build`, and `bash scripts/check_layer_rules.sh` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Open Mod Studio diagnostics.
   - Expected result:
     - Active mod list/order/conflicts are visible and understandable.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - Introduce fixture conflict scenario (duplicate contribution or shortcut).
   - Expected result:
     - Diagnostic output includes deterministic conflict reason.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - Run `bash scripts/check_mod_contract.sh`.
   - Expected result:
     - PASS on healthy state; FAIL on intentional conflict fixture.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - Add intentional restricted import fixture (or temporary local edit) and run lint.
   - Expected result:
     - Lint fails with expected restricted-import rule id/message.
   - Covers: AC-4

5) Step:
   - Command / click path:
     - Run lint/build/layer checks.
   - Expected result:
     - All pass.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-strict diagnostics may flag noisy false positives.
- Roll-back:
  - Keep diagnostics read-only and lower severity to warnings while rules stabilize.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: "맥스 오케스트레이션 모드. 위임모드 진행. 구현하라.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/eslint.config.mjs`
- `scripts/check_mod_contract.sh`
- `scripts/scan_guardrails.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_335_mod_studio_mod_diagnostics_and_conflict_tests.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/scan_guardrails.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`, `scan_guardrails`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None (scan warnings only)
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified Mod Studio shows active mod order, priority conflicts, and blocked contribution diagnostics.
- Verified `check_mod_contract.sh` fails on boundary violations and passes on healthy state.
- Verified ESLint restricted-import rules enforce mod boundary constraints.

Notes:
- Guardrail scan reports non-blocking warnings only (hardcoded theme colors and overlay pointer-events candidates).
