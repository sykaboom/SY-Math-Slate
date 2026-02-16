# Task 251: Light User Intent-to-Manifest Pipeline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify a production-ready light-user flow:
    - natural-language request -> validated structured intent -> manifest/policy draft -> dry-run -> deterministic diff preview -> transaction handoff.
  - Define a strict, JSON-only intent schema and normalization rules that avoid direct module code editing.
  - Define a bounded failure-correction loop that keeps light users in guided prompts/forms.
- Ensure light users never need direct module code editing.
- What must NOT change:
  - Do not bypass approval or command bus preflight.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`

Out of scope:
- Heavy-user module packaging
- Runtime implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Generated output must be strict JSON manifest/policy artifacts, never executable strings.
  - Keep deny-by-default policy behavior.
- Compatibility:
  - Inherits governance invariants from `task_250_dual_track_modding_program_governance.md` (`task_250`).
  - Produces normalized light-intent + manifest constraints consumed by `task_252_light_user_auto_responsive_adaptation.md` (`task_252`).
  - Produces dry-run and diff handoff artifacts consumed by `task_256_shared_transactional_apply_preview_rollback.md` (`task_256`).
  - Produces correction-loop UX contract consumed by `task_257_dual_mode_modding_gui_spec.md` (`task_257`).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M1-LIGHT
- Depends on tasks:
  - [`task_250`]
- Enables tasks:
  - [`task_252`, `task_256`, `task_257`]
- Parallel group:
  - G-light
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

- [x] Applies: YES (task-spec contract expanded and finalized)

If YES:
- [x] Structure changes (file/folder add/move/delete):
  - Not applicable (no structure change)
- [x] Semantic/rule changes:
  - Completed in this task file only

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Intent schema captures user request, constraints, target role, success criteria, and policy boundaries in strict JSON.
- [x] AC-2: Pipeline defines mandatory dry-run and deterministic diff preview gates before any apply handoff.
- [x] AC-3: Failure path defines bounded automatic corrective prompts without raw code/module exposure to light users.
- [x] AC-4: Compatibility contracts with `task_250`, `task_252`, `task_256`, and `task_257` are explicit and dependency-consistent.

---

## Intent Schema Contract (Production Spec)

Schema ID:
- `light.intent.v1`

Artifact:
- `LightIntent` (strict JSON object; no comments, functions, HTML, or executable strings)

Required fields:
- `schemaVersion`: string, must equal `"light.intent.v1"`
- `intentId`: string UUID-like token
- `createdAt`: ISO-8601 timestamp (UTC)
- `actor`: object
  - `role`: must equal `"light_user"`
  - `mode`: must equal `"light"`
  - `locale`: BCP-47 language tag (`en-US`, `ko-KR`, etc.)
- `request`: object
  - `rawText`: original natural-language request
  - `normalizedText`: sanitized and normalized request text
  - `goalSummary`: one-sentence deterministic goal summary
- `targets`: object
  - `surface`: enum `["layout","behavior","content","style","mixed"]`
  - `entities`: string array of target IDs or semantic aliases
- `constraints`: object
  - `must`: string array
  - `mustNot`: string array
  - `deviceTargets`: enum array subset of `["web","tablet","mobile"]`
  - `policyLocks`: string array of non-overridable constraints
- `successCriteria`: object
  - `checks`: string array of pass/fail checks
  - `metrics`: optional array of `{ metric, operator, value }`
- `safety`: object
  - `denyByDefault`: boolean (must be `true`)
  - `requiresApproval`: boolean (must be `true`)
  - `rawCodeExposure`: boolean (must be `false`)
- `confidence`: number in range `[0,1]`

Optional fields:
- `clarifications`: array of unresolved questions to ask user before drafting
- `notes`: string array for non-authoritative hints

Example (minimum valid payload):
```json
{
  "schemaVersion": "light.intent.v1",
  "intentId": "intent_251_0001",
  "createdAt": "2026-02-16T09:30:00Z",
  "actor": {
    "role": "light_user",
    "mode": "light",
    "locale": "en-US"
  },
  "request": {
    "rawText": "Make the writing canvas larger and keep close/open easy on tablet.",
    "normalizedText": "Increase canvas area while preserving close/open reachability on tablet layouts.",
    "goalSummary": "Increase writing area without breaking recoverability controls."
  },
  "targets": {
    "surface": "layout",
    "entities": ["canvas", "panel_toggle", "close_button"]
  },
  "constraints": {
    "must": ["close_button always reachable", "launcher remains visible"],
    "mustNot": ["introduce hidden overlays"],
    "deviceTargets": ["tablet"],
    "policyLocks": ["approval_required", "command_bus_only"]
  },
  "successCriteria": {
    "checks": [
      "canvas visibility improves",
      "close/open controls remain reachable"
    ],
    "metrics": [
      { "metric": "tap_target_px", "operator": ">=", "value": 44 }
    ]
  },
  "safety": {
    "denyByDefault": true,
    "requiresApproval": true,
    "rawCodeExposure": false
  },
  "confidence": 0.86
}
```

Validation rules:
1. Reject if any required field missing, null, or wrong type.
2. Reject if `actor.role != light_user` or `actor.mode != light`.
3. Reject if `safety.denyByDefault != true` or `safety.requiresApproval != true`.
4. Reject if `request.normalizedText` is empty after sanitization.
5. Reject if constraint conflict is detected (`must` intersects `mustNot`).
6. Reject if payload contains executable/code-like content in user-visible fields (`<script`, `function(`, `=>`, fenced code blocks).

Normalization rules:
1. Trim whitespace, collapse repeated separators, normalize unicode spacing.
2. Canonicalize entity aliases to stable IDs when known.
3. Sort array fields deterministically (`entities`, `deviceTargets`, `policyLocks`) for stable diff generation.
4. Preserve `rawText` for audit; never use it directly for apply.

---

## Pipeline Contract and Mandatory Gates

State flow (must remain linear except correction loop):
- `INTENT_CAPTURED`
- `INTENT_NORMALIZED`
- `INTENT_VALIDATED`
- `MANIFEST_DRAFTED`
- `POLICY_DRAFTED`
- `DRY_RUN_EXECUTED`
- `DIFF_PREVIEW_READY`
- `APPROVAL_PENDING`
- `READY_FOR_TRANSACTION` (handoff to `task_256`)

Hard gate sequence:
1. `G0_ROLE_MODE_CHECK`:
   - Requires `actor.role=light_user`, `actor.mode=light`.
   - Failure: `E_ROLE_MODE_INVALID` (non-recoverable in light flow; prompt mode switch, no escalation by default).
2. `G1_INTENT_SCHEMA_CHECK`:
   - Validate `LightIntent` schema and normalization outputs.
   - Failure: recoverable via correction loop.
3. `G2_POLICY_PRECHECK`:
   - Enforce deny-by-default policy locks and command-bus-only mutation route.
   - Failure: recoverable only if missing/incorrect constraints; otherwise blocked.
4. `G3_DRAFT_BUILD`:
   - Produce JSON-only `manifest.draft.v1` and `policy.draft.v1`.
   - Failure: recoverable if low confidence; blocked if unsafe generation.
5. `G4_DRY_RUN_REQUIRED`:
   - Simulate effects with zero persistent writes.
   - Failure: recoverable if conflicts are resolvable.
6. `G5_DIFF_REQUIRED`:
   - Build deterministic `preview.diff.v1` from current vs proposed state.
   - Failure: recoverable if instability caused by missing intent fields.
7. `G6_APPROVAL_REQUIRED`:
   - Explicit user approval required before transaction request is emitted.
   - Failure/no approval: stop at preview state, no apply.
8. `G7_TRANSACTION_HANDOFF`:
   - Emit `apply.request.v1` package for transactional engine defined by `task_256`.
   - No direct persistent mutation allowed in this task contract.

Mandatory artifact outputs:
- `intent.normalized.v1.json`
- `manifest.draft.v1.json`
- `policy.draft.v1.json`
- `dryrun.report.v1.json`
- `preview.diff.v1.json`
- `apply.request.v1.json` (created only after explicit approval)

Gate invariants:
- Dry-run and diff are non-skippable for all light-user requests.
- Approval gate is non-skippable for any operation with persistent impact.
- All apply-capable actions are command-bus mediated; no alternate write path.

---

## Dry-Run and Diff Contract

`dryrun.report.v1` minimum fields:
- `dryRunId`
- `intentId`
- `status`: `ok | conflict | denied`
- `checks`: array of named checks with pass/fail
- `warnings`: non-blocking issues
- `blockingIssues`: blocking conflicts requiring correction

`preview.diff.v1` minimum fields:
- `diffId`
- `intentId`
- `summary`: `{ adds, updates, removes, riskLevel }`
- `changes`: ordered array of:
  - `path` (JSON pointer style)
  - `before` (JSON-safe value)
  - `after` (JSON-safe value)
  - `reason` (human-readable sentence)
  - `requiresApproval` (boolean, always true for persistent effects)

Determinism rules:
1. Sort `changes` by canonical path order.
2. Serialize objects with stable key ordering.
3. Treat semantically equal normalized values as no-op (no false-positive diff entries).
4. Generate user-facing previews from diff metadata, never from raw module code.

---

## Failure Correction Loop (No Raw Code Exposure)

Failure classes:
- `E_INTENT_REQUIRED_FIELD_MISSING`
- `E_INTENT_CONSTRAINT_CONFLICT`
- `E_POLICY_DENIED`
- `E_DRYRUN_CONFLICT`
- `E_DIFF_UNSTABLE`
- `E_LOW_CONFIDENCE_PARSE`

Recoverability policy:
- Recoverable: missing fields, clarification needed, resolvable dry-run conflicts, unstable diff from ambiguity.
- Non-recoverable (light flow): role mismatch, unsafe policy violation requiring privileged override, repeated unresolved conflicts after retry cap.

Loop contract:
1. Detect failure and assign one failure code.
2. Build `correction.prompt.v1` with:
   - `userMessage` (plain language, no code snippets)
   - `neededInputs` (specific fields/questions)
   - `options` (2-5 bounded choices when possible)
3. Ask user for correction in light-safe format (prompt/form chips).
4. Re-run from `INTENT_NORMALIZED` state with updated inputs.
5. Max retries: `3` per `intentId`.
6. On retry exhaustion:
   - mark `status=blocked`
   - emit `escalation.packet.v1` for supervised/manual handling
   - keep prior successful state intact (no partial apply)

Light-user safety requirements:
- Never show raw module source, command scripts, or executable patch text.
- Explain failures using goal/constraint language only.
- Keep correction prompts scoped to intent fields and approval decisions.

---

## Handoff Contracts to Downstream Tasks

- To `task_252`:
  - Input: `intent.normalized.v1` + layout/device constraints from `constraints.deviceTargets`.
  - Guarantee: deterministic intent fields for responsive adaptation rules.
- To `task_256`:
  - Input: `manifest.draft.v1`, `policy.draft.v1`, `dryrun.report.v1`, `preview.diff.v1`, explicit approval event.
  - Guarantee: no transaction apply request emitted before `G4/G5/G6` pass.
- To `task_257`:
  - Input: gate names, failure codes, correction prompt schema.
  - Guarantee: UI can render a novice-safe flow without exposing code-level controls.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review "Intent Schema Contract (Production Spec)" and example payload.
   - Expected result: schema contains required fields for request, constraints, role/mode, safety, and success criteria with strict JSON rules.
   - Covers: AC-1

2) Step:
   - Command / click path: review "Pipeline Contract and Mandatory Gates" + "Dry-Run and Diff Contract".
   - Expected result: dry-run and diff are explicit non-skippable gates prior to approval/handoff.
   - Covers: AC-2

3) Step:
   - Command / click path: review "Failure Correction Loop (No Raw Code Exposure)".
   - Expected result: correction loop is bounded, has retry cap and escalation, and forbids raw code/module exposure.
   - Covers: AC-3

4) Step:
   - Command / click path: review "Dependencies / Constraints" compatibility bullets and "Handoff Contracts to Downstream Tasks".
   - Expected result: references to `task_250`, `task_252`, `task_256`, and `task_257` align with declared DAG dependencies and handoff data.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Ambiguous natural-language input can still cause low-confidence normalization loops.
  - Over-constrained policy locks can increase blocked intents and require manual escalation.
  - Diff determinism drift across implementations could cause inconsistent preview cards.
- Roll-back:
  - Restrict light mode to guided template intents only (`surface`, `entities`, `must`, `mustNot`) while preserving mandatory dry-run/diff/approval gates.
  - Disable apply handoff emission and keep preview-only mode until deterministic diff output is restored.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

Delegated approval reference:
- User instruction in chat on 2026-02-16: "You own Task 251 only (Wave 5 light-doc)..."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`

Commands run (only if user asked or required by spec):
- `ls -1`
- `sed -n '1,260p' codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`
- `sed -n '1,220p' codex_tasks/task_250_light_narration_tone_speed_pause.md` (not found)
- `sed -n '1,240p' codex_tasks/task_252_light_export_panel_ai_readiness.md` (not found)
- `sed -n '1,260p' codex_tasks/task_256_light_renderer_failure_policy.md` (not found)
- `sed -n '1,260p' codex_tasks/task_257_light_full_manifest_lifecycle.md` (not found)
- `rg --files codex_tasks | rg 'task_25[0-9]_'`
- `sed -n '1,280p' codex_tasks/task_250_dual_track_modding_program_governance.md`
- `sed -n '1,280p' codex_tasks/task_252_light_user_auto_responsive_adaptation.md`
- `sed -n '1,320p' codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`
- `sed -n '1,300p' codex_tasks/task_257_dual_mode_modding_gui_spec.md`
- `sed -n '1,320p' codex_tasks/_TEMPLATE_task.md`
- `rg -n "light|intent|manifest|dry-run|preview|rollback|command bus|approval" PROJECT_BLUEPRINT.md`
- `rg -n "light|intent|manifest|dry-run|preview|rollback|command bus|approval" PROJECT_CONTEXT.md`
- `sed -n '1,260p' PROJECT_BLUEPRINT.md`
- `sed -n '1,260p' PROJECT_CONTEXT.md`

## Gate Results (Codex fills)

- Lint:
  - N/A (spec-only change)
- Build:
  - N/A (spec-only change)
- Script checks:
  - N/A (spec-only change)

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
- Verified schema and validation rules cover request, role/mode, constraints, success criteria, and safety invariants.
- Verified dry-run and diff are mandatory non-skippable gates prior to approval and transaction handoff.
- Verified failure correction loop includes coded failure taxonomy, retry cap, and no raw code/module exposure.
- Verified compatibility and handoff references are consistent with task IDs and current DAG links (`250 -> 251 -> 252/256/257`).

Notes:
- Scope lock respected: only Task 251 spec file edited.
- No runtime code or dependency changes.
