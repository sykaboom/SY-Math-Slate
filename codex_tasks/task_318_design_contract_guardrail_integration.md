# Task 318: Design Contract Guardrail Integration

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Add deterministic guardrails that keep design governance discoverable and prevent silent drift.
  - Integrate design SSOT docs into machine-read path (`AI_READ_ME`) and verify with script checks.
  - Tighten style hardcoding budget to current baseline.
- What must NOT change:
  - No feature behavior changes in runtime UI.
  - No new dependency installation.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_design_ssot_contract.sh` (new)
- `codex_tasks/workflow/style_budget.env` (budget tighten only)
- `v10/AI_READ_ME.md` (reference update)
- `v10/AI_READ_ME_MAP.md` (regenerated)

Out of scope:
- React component refactors
- Theme preset edits
- API/server behavior changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Guard script must be deterministic and fast (no network I/O).
  - Script checks must avoid brittle pixel/screenshot assertions.
  - Preserve existing style budget mechanism; only tighten bound.
- Compatibility:
  - Existing verification pipeline should continue working with auto-discovered `check_*.sh`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-DESIGN-SSOT-2
- Depends on tasks:
  - [`task_317`]
- Enables tasks:
  - downstream UX/theme/spec waves
- Parallel group:
  - G-DESIGN-GATE
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
- Rationale:
  - Script authoring and doc wiring can be parallelized, then merged with one verifier pass.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_318` script + doc wiring + final checks
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: guard script + budget tune
  - Implementer-B: AI_READ_ME/AI_READ_ME_MAP update
  - Implementer-C: n/a
  - Reviewer+Verifier: gate verifier
- File ownership lock plan:
  - script/env files owned by Implementer-A, AI_READ_ME* by Implementer-B
- Parallel slot plan:
  - max 6 active slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - critical-path-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 reviewer
  - Ready-queue refill trigger:
    - on each agent completion
  - Agent close/reuse policy:
    - close completed agent immediately and refill verifier slot
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 5m
    - Long-running exceptions: build/lint/map-generation
  - Reassignment safety rule:
    - only after two unanswered pings and no file progress
- Delegated closeout metrics:
  - Peak active slots: 2
  - Average active slots: 2.0
  - Slot refill count: 0
  - Reassignment count: 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - User requested structured anti-drift rules for vibe-coding design consistency.
- Sunset criteria:
  - Keep until a stronger unified guardrail replaces this script.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `scripts/check_design_ssot_contract.sh` exists, executable, and fails on missing SSOT design docs.
- [x] AC-2: style budget is tightened to current observed baseline (no regression allowance increase).
- [x] AC-3: `v10/AI_READ_ME.md` includes design SSOT doc references and the new guardrail script.
- [x] AC-4: `scripts/check_layer_rules.sh`, `scripts/check_design_ssot_contract.sh`, `scripts/check_v10_hardcoding_budget.sh` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `bash scripts/check_design_ssot_contract.sh`
   - Expected result: PASS with doc/script contract checks
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: `bash scripts/check_v10_hardcoding_budget.sh`
   - Expected result: PASS with tightened max
   - Covers: AC-2, AC-4

3) Step:
   - Command / click path: `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result: no map drift
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Budget tightening may block unrelated future styling work until explicit budget update task is approved.
- Roll-back:
  - revert `style_budget.env` max to prior value and disable/remove new check script in follow-up task.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_design_ssot_contract.sh`
- `codex_tasks/workflow/style_budget.env`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
- `scripts/check_layer_rules.sh`
- `scripts/check_design_ssot_contract.sh`
- `scripts/check_v10_hardcoding_budget.sh`
- `node scripts/gen_ai_read_me_map.mjs --check`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
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
  - none

Manual verification notes:
- New check script passes and validates design SSOT doc presence/references.
- Hardcoding budget tightened to `HARDCODING_STYLE_MAX=28` and check passes at count 28.

Notes:
- Implemented via delegated execution with split ownership: script/env and AI_READ_ME wiring.
