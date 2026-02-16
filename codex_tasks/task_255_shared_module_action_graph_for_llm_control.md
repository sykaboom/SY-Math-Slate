# Task 255: Shared Module Action Graph for LLM Control

Status: COMPLETED
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

## Action Graph Schema Spec (Task 255 Deliverable)

### Canonical shape

```json
{
  "actionGraphVersion": "1.0",
  "moduleId": "string",
  "actions": [
    {
      "id": "string",
      "label": "string",
      "calls": ["command.id"],
      "mutates": ["state.domain.path"],
      "requiresApproval": false,
      "undoCommand": "command.id|null",
      "surface": ["toolbar|panel|commandPalette|automation|background"]
    }
  ]
}
```

### Field contract

- `calls`
  - Type: `string[]` (command IDs in execution order).
  - Meaning: explicit downstream command bus targets invoked by this action.
  - Rule: must be deterministic and stable across runs for same action version.
- `mutates`
  - Type: `string[]` (state domains, stores, or persisted document paths).
  - Meaning: what data/state can change if the action succeeds.
  - Rule: list only writable domains; read-only dependencies do not belong here.
- `requiresApproval`
  - Type: `boolean | { reason: string; level: "soft" | "hard"; approver?: string }`.
  - Meaning: whether user/agent approval is required before execution.
  - Rule: `true` or object must be used for destructive, costly, or irreversible actions.
- `undoCommand`
  - Type: `string | null`.
  - Meaning: command ID that attempts semantic rollback.
  - Rule: use `null` if rollback is impossible or intentionally unsupported.
- `surface`
  - Type: `("toolbar" | "panel" | "commandPalette" | "automation" | "background")[]`.
  - Meaning: where/how the action can be triggered.
  - Rule: include all valid entry points to help LLM planners choose safe invocation context.

### Examples

Example A (light-generated module metadata):

```json
{
  "actionGraphVersion": "1.0",
  "moduleId": "light.note-tools",
  "actions": [
    {
      "id": "insertTimestamp",
      "label": "Insert Timestamp",
      "calls": ["doc.insertTextAtCursor"],
      "mutates": ["document.content"],
      "requiresApproval": false,
      "undoCommand": "doc.undoLastInsert",
      "surface": ["toolbar", "commandPalette"]
    }
  ]
}
```

Example B (heavy-imported module metadata):

```json
{
  "actionGraphVersion": "1.0",
  "moduleId": "heavy.export-pipeline",
  "actions": [
    {
      "id": "exportPdfToDisk",
      "label": "Export PDF",
      "calls": ["export.renderPdf", "fs.writeFile"],
      "mutates": ["export.jobs", "filesystem.userSelectedPath"],
      "requiresApproval": {
        "reason": "Writes external file",
        "level": "hard"
      },
      "undoCommand": null,
      "surface": ["panel", "automation"]
    }
  ]
}
```

### Compatibility notes

- Light-generated and heavy-imported modules must emit the same top-level shape (`actionGraphVersion`, `moduleId`, `actions[]`).
- Command bus integration: values in `calls` and `undoCommand` map to manifest/registry command IDs, not function names.
- Backward compatibility defaults:
  - Missing `requiresApproval` => `false`.
  - Missing `undoCommand` => `null`.
  - Missing `surface` => `["commandPalette"]` for conservative planning.
- Forward compatibility: unknown extra fields must be ignored by readers; `actionGraphVersion` governs parser branching.

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

- [x] AC-1: Action graph schema includes `calls`, `mutates`, `requiresApproval`, `undoCommand`, `surface`.
- [x] AC-2: Schema supports both light-generated and heavy-imported modules.
- [x] AC-3: Graph readability target is suitable for LLM planning without source-code inspection.

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
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_255_shared_module_action_graph_for_llm_control.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_255_shared_module_action_graph_for_llm_control.md`
- `apply_patch` (update Task 255 spec and closeout blocks)

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
- Verified required schema fields are explicitly defined under "Field contract" and present in both examples (`calls`, `mutates`, `requiresApproval`, `undoCommand`, `surface`).
- Verified compatibility section covers both light-generated and heavy-imported tracks using identical canonical shape.
- Verified examples are planner-readable without source inspection: each action states invoked commands, mutation targets, approval requirement, rollback path, and invocation surfaces.

Notes:
- Scope lock respected: only Task 255 spec file updated.
- No runtime code or dependency changes.
