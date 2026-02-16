# Task 233: Legacy Codename Reference Purge with Cleanup Guard

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remove all repository references to the legacy codename string (case-insensitive variants) that are not required runtime dependencies.
  - Reinforce cleanup policy that non-delete targets remain untouched.
- What must NOT change:
  - Do not delete files tagged KEEP/non-delete in cleanup matrix.
  - Do not modify runtime behavior unrelated to legacy-codename string references.
  - Do not remove required workflow/governance artifacts.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_233_legacy_codename_reference_purge_with_cleanup_guard.md`
- Files containing legacy-codename references discovered via repository search

Out of scope:
- Non-codename refactors
- Any destructive cleanup outside approved matrix tags

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep root/v10 runtime behavior stable.
  - Use minimal edits limited to stale codename strings and related stale artifacts.
- Compatibility:
  - Verification scripts must remain PASS.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-CLEANUP
- Depends on tasks:
  - [`task_232`]
- Enables tasks:
  - []
- Parallel group:
  - G-cleanup
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

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

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Repository-wide search shows zero legacy-codename string references.
- [x] AC-2: Non-delete targets remain untouched (no unintended deletions).
- [x] AC-3: Mid-stage verification passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n --hidden --glob '!.git' --glob '!node_modules' -i "$LEGACY_CODENAME_PATTERN" .`
   - Expected result: no output.
   - Covers: AC-1

2) Step:
   - Command / click path: `git status --short`
   - Expected result: only intended files changed; no accidental delete of KEEP targets.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Removing an actually-required reference if context is misread.
- Roll-back:
  - Revert changed files from this task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote (paraphrased): keep non-delete targets, remove legacy codename references.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `IDENTITY.md`
- `oc_tools/dispatch.sh`
- `codex_tasks/task_233_legacy_codename_reference_purge_with_cleanup_guard.md`

Commands run (only if user asked or required by spec):
- `rg -n "$LEGACY_CODENAME_PATTERN" -S`
- `rg -n --hidden --glob '!.git' --glob '!node_modules' -i "$LEGACY_CODENAME_PATTERN" .`
- `git status --short`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A (no v10 JS/TS runtime logic changes)
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

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
- Legacy codename string references removed from runtime/docs scanned by grep.
- Non-delete targets retained; no deletions performed.

Notes:
- Socket env/paths in `oc_tools/dispatch.sh` were migrated to neutral names while preserving existing fallback behavior via `CLAWDBOT_TMUX_SOCKET_DIR`.
