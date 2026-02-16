# Task 260: AI_READ_ME Directory Map Sync with Current v10 Tree

Status: APPROVED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Update `v10/AI_READ_ME.md` so its directory map and rule notes match the current `v10/src` structure.
  - Clarify Prisma-generated path wording to match actual repo state (`src/generated/prisma` local ignored artifact).
- What must NOT change:
  - No runtime code changes under `v10/src`.
  - No behavior, API, contract, or dependency changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_260_ai_read_me_directory_sync.md`
- `v10/AI_READ_ME.md`

Out of scope:
- Any source code changes in `v10/src/**`
- `v10/AI_READ_ME_MAP.md` generation logic changes
- New scripts/dependencies

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Documentation-only sync.
  - Keep governance/SSOT statements untouched except for factual directory/rule alignment.
- Compatibility:
  - Keep current read flow and architecture intent stable; only align factual drift.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - DOC-SYNC
- Depends on tasks:
  - []
- Enables tasks:
  - Accurate architecture reference for future specs/reviews
- Parallel group:
  - G-doc
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

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `v10/AI_READ_ME.md` directory map explicitly includes currently tracked feature domains that were missing (`features/editor-core`, `features/shortcuts`).
- [ ] AC-2: Prisma-related guardrail wording no longer conflicts with current repo reality (local ignored `src/generated/prisma` path).
- [ ] AC-3: `node scripts/gen_ai_read_me_map.mjs` runs successfully and no unintended map drift remains after sync.
- [ ] AC-4: Diff scope is limited to this task file and `v10/AI_READ_ME.md`.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md` directory map section.
   - Expected result: includes `features/editor-core/` and `features/shortcuts/`.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect Prisma rule bullet in `v10/AI_READ_ME.md`.
   - Expected result: wording reflects ignored local `src/generated/prisma` without contradicting tracked architecture.
   - Covers: AC-2

3) Step:
   - Command / click path: `node scripts/gen_ai_read_me_map.mjs`
   - Expected result: command succeeds; no additional diff created unexpectedly.
   - Covers: AC-3

4) Step:
   - Command / click path: `git status --short`
   - Expected result: changed files limited to declared scope.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-correcting wording may weaken architecture guardrail intent.
- Roll-back:
  - Revert this task commit to restore prior document text.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user message "응. 업데이트해줘."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_260_ai_read_me_directory_sync.md`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `find v10/src -maxdepth 3 -type d | sort`
- `git ls-tree -d -r --name-only HEAD:v10/src`
- `node scripts/gen_ai_read_me_map.mjs`
- `bash scripts/check_layer_rules.sh`
- `git status --short`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`node scripts/gen_ai_read_me_map.mjs`, `bash scripts/check_layer_rules.sh`)

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
- AC-1 PASS: directory map now includes `features/editor-core/` and `features/shortcuts/`.
- AC-2 PASS: Prisma wording clarified to avoid conflict with ignored local generated path.
- AC-3 PASS: map generation script succeeded with no additional required diff.
- AC-4 PASS: scope limited to this task file and `v10/AI_READ_ME.md`.

Notes:
- This is a documentation synchronization task only; no runtime/code behavior changed.
