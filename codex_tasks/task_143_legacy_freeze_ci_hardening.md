# Task 143: Legacy Freeze and CI Hardening Wave 2

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Tighten legacy-freeze thresholds and CI checks as migration progresses.
  - Enforce changed-file lint + wave-end full build policy in verification scripts.
- What must NOT change:
  - No false-positive heavy gate that blocks normal feature work.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/check_v10_changed_lint.sh`
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Runtime behavior changes in app UX.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Deterministic shell-only checks.
  - Threshold changes must be justified by measured deltas.
- Compatibility:
  - Local developer flow remains usable.

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
    - A: freeze scripts
    - B: verification runner
    - C: docs
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

- [ ] AC-1: Freeze script thresholds reflect latest accepted migration baseline.
- [ ] AC-2: Verification runner includes changed-lint + freeze + baseline checks.
- [ ] AC-3: No new direct regression path bypasses CI scripts.
- [ ] AC-4: All script checks pass on repository state.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_legacy_freeze.sh`
   - Expected result: PASS with explicit metrics.
   - Covers: AC-1, AC-4

2) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: PASS, includes all required checks.
   - Covers: AC-2, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-tight thresholds can block valid refactors.
- Roll-back:
  - Revert threshold change and re-baseline with measured evidence.

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
