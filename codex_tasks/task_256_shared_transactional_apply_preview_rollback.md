# Task 256: Shared Transactional Apply, Preview, and Rollback

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify one shared transaction protocol for both light and heavy tracks:
    - dry-run preview
    - explicit approval
    - atomic apply
    - rollback
  - Define minimum audit payload for each transaction step.
- What must NOT change:
  - Do not allow direct non-transactional mutation paths.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`

Out of scope:
- Actual transaction engine implementation
- UI rendering

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Every write path must remain command-bus mediated.
  - Approval-required operations cannot bypass queue.
- Compatibility:
  - Consumes intent path (`task_251`) and heavy module import path (`task_253`).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M2-SHARED
- Depends on tasks:
  - [`task_251`, `task_253`]
- Enables tasks:
  - [`task_257`, `task_258`]
- Parallel group:
  - G-shared
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

- [ ] AC-1: Transaction lifecycle states and transitions are fully defined.
- [ ] AC-2: Preview diff format is deterministic and role-aware.
- [ ] AC-3: Rollback contract includes idempotency and failure recovery notes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect lifecycle state table.
   - Expected result: no ambiguous state transitions.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect preview diff schema.
   - Expected result: deterministic before/after data with scope tags.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect rollback contract.
   - Expected result: rollback is explicit, idempotent, and auditable.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Missing transactional boundaries can reintroduce unsafe direct writes.
- Roll-back:
  - Block apply endpoint until full lifecycle contract is enforced.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- (to be filled)

Notes:
- (to be filled)

