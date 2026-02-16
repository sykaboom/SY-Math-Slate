# Task 250: Dual-Track Modding Program Governance (Light + Heavy)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Define the dual-track modding governance model where light users use natural-language requests and heavy users build/import modules directly.
  - Establish shared invariants so both tracks run through one runtime policy and one rollback path.
- What must NOT change:
  - Do not implement runtime behavior in this task.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_250_dual_track_modding_program_governance.md`

Out of scope:
- Runtime code changes under `v10/src`
- UI/UX implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Preserve existing role policy and teacher-in-the-loop invariant.
  - Keep command write path centralized.
- Compatibility:
  - Must align with `task_236~246` chain and promoted task238 SVG gate pack.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M0-GOV
- Depends on tasks:
  - [`task_246`]
- Enables tasks:
  - [`task_251`, `task_253`, `task_255`]
- Parallel group:
  - G-governance
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

- [ ] AC-1: Light/Heavy user personas are explicitly defined with non-overlapping default entry flows.
- [ ] AC-2: Shared runtime invariants are documented (approval, rollback, command-only mutation).
- [ ] AC-3: Downstream task graph (`task_251~258`) is dependency-consistent and execution-ready.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review persona section.
   - Expected result: light and heavy tracks are clearly separated.
   - Covers: AC-1

2) Step:
   - Command / click path: review invariant section.
   - Expected result: one policy path, one rollback path, one mutation choke-point.
   - Covers: AC-2

3) Step:
   - Command / click path: review DAG metadata links.
   - Expected result: downstream tasks are correctly enabled.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Ambiguous governance can cause duplicate implementations between tracks.
- Roll-back:
  - Replace with previous single-track roadmap if required.

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
