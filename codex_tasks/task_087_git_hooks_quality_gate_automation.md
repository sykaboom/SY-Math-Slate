# Task 087: Git Hooks Quality Gate Automation

Status: COMPLETED
Owner: Codex
Target: repo automation policy
Date: 2026-02-07

## Goal
- What to change:
  - Add versioned git hooks for default quality gates.
  - Ensure `AI_READ_ME_MAP` refresh is automated when `v10/` staged changes exist.
  - Add reusable shell verification runner that executes verification-oriented `.sh` scripts only.
  - Document hook bootstrap in `AGENTS.md`.
- What must NOT change:
  - No production runtime code changes.
  - No dependency additions.
  - No behavior changes outside commit/push automation flow.

## Scope (Codex must touch ONLY these)
- `codex_tasks/task_087_git_hooks_quality_gate_automation.md`
- `AGENTS.md`
- `.githooks/pre-commit`
- `.githooks/pre-push`
- `scripts/run_repo_verifications.sh`

## Acceptance criteria
- [x] `.githooks/pre-commit` exists and is executable.
- [x] `.githooks/pre-push` exists and is executable.
- [x] Pre-commit hook refreshes `v10/AI_READ_ME_MAP.md` when staged changes include `v10/`.
- [x] Pre-commit hook runs scoped lint for staged `v10` JS/TS files.
- [x] Pre-push hook runs build gates for changed app scope (`v10` and/or root legacy).
- [x] Verification `.sh` runner excludes launcher scripts (`run_*`, `dispatch*`) by pattern.
- [x] `AGENTS.md` includes hook bootstrap and references hook behavior.

## Risks / notes
- Risk: Strict hooks can block commits on legacy/pre-existing errors.
- Mitigation: pre-commit lint is scoped to staged `v10` source files.
- Risk: Hook path not configured by default in local clones.
- Mitigation: set `git config core.hooksPath .githooks` and document it.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `codex_tasks/task_087_git_hooks_quality_gate_automation.md`
- `AGENTS.md`
- `.githooks/pre-commit`
- `.githooks/pre-push`
- `scripts/run_repo_verifications.sh`

Commands run:
- `chmod +x .githooks/pre-commit .githooks/pre-push scripts/run_repo_verifications.sh`
- `git config core.hooksPath .githooks`
- `git config --get core.hooksPath`
- `bash -n .githooks/pre-commit`
- `bash -n .githooks/pre-push`
- `bash -n scripts/run_repo_verifications.sh`
- `bash scripts/run_repo_verifications.sh`

Notes:
- Hook path configured in current local clone: `.githooks`
- `scripts/run_repo_verifications.sh` currently reports no matching verification scripts in repo.
