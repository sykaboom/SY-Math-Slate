# Task 259: Portable Codex Skills Full Sync (Local -> Repo)

Status: APPROVED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Mirror the currently used local Codex skills set from `/home/sykab/.codex/skills` into repo `codex_skills/` so other environments can reproduce the same skill context.
  - Include `.system` built-in skill metadata currently present in local skills.
- What must NOT change:
  - Do not modify runtime app code under `v10/src`.
  - Do not add new npm/pip dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_259_portable_codex_skills_full_sync.md`
- `codex_skills/.system/**` (new or update)
- `codex_skills/README.md` (new; clone-and-install guide)
- `codex_skills/sy-slate-architecture-guardrails/**` (new or update)
- `codex_skills/sy-slate-crossapp-exchange/**` (update if drift)
- `codex_skills/sy-slate-protocol-compat/**` (update if drift)
- `codex_skills/sy-slate-render-sandbox/**` (update if drift)
- `codex_skills/sy-slate-tool-registry-mcp/**` (update if drift)
- `codex_skills/sy-slate-spec-batch-factory/**` (retain)
- `codex_skills/sy-slate-subagent-orchestration/**` (retain)
- `scripts/sync_codex_skills.sh` (no logic change expected; verify behavior only)

Out of scope:
- Any feature implementation tasks (`task_236+`)
- `~/.codex/skills` deletion/cleanup

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep skill files plain and portable; avoid machine-specific absolute paths inside copied skills.
  - Preserve existing repo skills not present in local set unless explicit user request to remove.
- Compatibility:
  - `scripts/sync_codex_skills.sh --dry-run` must still work with expanded `codex_skills/`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - INFRA-SKILL-PORT
- Depends on tasks:
  - []
- Enables tasks:
  - Portable setup in fresh environments via `scripts/sync_codex_skills.sh --apply`
- Parallel group:
  - G-infra
- Max parallel slots:
  - 6 (default)
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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `codex_skills/` contains all local skill entries currently used in `/home/sykab/.codex/skills` including `.system`.
- [ ] AC-2: Existing repo-only skills (`sy-slate-spec-batch-factory`, `sy-slate-subagent-orchestration`) remain present.
- [ ] AC-3: `codex_skills/README.md` documents clone-and-install commands for new environments.
- [ ] AC-4: `scripts/sync_codex_skills.sh --dry-run` reports valid sync plan from repo `codex_skills/` without errors.
- [ ] AC-5: No changes outside `codex_tasks/`, `codex_skills/`, and existing `scripts/` docs/scripts.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: compare top-level entries between `codex_skills/` and `/home/sykab/.codex/skills`.
   - Expected result: local set is included in repo set.
   - Covers: AC-1

2) Step:
   - Command / click path: list `codex_skills/sy-slate-spec-batch-factory` and `codex_skills/sy-slate-subagent-orchestration`.
   - Expected result: both exist after sync.
   - Covers: AC-2

3) Step:
   - Command / click path: open `codex_skills/README.md`
   - Expected result: clear clone-and-install steps (`sync` and `bootstrap`) are documented.
   - Covers: AC-3

4) Step:
   - Command / click path: `scripts/sync_codex_skills.sh --dry-run`
   - Expected result: command succeeds and prints sync operations.
   - Covers: AC-4

5) Step:
   - Command / click path: `git status --short`
   - Expected result: changed files limited to this task scope.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Large local skill trees may add files not intended for sharing.
  - `.system` skill contents may differ from future Codex defaults.
- Roll-back:
  - Revert this commit to restore prior `codex_skills/` state.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message requesting all skills/scripts to be pushed for portability.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_259_portable_codex_skills_full_sync.md`
- `codex_skills/.system/.codex-system-skills.marker`
- `codex_skills/.system/skill-creator/SKILL.md`
- `codex_skills/.system/skill-creator/license.txt`
- `codex_skills/.system/skill-installer/SKILL.md`
- `codex_skills/.system/skill-installer/LICENSE.txt`
- `codex_skills/README.md`
- `codex_skills/sy-slate-architecture-guardrails/SKILL.md`
- `codex_skills/sy-slate-architecture-guardrails/references/guardrails.md`
- `codex_skills/sy-slate-architecture-guardrails/scripts/check_layer_rules.sh`
- `codex_skills/sy-slate-architecture-guardrails/scripts/scan_guardrails.sh`
- `codex_skills/sy-slate-protocol-compat/SKILL.md` (updated from local runtime copy)
- `codex_skills/sy-slate-tool-registry-mcp/SKILL.md` (updated from local runtime copy)

Commands run (only if user asked or required by spec):
- Mirror local skills into repo bundle:
  - `rsync -a --delete /home/sykab/.codex/skills/<entry>/ codex_skills/<entry>/`
- Validation:
  - top-level entry comparison (`find ... -maxdepth 1`)
  - presence check for repo-only retained skills
  - `bash scripts/sync_codex_skills.sh --dry-run`
  - `git status --short`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`scripts/sync_codex_skills.sh --dry-run`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - Not required

Manual verification notes:
- AC-1 PASS: local skill entries (`.system`, `sy-slate-*` runtime set) are now present in `codex_skills/`.
- AC-2 PASS: repo-only entries (`sy-slate-spec-batch-factory`, `sy-slate-subagent-orchestration`) remain.
- AC-3 PASS: `codex_skills/README.md` added with clone-and-install commands.
- AC-4 PASS: dry-run sync succeeded and listed planned operations.
- AC-5 PASS: changed scope limited to `codex_tasks/` + `codex_skills/`.

Notes:
- Kept existing `codex_skills/sy-slate-architecture-guardrails.skill` archive file for backward compatibility; active portable directory copy was added under `codex_skills/sy-slate-architecture-guardrails/`.
