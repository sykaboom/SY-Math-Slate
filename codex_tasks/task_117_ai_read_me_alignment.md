# Task 117: AI_READ_ME Alignment (Store/Execution Path)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Align `v10/AI_READ_ME.md` with current runtime architecture for store boundaries and execution path descriptions.
  - Clarify 3-tier store usage (`useDocStore`, `useSyncStore`, `useLocalStore`) while preserving legacy store notes.
  - Clarify MCP/command-bus vs connector execution path wording.
  - Add missing `toolExecutionPolicy.ts` reference in extension scaffolding section.
- What must NOT change:
  - No runtime code changes.
  - No directory/file structure changes.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_117_ai_read_me_alignment.md`
- `v10/AI_READ_ME.md`

Out of scope:
- Any `v10/src/**` code changes
- `v10/AI_READ_ME_MAP.md` regeneration (no structure change in this task)
- Task 114~116 implementation logic changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Documentation-only update.
  - Must reflect actual implemented behavior in current repository state.
- Compatibility:
  - Keep existing sections readable for contributors already using legacy store terminology.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - N/A (no structure change in this task)
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `Store Schemas` section explicitly documents 3-tier stores (`useDocStore`, `useSyncStore`, `useLocalStore`).
- [x] AC-2: Tool execution flow wording distinguishes command-bus route vs connector adapter route.
- [x] AC-3: `Extension Scaffolding` includes `features/extensions/toolExecutionPolicy.ts`.
- [x] AC-4: No files outside scope are modified.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md` store section
   - Expected result: 3-tier store description present and consistent with current code
   - Covers: AC-1

2) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md` contract/command sections
   - Expected result: command-bus route vs connector route wording no longer ambiguous
   - Covers: AC-2

3) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md` extension scaffolding list
   - Expected result: `toolExecutionPolicy.ts` reference included
   - Covers: AC-3

4) Step:
   - Command / click path: `git status --short`
   - Expected result: only scope files changed
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-editing documentation may introduce new mismatch with implementation.
- Roll-back:
  - Revert this task commit to restore previous docs.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat: "응 진행해.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_117_ai_read_me_alignment.md`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `git status --short`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- `Store Schemas` now contains explicit 3-tier authority section and legacy interaction-store section.
- Contract path wording now distinguishes connector path and MCP command-bus path.
- Extension scaffolding list now includes `toolExecutionPolicy.ts`.
- Scope remained documentation-only.

Notes:
- Documentation-only task.
