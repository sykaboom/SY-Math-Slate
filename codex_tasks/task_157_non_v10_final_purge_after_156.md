# Task 157: Non-v10 Final Purge (Post-156 + Stabilization)

Status: BLOCKED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Execute final non-v10 cleanup after Task 156 completion and stabilization window.
  - Remove archived legacy assets that have zero remaining operational dependency.
  - Finalize repository as `v10-first` runtime with minimal root noise.
- What must NOT change:
  - No deletion before stabilization gate is met.
  - No removal of required governance/task/verification artifacts.
  - Never touch paths outside `/home/sykab/SY-Math-Slate`.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_157_non_v10_final_purge_after_156.md`
- `legacy_archive/**` (selected deletion targets)
- Root non-v10 candidates tagged `DELETE-FINAL` in cleanup matrix
- Docs referencing removed legacy paths

Out of scope:
- New app feature implementation.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Path safety invariant:
    - Final purge scope is repository-internal only (`/home/sykab/SY-Math-Slate/**`).
    - No external path operations, no parent traversal, no system/home-wide deletes.
  - Hard prerequisite:
    - Task 156 COMPLETED
    - stabilization window elapsed (recommended 7~14 days)
    - no critical incidents tied to legacy path removal
  - Final purge must match approved matrix only.
- Compatibility:
  - Repo verification and deploy pipeline must remain green.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: final delete set
    - B: doc/reference cleanup
    - C: verification and rollback notes
  - Parallel slot plan:
    - max 6 active slots

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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Final purge only touches `DELETE-FINAL` matrix candidates.
- [ ] AC-2: Stabilization prerequisite evidence is documented in task log.
- [ ] AC-3: All verification scripts and build/deploy checks pass after purge.
- [ ] AC-4: Rollback guide includes path-level restoration strategy.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review final delete list vs matrix.
   - Expected result: exact match with approved `DELETE-FINAL` rows.
   - Covers: AC-1

2) Step:
   - Command / click path: verify stabilization evidence in task notes.
   - Expected result: 7~14 day window + incident check recorded.
   - Covers: AC-2

3) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh` and build/deploy smoke.
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Hidden dependency to archived files discovered post-purge.
- Roll-back:
  - Restore from VCS history and/or archive snapshot using documented path map.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: BLOCKED (stabilization window prerequisite unmet as of 2026-02-16)

Changed files:
- `codex_tasks/task_157_non_v10_final_purge_after_156.md` (governance-state accuracy update only)

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_157_non_v10_final_purge_after_156.md`
- `rg --files codex_tasks | rg 'task_156|task_157'`
- `rg -n "^Status:|Date:|stabilization|stabil" codex_tasks/task_156*.md`
- `sed -n '1,240p' codex_tasks/task_156_beta_quality_gate_e2e_perf_a11y.md`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - YES
- Mitigation:
  - Wait for Task 156 post-release stabilization evidence (7~14 days) before purge execution.

Manual verification notes:
- Task 156 dependency verified: `COMPLETED` on 2026-02-15.
- Stabilization gate requires 7~14 days post-156; on 2026-02-16 only 1 day has elapsed.
- Final purge execution remains intentionally deferred to avoid unsafe destructive cleanup before prerequisite window.

Notes:
- Blocked by design under governance gate; earliest 7-day stabilization checkpoint is 2026-02-22 (if no critical incidents).
