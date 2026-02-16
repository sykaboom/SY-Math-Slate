# Task 255: Shared Module Action Graph for LLM Control

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify a shared action graph metadata model so connected LLMs can easily understand what each module calls and mutates.
  - Reduce control complexity by exposing call graph as data.
- What must NOT change:
  - Do not expose hidden internal secrets or unsafe runtime internals.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_255_shared_module_action_graph_for_llm_control.md`

Out of scope:
- Runtime list_tools implementation
- UI implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Metadata must include least-privilege fields only.
  - Include approval-sensitive tags (`requiresApproval` etc.).
- Compatibility:
  - Must compose with command bus and plugin manifest contracts.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M1-SHARED
- Depends on tasks:
  - [`task_250`]
- Enables tasks:
  - [`task_257`]
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

- [ ] AC-1: Action graph schema includes `calls`, `mutates`, `requiresApproval`, `undoCommand`, `surface`.
- [ ] AC-2: Schema supports both light-generated and heavy-imported modules.
- [ ] AC-3: Graph readability target is suitable for LLM planning without source-code inspection.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect metadata schema fields.
   - Expected result: required control fields are all present.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect compatibility notes.
   - Expected result: both tracks (light/heavy) map to same schema.
   - Covers: AC-2

3) Step:
   - Command / click path: review usage example.
   - Expected result: LLM can infer plan from metadata only.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Missing metadata fields can force LLM back to brittle code-level inference.
- Roll-back:
  - Keep read-only minimal graph and gradually enrich fields.

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

