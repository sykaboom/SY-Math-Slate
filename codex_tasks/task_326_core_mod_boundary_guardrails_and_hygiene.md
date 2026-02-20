# Task 326: Core/Mod Boundary Guardrails and Hygiene

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Add automated guardrails to prevent boundary regression:
    - core shell re-hardcoding non-engine composition
    - duplicate toolbar action surfaces
    - template pack contract violations
- What must NOT change:
  - Runtime behavior in production builds.
  - Existing CI commands and lint/build scripts.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_core_mod_boundary.sh` (new)
- `scripts/check_toolbar_surface_uniqueness.mjs` (new)
- `scripts/check_template_pack_contract.mjs` (new)
- `scripts/scan_guardrails.sh`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `v10/AI_READ_ME.md`

Out of scope:
- New product features.
- UI redesign.
- Network/runtime protocol changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Guardrail scripts are read/scan only; no runtime mutation.
  - Script failures must provide actionable path-level messages.
- Compatibility:
  - Existing local workflows should run on Linux/macOS shell environments.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1.5
- Depends on tasks:
  - `task_320`
- Enables tasks:
  - `task_321`, `task_322`, `task_323`, `task_324`, `task_327`, `task_325`
- Parallel group:
  - G1-guardrails
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - Baseline checks run immediately after boundary contract, then strict checks extend in later tasks.
- Rationale:
  - Early guardrails reduce drift risk during follow-up refactors.

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

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - Repeated toolbar duplication and boundary drift findings in recent UX reviews.
- Sunset criteria:
  - Keep permanently; remove only if replaced by stricter CI-equivalent checks.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Guardrail scripts fail on core/mod boundary violations with clear path-level diagnostics.
- [ ] AC-2: Guardrail scripts support staged execution (`PASS` or explicit `SKIP`) when downstream artifacts are not landed yet.
- [ ] AC-3: After downstream tasks land, toolbar duplicate and template contract checks fail deterministically on violations.
- [ ] AC-4: `scan_guardrails.sh` includes new checks and passes on current baseline stage.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `bash scripts/check_core_mod_boundary.sh`
   - Expected result:
     - PASS on baseline; clear fail messages on injected violation.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `node scripts/check_toolbar_surface_uniqueness.mjs`
   - Expected result:
      - Before catalog/policy tasks: explicit SKIP message.
      - After catalog/policy tasks: PASS on baseline and FAIL on synthetic duplicate.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path:
      - `node scripts/check_template_pack_contract.mjs`
   - Expected result:
      - Before template tasks: explicit SKIP message.
      - After template tasks: PASS on baseline and FAIL on synthetic contract violation.
   - Covers: AC-2, AC-3

4) Step:
   - Command / click path:
      - `bash scripts/scan_guardrails.sh`
   - Expected result:
      - New checks executed and result summary visible.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - False positives may slow contributors.
- Roll-back:
  - Temporarily disable strict check in `scan_guardrails.sh` while preserving standalone scripts.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_core_mod_boundary.sh`
- `scripts/check_toolbar_surface_uniqueness.mjs`
- `scripts/check_template_pack_contract.mjs`
- `scripts/scan_guardrails.sh`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/check_core_mod_boundary.sh
- node scripts/check_toolbar_surface_uniqueness.mjs
- node scripts/check_template_pack_contract.mjs
- bash scripts/scan_guardrails.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (guardrail scan contains WARN-only pre-existing items)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None blocking; guardrail WARN items pre-existed and remain tracked
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified toolbar modes (draw/playback/canvas) and More panel still render without runtime errors.
- Verified template-pack registry bootstraps base-education pack without startup crash.

Notes:
- Closeout reflects implemented scope only; no out-of-scope behavior changes were introduced.
