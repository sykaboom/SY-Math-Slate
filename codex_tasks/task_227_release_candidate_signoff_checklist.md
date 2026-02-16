# Task 227: Release Candidate Signoff Checklist

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add RC signoff checklist document and automated presence/section check script.
  - Integrate checklist check into repository verification chain.
- What must NOT change:
  - No runtime behavior changes.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_227_release_candidate_signoff_checklist.md`
- `codex_tasks/workflow/release_candidate_signoff_checklist.md` (new)
- `scripts/check_v10_rc_signoff.sh` (new)
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

Out of scope:
- SDK/marketplace growth tasks
- post-W9 roadmap edits beyond status updates

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - checklist check should remain static and deterministic.
- Compatibility:
  - script must be executable under existing CI/local bash environment.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W9
- Depends on tasks:
  - [`task_226`]
- Enables tasks:
  - [`task_228`]
- Parallel group:
  - G9-release
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_219 + task_224~227
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - checklist doc + script + matrix status updates owned by this task.
  - Parallel slot plan:
    - sequential

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

- [x] AC-1: RC signoff checklist exists and includes required sections (security, reliability, UX, rollback, launch).
- [x] AC-2: `check_v10_rc_signoff.sh` validates checklist structure and passes.
- [x] AC-3: roadmap matrix rows 219/224/225/226/227 are set to COMPLETED.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_rc_signoff.sh`
   - Expected result: PASS.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: inspect matrix rows 219/224/225/226/227.
   - Expected result: all COMPLETED.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Checklist drift if architecture changes without doc updates.
- Roll-back:
  - Revert checklist/script update.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "1,2 실행하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_227_release_candidate_signoff_checklist.md`
- `codex_tasks/workflow/release_candidate_signoff_checklist.md`
- `scripts/check_v10_rc_signoff.sh`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_rc_signoff.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- RC checklist file contains required sections and 12+ checklist items.
- rc signoff script passes standalone and in end-stage verification.
- matrix rows 219/224/225/226/227 are all `COMPLETED`.

Notes:
- checklist is static and intentionally tool-agnostic for operational signoff reuse.
