# Task 145: Non-v10 Phase-1 Cleanup (Post-143 Gate)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Execute safe first-wave cleanup outside `v10/` after Task 143 passes.
  - Remove only candidates classified as low-risk with zero runtime and governance dependency.
  - Move uncertain candidates to archive zone instead of permanent deletion.
- What must NOT change:
  - No deletion of any file required by hooks, CI, specs, governance, or active docs.
  - No deletion of legacy references without evidence from inventory matrix.
  - Never touch paths outside `/home/sykab/SY-Math-Slate`.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_156_non_v10_phase1_cleanup_after_143.md`
- Paths listed as Phase-1 candidates in `codex_tasks/cleanup/non_v10_cleanup_matrix.md`
- `legacy_archive/` (new, if quarantine move is used)
- `v10/AI_READ_ME.md` and/or root docs (only if references change)

Out of scope:
- Final destructive purge.
- Any `v10/**` path removal.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Path safety invariant:
    - Operations are limited to repo-internal paths only (`/home/sykab/SY-Math-Slate/**`).
    - No recursive wildcard delete commands targeting unknown scope.
    - No command may reference parent/outside paths (`../`, `/home/*` outside repo, system paths).
  - Hard prerequisite: Task 143 completed and all verification scripts green.
  - Phase-1 only touches `DELETE-P1` and `ARCHIVE-P1` matrix rows.
  - For ambiguous paths, prefer ARCHIVE over DELETE.
- Compatibility:
  - Repo build/verifications must remain green immediately after cleanup.

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
    - A: low-risk delete set
    - B: archive/quarantine moves
    - C: reference/doc updates
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

- [ ] AC-1: Only matrix-approved Phase-1 candidates are touched.
- [ ] AC-2: Ambiguous files are archived, not deleted.
- [ ] AC-3: `bash scripts/run_repo_verifications.sh` passes post-cleanup.
- [ ] AC-4: Rollback path documented for all touched paths.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: compare touched paths against matrix tags.
   - Expected result: all touched paths are `DELETE-P1` or `ARCHIVE-P1`.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect `legacy_archive/` and commit diff.
   - Expected result: ambiguous assets moved, not destroyed.
   - Covers: AC-2, AC-4

3) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Accidental removal of still-referenced files.
- Roll-back:
  - Revert commit or restore from `legacy_archive/` snapshot.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES / NO
- Mitigation:
  - ...

Manual verification notes:
- ...

Notes:
- ...
