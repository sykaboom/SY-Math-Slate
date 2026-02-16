# Task 257: Dual-Mode Modding GUI Spec (Light Prompt Mode + Heavy Builder Mode)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Complete the dual-mode modding GUI information architecture on one runtime transaction surface:
    - Light Prompt Mode: request/prompt-first authoring for novice-safe flow
    - Heavy Builder Mode: module/package-first authoring for expert flow
  - Define deterministic mode-switch safety and context-preservation rules.
  - Anchor layout expectations to authoritative SVG/redline artifacts already available in `design_drafts/`.
- What must NOT change:
  - Do not split runtime transaction contracts by mode.
  - Do not edit runtime code.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_257_dual_mode_modding_gui_spec.md`

Out of scope:
- Final UI implementation under `v10/src/**`
- Backend/API implementation
- Any new layout artifact generation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Authoring affordances are mode-specific, but transaction semantics are shared.
  - Light mode must remain code-free and correction-loop safe (`task_251`, `task_252` contract inputs).
  - Heavy mode must expose capability/action visibility with explicit safety gates (`task_254`, `task_255`).
  - All persistent apply/rollback operations must follow `task_256` state machine.
- Compatibility:
  - Depends on `task_252`, `task_254`, `task_255`, `task_256`.
  - Preserves `task_250` invariants: explicit approval, identical rollback semantics, command-only mutation path.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M3-UX
- Depends on tasks:
  - [`task_252`, `task_254`, `task_255`, `task_256`]
- Enables tasks:
  - [`task_258`]
- Parallel group:
  - G-ux
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Authoritative artifacts referenced:
- `design_drafts/layout_task238_window_shell_master.svg` (`viewBox="0 0 1440 1080"`)
- `design_drafts/layout_task238_768x1024.svg` (`viewBox="0 0 768 1024"`)
- `design_drafts/layout_task238_820x1180.svg` (`viewBox="0 0 820 1180"`)
- `design_drafts/layout_task238_1024x768.svg` (`viewBox="0 0 1024 768"`)
- `design_drafts/layout_task238_1180x820.svg` (`viewBox="0 0 1180 820"`)
- `design_drafts/layout_task238_redlines.json`
- `design_drafts/layout_task238_redlines.md`
- `design_drafts/layout_mode_transition_map_1440x1080.svg` (`state_canvas_mode`, `state_input_mode`, explicit transition actions)

Numeric redline anchors consumed by this UX spec:
- Top/bottom chrome: `60px` each
- Launcher: `56x56`, offset `24px`
- Touch target minimum: `44x44`
- DataInput bounds: min `320x240`, max `640x800`
- ToolbarAux bounds: min `240x56`, max `480x56`
- Tablet safe-region formulas and drag-clamp bounds follow Task 238 canonical redlines.

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

- [x] Applies: YES (task-spec contract finalized)

If YES:
- [x] Structure changes (file/folder add/move/delete):
  - Not applicable (single spec file update only)
- [x] Semantic/rule changes:
  - Dual-mode IA, shared transaction surface contract, and mode-switch safety rules are fully specified here.

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Light mode flow fits novice behavior (`request -> dry-run preview -> approve`) with no code/module editing exposure.
- [x] AC-2: Heavy mode exposes module import/build/debug controls, capability policy status, and action graph visibility with explicit safety labels.
- [x] AC-3: Both modes share one runtime transaction surface (`preview/apply/rollback/audit`) mapped to `task_256` lifecycle states.
- [x] AC-4: Mode-switch rules preserve intended context while blocking unsafe state/token leakage across tracks.
- [x] AC-5: Layout/SVG gate is closed with authoritative artifacts and tablet viewport constraints.

---

## Dual-Mode GUI Contract (Normative)

### Runtime IA Structure

One runtime shell contains three stable regions:
1. Authoring Region (mode-specific)
   - Light Prompt Mode panel set OR Heavy Builder Mode panel set.
2. Shared Transaction Surface (mode-agnostic)
   - Preview summary, approval status, apply/rollback controls, audit entrypoint.
3. Global Safety Header
   - Explicit mode switch control and state badge (`light` or `heavy`), plus unsaved/context status.

### Light Prompt Mode (Novice Path)

Primary lane (left-to-right):
1. Prompt Composer
   - Natural-language goal input.
2. Constraint Chips / Guided Form
   - Bounded fields from light intent/correction loop contract.
3. Dry-Run + Diff Preview Cards
   - Deterministic preview from `task_251`/`task_256`.
4. Handoff to Shared Transaction Surface
   - User approval required before any apply request is emitted.

Hard constraints:
- No raw module source, script text, or package internals shown.
- Failure remediation stays within guided prompt/form language.
- Retry loops remain bounded and escalate safely after cap.

### Heavy Builder Mode (Expert Path)

Primary lane (left-to-right):
1. Module Package Workspace
   - Import/create package, schema validation state.
2. Capability Policy Panel
   - Requested capabilities, grant state, deny/default visibility (`task_254`).
3. Action Graph Inspector
   - `calls`, `mutates`, `requiresApproval`, `undoCommand`, `surface` (`task_255`).
4. Build/Debug Console
   - Deterministic validation and policy reject codes.
5. Handoff to Shared Transaction Surface
   - Same preview/approval/apply/rollback flow as light mode.

Hard constraints:
- Approval-sensitive actions are labeled before handoff.
- Capability escalation remains explicit and auditable.
- No alternate direct write path bypassing transaction protocol.

### Shared Transaction Surface (Single Runtime Contract)

This surface is identical for both modes and binds to `task_256` lifecycle:
- Preview stage:
  - show `previewHash`, summary counts, base/candidate revision.
- Approval stage:
  - explicit `approve` / `reject`, token bound to hash/revision/attempt.
- Apply stage:
  - one atomic apply path via command bus.
- Rollback stage:
  - idempotent rollback command path from applied state only.
- Audit stage:
  - event timeline link for state transitions and decision provenance.

Surface invariants:
- Transaction controls do not fork by mode.
- Active transaction identity (`txId`, `attemptNo`) is single-source for both tracks.
- Any attempt regeneration invalidates prior approval token regardless of mode origin.

---

## Mode-Switch Safety and Context Preservation (Normative)

### Switch Trigger and Guard Rules

1. Mode switch must be explicit user action only.
2. Implicit escalation/de-escalation is forbidden (prompt complexity cannot auto-switch to heavy).
3. Switch is blocked while transaction state is:
   - `APPLYING`
   - `ROLLBACK_PENDING`
   - `RECOVERY_PENDING`
4. During `APPROVAL_PENDING` or `PREVIEW_READY`, switch requires explicit user decision:
   - keep draft and switch
   - discard draft and switch
   - stay in current mode
5. If preview/apply contract becomes stale after switch, transaction surface enforces re-preview.

### Context Preservation Matrix

Preserved across mode switches:
- Document/session identity and selected target surface.
- Last deterministic preview metadata (`txId`, `attemptNo`, `previewHash`, summary).
- User-visible transaction audit cursor/filter.
- Mode-local draft snapshots (light intent draft, heavy package workspace draft).

Not preserved (must not leak across modes):
- Heavy capability escalation transient decisions/prompt states into light UI.
- Heavy-only sensitive diagnostics or raw package internals into light UI.
- Light correction-loop transient prompt internals into heavy build console.
- Expired/invalid approval tokens or stale idempotency keys.

Cross-mode safety constraints:
- Apply action remains unavailable until active mode rebind confirms current preview validity.
- Rollback availability depends only on transaction state (`APPLIED`), never on mode.
- Permission model remains role/policy-driven, not mode-driven.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect "Light Prompt Mode (Novice Path)" section.
   - Expected result: novice path is prompt/form guided, no code-level controls.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect "Heavy Builder Mode (Expert Path)" section.
   - Expected result: module/package/capability/action-graph controls are explicit and safety-labeled.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect "Shared Transaction Surface" section.
   - Expected result: one preview/approval/apply/rollback/audit contract for both tracks.
   - Covers: AC-3

4) Step:
   - Command / click path: inspect "Mode-Switch Safety and Context Preservation" section.
   - Expected result: blocked states, explicit switch decisions, and no-leak matrix are deterministic.
   - Covers: AC-4

5) Step:
   - Command / click path: inspect Optional Block A artifact list and numeric anchors.
   - Expected result: canonical SVG/redline sources and tablet constraints are fully referenced.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Dual-surface visibility can still create cognitive load if mode badges are weak.
  - Stale preview confusion can occur if users switch modes during long draft sessions.
  - Capability/policy diagnostics could accidentally drift into light mode rendering if boundaries are not enforced in implementation.
- Roll-back:
  - Temporarily lock UI to Light Prompt Mode + shared transaction preview-only flow.
  - Hide Heavy Builder entrypoint behind explicit feature flag while preserving transaction surface.
  - Force mode switch to require draft discard until implementation proves safe context rebinding.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User instruction in chat on 2026-02-16: "You own Task 257 only (Wave 7 UX)."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_257_dual_mode_modding_gui_spec.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_257_dual_mode_modding_gui_spec.md`
- `rg --files design_drafts codex_tasks | rg -n "257|dual|modding|wave.?7|prompt|builder|svg|layout"`
- `rg -n "Task 257|task_257|dual-mode|modding GUI|Wave 7" codex_tasks design_drafts PROJECT_BLUEPRINT.md PROJECT_CONTEXT.md`
- `sed -n '1,320p' codex_tasks/task_252_light_user_auto_responsive_adaptation.md`
- `sed -n '1,360p' codex_tasks/task_254_heavy_user_module_capability_sandbox.md`
- `sed -n '1,260p' codex_tasks/task_255_shared_module_action_graph_for_llm_control.md`
- `sed -n '1,320p' codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`
- `sed -n '320,380p' codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`
- `sed -n '90,190p' codex_tasks/task_250_dual_track_modding_program_governance.md`
- `sed -n '1,220p' design_drafts/layout_task238_redlines.md`
- `sed -n '1,220p' design_drafts/layout_task238_redlines.json`
- `sed -n '1,220p' design_drafts/layout_mode_transition_map_1440x1080.svg`
- `rg -n "viewBox|state_canvas_mode|state_input_mode|action_open_drafting_room|action_return_to_canvas" design_drafts/layout_mode_transition_map_1440x1080.svg design_drafts/layout_task238_window_shell_master.svg design_drafts/layout_task238_768x1024.svg design_drafts/layout_task238_820x1180.svg design_drafts/layout_task238_1024x768.svg design_drafts/layout_task238_1180x820.svg`
- `apply_patch` (complete Task 257 spec and closeout sections)

## Gate Results (Codex fills)

- Lint:
  - N/A (doc-only task)
- Build:
  - N/A (doc-only task)
- Script checks:
  - N/A (doc-only task)

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
- AC-1 PASS: Light mode contract remains prompt/form guided and explicitly excludes raw code/module editing.
- AC-2 PASS: Heavy mode contract includes package workspace, capability policy, action graph metadata, and deterministic debug signals.
- AC-3 PASS: Shared transaction surface is defined once and mapped to `task_256` states for both tracks.
- AC-4 PASS: Mode-switch blocking states, explicit switch decisions, and no-leak context matrix are now explicit.
- AC-5 PASS: Layout gate references canonical Task 238 SVG/redline pack and includes required tablet viewport and numeric anchors.

Notes:
- Scope lock respected: only this task file was modified.
- No runtime code edits were made.
