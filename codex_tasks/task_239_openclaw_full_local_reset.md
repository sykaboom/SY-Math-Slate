# Task 239: OpenClaw Full Local Reset (Repo + Home)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remove OpenClaw-generated root artifacts from this repository and delete the local OpenClaw home directory at `/home/sykab/.openclaw`.
  - Stop any currently running `openclaw` process to prevent regeneration.
  - Disable and remove user-level OpenClaw auto-start service, and uninstall globally installed `openclaw` package.
- What must NOT change:
  - Do not touch `v10/` source/application files.
  - Do not delete unrelated dotfiles or home directories.

---

## Scope (Base Required)

Touched files/directories:
- `HEARTBEAT.md`
- `IDENTITY.md`
- `SOUL.md`
- `TOOLS.md`
- `USER.md`
- `/home/sykab/.openclaw/` (entire directory)
- `/home/sykab/.config/systemd/user/openclaw-gateway.service`
- `codex_tasks/task_239_openclaw_full_local_reset.md`

Out of scope:
- Any production app code in `v10/`
- Existing roadmap/spec files other than this task spec
- Git history rewrite

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Use only shell/system cleanup commands; no code refactor.
  - Minimize deletion scope to explicit OpenClaw paths only.
- Compatibility:
  - Repository runtime behavior should remain unchanged except removal of OpenClaw side-effects.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-CLEANUP
- Depends on tasks:
  - []
- Enables tasks:
  - Stable repo hygiene without OpenClaw artifact regeneration
- Parallel group:
  - G3-infra
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid` (changed-lint + script checks)

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES / NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: YES / NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Root OpenClaw artifact files (`HEARTBEAT.md`, `IDENTITY.md`, `SOUL.md`, `TOOLS.md`, `USER.md`) are removed.
- [x] AC-2: `/home/sykab/.openclaw` no longer exists.
- [x] AC-3: No running `openclaw` process remains after cleanup.
- [x] AC-4: `openclaw-gateway.service` is disabled/inactive and removed from user systemd config.
- [x] AC-5: Global npm package `openclaw` is uninstalled.
- [x] AC-6: `git status --short` shows only intended deletions/spec updates for this task.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: `ls -1 HEARTBEAT.md IDENTITY.md SOUL.md TOOLS.md USER.md`
   - Expected result: all files report not found
   - Covers: AC-1

2) Step:
   - Command / click path: `test -d /home/sykab/.openclaw && echo exists || echo missing`
   - Expected result: `missing`
   - Covers: AC-2

3) Step:
   - Command / click path: `ps -ef | rg -i openclaw | rg -v rg`
   - Expected result: no running OpenClaw process lines
   - Covers: AC-3

4) Step:
   - Command / click path: `systemctl --user list-units --type=service --all | rg -i openclaw` and `test -f ~/.config/systemd/user/openclaw-gateway.service && echo exists || echo missing`
   - Expected result: no active OpenClaw service; service file missing
   - Covers: AC-4

5) Step:
   - Command / click path: `npm ls -g --depth=0 | rg -i openclaw`
   - Expected result: no match
   - Covers: AC-5

6) Step:
   - Command / click path: `git status --short`
   - Expected result: only planned file deletions + this spec file change
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - OpenClaw local settings/sessions are fully removed and not recoverable unless backup exists.
  - If a non-user-level service manager reinstalls/restarts OpenClaw, artifacts may regenerate.
- Roll-back:
  - Restore deleted repo files from git if needed.
  - Reinstall/reconfigure OpenClaw manually if future reuse is required.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message requesting full deletion of OpenClaw from repo and `/home/`.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_239_openclaw_full_local_reset.md`
- Deleted local untracked repo artifacts:
  - `HEARTBEAT.md`
  - `IDENTITY.md`
  - `SOUL.md`
  - `TOOLS.md`
  - `USER.md`
- Deleted local home paths:
  - `/home/sykab/.openclaw/`
  - `/home/sykab/.config/systemd/user/openclaw-gateway.service`

Commands run (only if user asked or required by spec):
- `ps -ef | rg -i 'openclaw|claw'`
- `kill <openclaw-pid>`
- `rm -f HEARTBEAT.md IDENTITY.md SOUL.md TOOLS.md USER.md`
- `systemctl --user stop/disable/mask openclaw-gateway.service`
- `rm -f /home/sykab/.config/systemd/user/openclaw-gateway.service`
- `systemctl --user daemon-reload`
- `npm uninstall -g openclaw`
- `rm -rf /home/sykab/.openclaw`
- verification commands for file/process/service/package/git-status checks

## Gate Results (Codex fills)

- Lint:
  - N/A (non-code cleanup task)
- Build:
  - N/A (non-code cleanup task)
- Script checks:
  - N/A (non-code cleanup task)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None observed
- Blocking:
  - NO
- Mitigation:
  - Not required

Manual verification notes:
- AC-1 PASS: target root files not found.
- AC-2 PASS: `/home/sykab/.openclaw` missing.
- AC-3 PASS: no `openclaw` process found.
- AC-4 PASS: no `openclaw` systemd user unit loaded; service file missing.
- AC-5 PASS: no global npm `openclaw` package.
- AC-6 PASS: `git status --short` only shows expected untracked task spec files.

Notes:
- Initial cleanup attempt showed auto-regeneration by `systemd --user` service; resolved by disabling/removing service and uninstalling global package.
