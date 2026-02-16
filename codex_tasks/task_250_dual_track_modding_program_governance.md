# Task 250: Dual-Track Modding Program Governance (Light + Heavy)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Define a dual-track governance contract where:
    - Light users operate via natural-language intent.
    - Heavy users operate via direct module package/build/import workflows.
  - Enforce one shared safety/runtime contract across both tracks:
    - explicit approval gate
    - transactional preview/apply/rollback
    - command-only mutation choke-point
- What must NOT change:
  - No runtime behavior implementation in this task.
  - No dependencies added.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_250_dual_track_modding_program_governance.md`

Out of scope:
- Runtime code changes under `v10/src`
- UI/UX implementation
- DAG edits to downstream task files (`task_251~258`)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Preserve existing role policy and teacher-in-the-loop invariant.
  - Preserve command-bus ownership of all persistent mutations.
  - Keep approval + rollback semantics uniform across tracks.
- Compatibility:
  - Align with `task_236~246` foundation and promoted task238 SVG pack governance.

---

## Governance Model (Light + Heavy)

### Persona A: Light User (Prompt-First)
- Primary user profile:
  - Non-programmer teacher/creator needing fast, guided customization.
- Allowed authoring surface:
  - Natural-language request, structured form constraints, preview confirmation.
- Default entry flow (non-overlapping):
  1. Enter Modding via Light Mode launcher.
  2. Submit intent request.
  3. System generates structured manifest/policy draft (data only).
  4. User reviews deterministic preview diff.
  5. User approves; system applies through transaction protocol.
- Explicitly not in default path:
  - Direct package import.
  - Raw module ABI editing.
  - Capability grant editing panel.

### Persona B: Heavy User (Builder/Package-First)
- Primary user profile:
  - Advanced builder integrating module packages and explicit capability scopes.
- Allowed authoring surface:
  - Module package author/import, ABI validation, capability declaration.
- Default entry flow (non-overlapping):
  1. Enter Modding via Heavy Mode launcher.
  2. Build or import module package.
  3. Run schema/ABI validation and capability checks.
  4. Review deterministic preview diff.
  5. User approves; system applies through transaction protocol.
- Explicitly not in default path:
  - Prompt-only intent drafting UI.
  - Auto-generated novice wizard controls.

### Cross-Mode Boundary Rules
- Mode entry points are disjoint by default (Light launcher vs Heavy launcher).
- Cross-mode movement requires explicit mode switch action; no implicit escalation.
- Shared apply surface is allowed only at transaction stage; authoring surfaces remain separate.

---

## Shared Invariants (Both Tracks)

1) Approval invariant:
   - No persistent apply without explicit user approval at transaction gate.
   - Approval-sensitive actions must remain auditable.

2) Rollback invariant:
   - Every apply operation must define rollback contract and recovery path.
   - Rollback semantics remain identical regardless of light/heavy origin.

3) Command-only mutation choke-point:
   - All persistent state mutation routes through command bus transactions.
   - Intent outputs and module imports are inputs to commands, never direct mutators.
   - No alternate write path is permitted.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M0-GOV
- Depends on tasks:
  - [`task_240`]
- Enables tasks:
  - [`task_251`, `task_253`, `task_255`]
- Parallel group:
  - G-governance
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

### Downstream DAG Contract (`task_251~258`)
- `task_251` depends on `task_250`; enables `task_252`, `task_256`, `task_257`.
- `task_252` depends on `task_251`; enables `task_258`.
- `task_253` depends on `task_250`; enables `task_254`, `task_256`, `task_257`.
- `task_254` depends on `task_253`; enables `task_258`.
- `task_255` depends on `task_250`; enables `task_257`.
- `task_256` depends on `task_251`, `task_253`; enables `task_257`, `task_258`.
- `task_257` depends on `task_252`, `task_254`, `task_255`, `task_256`; enables `task_258`.
- `task_258` depends on `task_252`, `task_254`, `task_256`, `task_257`; terminal signoff task.

Consistency decision:
- Task 250 enables only first-layer tasks (`251`, `253`, `255`).
- Full chain to `258` is preserved transitively without overlap or cycles.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL (single-owner task execution by Codex)

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES (governance/spec document update only)

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Light/Heavy user personas are explicitly defined with non-overlapping default entry flows.
- [x] AC-2: Shared runtime invariants are documented (approval, rollback, command-only mutation).
- [x] AC-3: Downstream task graph (`task_251~258`) is dependency-consistent and execution-ready.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review Governance Model section.
   - Expected result: light and heavy tracks are clearly separated with disjoint default entry points.
   - Covers: AC-1

2) Step:
   - Command / click path: review Shared Invariants section.
   - Expected result: one approval model, one rollback model, one command-only mutation choke-point.
   - Covers: AC-2

3) Step:
   - Command / click path: compare Downstream DAG Contract in this spec with current `task_251~258` metadata.
   - Expected result: dependencies and transitive chain are consistent and cycle-free.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - If downstream tasks are edited later without updating this governance contract, DAG drift can occur.
  - If mode boundaries are relaxed in implementation tasks, light/heavy UX overlap may regress.
- Roll-back:
  - Revert to prior single-track governance and freeze downstream execution until graph re-validation.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

Delegated approval reference:
- User instruction in chat on 2026-02-16: "You own Task 250 only (Wave 4 branch governance)..."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_250_dual_track_modding_program_governance.md`

Commands run (only if user asked or required by spec):
- `ls -1 codex_tasks`
- `sed -n '1,260p' codex_tasks/task_250_dual_track_modding_program_governance.md`
- `sed -n '1,220p' codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`
- `sed -n '1,220p' codex_tasks/task_252_light_user_auto_responsive_adaptation.md`
- `sed -n '1,220p' codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`
- `sed -n '1,220p' codex_tasks/task_254_heavy_user_module_capability_sandbox.md`
- `sed -n '1,240p' codex_tasks/task_255_shared_module_action_graph_for_llm_control.md`
- `sed -n '1,240p' codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`
- `sed -n '1,220p' codex_tasks/task_257_dual_mode_modding_gui_spec.md`
- `sed -n '1,240p' codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`

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
- Verified light/heavy persona definitions and non-overlapping default entry flows are explicit.
- Verified approval/rollback/command-only mutation invariants are codified as shared cross-track rules.
- Verified downstream DAG mapping is consistent with current `task_251~258` dependency declarations.

Notes:
- Scope lock respected: only Task 250 file changed, no runtime code touched.
