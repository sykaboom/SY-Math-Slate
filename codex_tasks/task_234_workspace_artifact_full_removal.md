# Task 234: Workspace Artifact Full Removal

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remove root-level legacy workspace artifacts (`HEARTBEAT.md`, `IDENTITY.md`, `SOUL.md`, `TOOLS.md`, `USER.md`).
  - Remove `oc_tools/` helper directory artifacts.
  - Keep non-delete targets untouched and repair only direct references broken by these removals.
- What must NOT change:
  - Do not modify `v10/` runtime behavior.
  - Do not perform unrelated cleanup outside the approved deletion set.
  - Do not change policy files beyond entries directly describing deleted artifacts.

---

## Scope (Base Required)

Touched files/directories:
- `HEARTBEAT.md` (delete)
- `IDENTITY.md` (delete)
- `SOUL.md` (delete)
- `TOOLS.md` (delete)
- `USER.md` (delete)
- `oc_tools/dispatch.sh` (delete via directory removal)
- `oc_tools/run_codex.sh` (delete via directory removal)
- `oc_tools/run_gemini.sh` (delete via directory removal)
- `oc_tools/` (delete)
- `README.md` (remove stale link/reference)
- `codex_tasks/cleanup/non_v10_cleanup_matrix.md` (update stale KEEP row for removed directory)
- `codex_tasks/cleanup/non_v10_inventory.md` (remove stale inventory row)
- `codex_tasks/task_234_workspace_artifact_full_removal.md`

Out of scope:
- Editing historical completed task logs except when explicitly required by this task.
- Any v10 feature changes.
- Any additional deletions not listed above.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Root cleanup only; preserve repository operability.
  - Remove only listed artifacts and direct stale references.
- Compatibility:
  - Verification scripts must pass at `mid` stage.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-CLEANUP
- Depends on tasks:
  - [`task_233`]
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

- [x] AC-1: Listed root legacy md files no longer exist.
- [x] AC-2: `oc_tools/` directory no longer exists.
- [x] AC-3: No stale `README.md` reference remains to removed local runtime notes file.
- [x] AC-4: Cleanup matrix/inventory no longer claims removed directory as KEEP.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `ls -1 HEARTBEAT.md IDENTITY.md SOUL.md TOOLS.md USER.md`
   - Expected result: files not found.
   - Covers: AC-1

2) Step:
   - Command / click path: `test -d oc_tools && echo exists || echo missing`
   - Expected result: `missing`.
   - Covers: AC-2

3) Step:
   - Command / click path: `rg -n "TOOLS\.md" README.md`
   - Expected result: no output.
   - Covers: AC-3

4) Step:
   - Command / click path: `rg -n "oc_tools" codex_tasks/cleanup/non_v10_cleanup_matrix.md codex_tasks/cleanup/non_v10_inventory.md`
   - Expected result: no output.
   - Covers: AC-4

5) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Removing files still expected by personal/local workflow scripts.
- Roll-back:
  - `git revert <task-234-commit>` after commit, or restore deleted paths from prior commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "웅. 그렇게하자 지워버려. oc_tools도."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `HEARTBEAT.md` (deleted)
- `IDENTITY.md` (deleted)
- `SOUL.md` (deleted)
- `TOOLS.md` (deleted)
- `USER.md` (deleted)
- `oc_tools/dispatch.sh` (deleted)
- `oc_tools/run_codex.sh` (deleted)
- `oc_tools/run_gemini.sh` (deleted)
- `README.md`
- `codex_tasks/cleanup/non_v10_cleanup_matrix.md`
- `codex_tasks/cleanup/non_v10_inventory.md`
- `codex_tasks/task_234_workspace_artifact_full_removal.md`

Commands run (only if user asked or required by spec):
- `find oc_tools -maxdepth 3 -type f | sort`
- `rg -n "oc_tools|dispatch\.sh|HEARTBEAT\.md|IDENTITY\.md|SOUL\.md|TOOLS\.md|USER\.md" --hidden --glob '!.git' --glob '!node_modules' .`
- `ls -1 HEARTBEAT.md IDENTITY.md SOUL.md TOOLS.md USER.md`
- `test -d oc_tools && echo exists || echo missing`
- `rmdir oc_tools`
- `rg -n "TOOLS\.md" README.md`
- `rg -n "oc_tools" codex_tasks/cleanup/non_v10_cleanup_matrix.md codex_tasks/cleanup/non_v10_inventory.md`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `git status --short`

## Gate Results (Codex fills)

- Lint:
  - N/A (no changed JS/TS files under `v10/`)
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
- `ls` confirmed target md files are absent (`No such file or directory`).
- `test -d oc_tools` returned `missing`.
- `README.md` no longer references removed local runtime notes file.
- Cleanup matrix/inventory no longer include `oc_tools` path.
- Mid-stage verification PASS.

Notes:
- Structure changes were root-only; `v10/AI_READ_ME_MAP.md` regeneration not required (map scope is `v10` only).
