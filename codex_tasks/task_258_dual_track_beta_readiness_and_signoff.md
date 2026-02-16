# Task 258: Dual-Track Beta Readiness and Signoff

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Define measurable beta readiness gates for the dual-track modding program.
  - Specify separate success metrics for Light and Heavy tracks.
  - Define shared safety SLO gates and final go/no-go rubric.
- What must NOT change:
  - Do not implement runtime changes in this task.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`

Out of scope:
- Feature implementation
- Marketing/release operations outside engineering signoff

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Signoff metrics must be measurable and reproducible from existing task artifacts/audit events.
  - Safety SLO gates are hard blockers and cannot be waived in beta signoff.
- Compatibility:
  - Depends on `task_252`, `task_254`, `task_256`, `task_257`.
  - Uses metric hooks from `task_251` and `task_253` without changing their contracts.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M4-SIGNOFF
- Depends on tasks:
  - [`task_252`, `task_254`, `task_256`, `task_257`]
- Enables tasks:
  - []
- Parallel group:
  - G-release
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

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

- [x] Applies: YES (task-spec signoff contract finalized)

If YES:
- [x] Structure changes (file/folder add/move/delete):
  - Not applicable (single spec file update only)
- [x] Semantic/rule changes:
  - Dual-track KPI/SLO definitions, shared safety gates, and release go/no-go rubric completed in this task file.

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Light-track success metrics and heavy-track success metrics are defined separately.
- [x] AC-2: Shared safety metrics include approval compliance, deterministic rollback success rate, and production-traffic policy-violation zero tolerance with an explicitly tagged controlled-fixture evidence channel.
- [x] AC-3: Final signoff checklist includes go/no-go decision rubric.

---

## Beta Readiness Measurement Contract (Normative)

### 1) Measurement Window and Minimum Sample Floors

Signoff window:
- Rolling 7 consecutive days immediately before beta decision.

Minimum sample floors (required before any go/no-go call):
- Light track:
  - `>= 60` light intents total.
  - `>= 15` intents each for `web`, `tablet`, `mobile` target classes.
- Heavy track:
  - `>= 30` heavy module sessions.
  - `>= 20` approval-sensitive heavy action attempts.
- Shared transactional/safety coverage:
  - `>= 40` approval-required transaction attempts.
  - `>= 10` rollback attempts eligible under `S-SLO-2` denominator taxonomy/filters.
  - `>= 3` rollback attempts with `eventClass=capability_reject_after_partial_apply`; these may be sourced from `controlled_fixture` channel when production traffic does not naturally yield enough safe evidence.

Required evidence sources (existing contracts only):
- `task_251`: `dryrun.report.v1.json`, `preview.diff.v1.json`, correction loop outcomes.
- `task_252`: `responsive.adaptation.report.v1.json`.
- `task_253`: module import result envelopes.
- `task_254`: capability escalation and rollback audit events.
- `task_256`: transaction lifecycle/audit events (`APPROVAL_PENDING`, `APPLIED`, `REJECTED`, `FAILED_TERMINAL`, rollback states).
- `task_257`: mode/track labeling context for event partitioning.

Canonical shared-safety tagging (required for reproducible signoff aggregation):
- `eventKey`: `txId:attemptNo` (single-count rollback episode key).
- `evidenceChannel`: `prod_traffic` or `controlled_fixture`.
- `eventClass` (rollback denominator only): `capability_reject_after_partial_apply` or `planned_drill`.
- `drillId`: required when `eventClass=planned_drill`.
- `fixtureRunId`, `fixtureCaseId`, `expectedOutcome`: required when `evidenceChannel=controlled_fixture`.
- Any missing required tag is an evidence-integrity failure and forces `NO-GO` via rubric item 6.

### 2) Light Track Success Metrics (KPI/SLO Gates)

`L-KPI-1: Adaptation Determinism Pass Rate`
- Formula:
  - `count(light intents where aggregate.allTargetsDeterministic=true) / count(all evaluated light intents)`
- Required threshold:
  - `100%`
- No-go trigger:
  - Any non-deterministic evaluated light intent in signoff window.

`L-KPI-2: Reachability + Recoverability Pass Rate`
- Formula:
  - `count(light intents where all targetResults have launcherReachable=true, closeRecoverReachable=true, and aggregate.allTargetsRecoverableOrBlockedSafe=true) / count(all evaluated light intents)`
- Required threshold:
  - `100%`
- No-go trigger:
  - Any light intent violating launcher reachability or close/recover reachability invariants.

`L-KPI-3: Guided Correction Exhaustion Rate`
- Formula:
  - `count(light intents ending blocked after retry cap) / count(all light intents entering correction loop)`
- Required threshold:
  - `<= 2.0%`
- No-go trigger:
  - Exhaustion rate above threshold or any unbounded correction-loop behavior (retry cap violation).

`L-SLO-4: Light Transaction Terminal Health`
- Formula:
  - `count(light attempts from APPROVAL_PENDING reaching APPLIED or REJECTED without FAILED_TERMINAL) / count(light attempts entering APPROVAL_PENDING)`
- Required threshold:
  - `>= 99.5%`
  - plus hard condition: `FAILED_TERMINAL count = 0`
- No-go trigger:
  - Any `FAILED_TERMINAL` in light track or aggregate below threshold.

### 3) Heavy Track Success Metrics (KPI/SLO Gates)

`H-KPI-1: Valid Package Import Pass Rate`
- Formula:
  - `count(valid certification corpus packages returning code=imported) / count(valid certification corpus import attempts)`
- Required threshold:
  - `100%`
- No-go trigger:
  - Any valid certification package failing deterministic import.

`H-KPI-2: Invalid Package Deterministic Reject Consistency`
- Formula:
  - `count(repeated invalid fixtures where first failure code+path remain stable across reruns) / count(all repeated invalid fixtures)`
- Required threshold:
  - `100%`
- No-go trigger:
  - Any drift in first deterministic reject code/path for identical invalid fixture inputs.

`H-KPI-3: Heavy Action-Graph Completeness`
- Formula:
  - `count(heavy actions exposing required fields calls, mutates, requiresApproval, undoCommand, surface with schema-valid types) / count(all heavy actions in signoff corpus)`
- Required threshold:
  - `100%`
- No-go trigger:
  - Any heavy action missing required control fields.

`H-SLO-4: Heavy Transaction Terminal Health`
- Formula:
  - `count(heavy attempts from APPROVAL_PENDING reaching APPLIED or REJECTED without FAILED_TERMINAL) / count(heavy attempts entering APPROVAL_PENDING)`
- Required threshold:
  - `>= 99.5%`
  - plus hard condition: `FAILED_TERMINAL count = 0`
- No-go trigger:
  - Any `FAILED_TERMINAL` in heavy track or aggregate below threshold.

### 4) Shared Safety Metrics (Hard SLO Gates)

`S-SLO-1: Approval Compliance`
- Formula:
  - `count(approval-sensitive apply attempts with valid explicit approval token bound to txId+attemptNo+previewHash+baseRevision) / count(all approval-sensitive apply attempts)`
- Required threshold:
  - `100%`
- Source contracts:
  - `task_254` escalation audit + `task_256` approval token binding/audit.
- No-go trigger:
  - Any approval bypass, missing approval event, or token mismatch.

`S-SLO-2: Rollback Success Rate (Deterministic Denominator)`
- Formula:
  - `count(rollback episodes with eventKey=txId:attemptNo, eventClass in {capability_reject_after_partial_apply, planned_drill}, evidenceChannel in {prod_traffic, controlled_fixture}, and terminalState=ROLLED_BACK) / count(rollback episodes with eventKey=txId:attemptNo, eventClass in {capability_reject_after_partial_apply, planned_drill}, evidenceChannel in {prod_traffic, controlled_fixture}, and rollback_started observed)`
- Denominator taxonomy/filters (all required):
  1. Episode is counted once per unique `eventKey=txId:attemptNo`.
  2. `rollback_started` timestamp is inside the signoff window.
  3. `eventClass=planned_drill` rows must carry canonical `drillId`.
  4. `evidenceChannel=controlled_fixture` rows must carry `fixtureRunId`, `fixtureCaseId`, and `expectedOutcome`.
  5. Rows missing required tags are not silently dropped; they are treated as evidence-integrity failures and cause `NO-GO` via rubric item 6.
- Required threshold:
  - `100%`
- Source contracts:
  - `task_254` rollback events + `task_256` rollback state transitions.
- No-go trigger:
  - Any rollback failure (`rollback_failed`, `FAILED_TERMINAL`, or unresolved recovery timeout).

`S-SLO-3: Policy-Violation Zero Tolerance (Production Traffic)`
- Formula:
  - `count(capability-policy-violation events where evidenceChannel=prod_traffic in signoff window)`
- Required threshold:
  - `0` (absolute)
- Controlled test-fixture evidence channel rule:
  - `capability-policy-violation` events tagged `evidenceChannel=controlled_fixture` are allowed only as explicit fixture evidence and must include `fixtureRunId`, `fixtureCaseId`, and `expectedOutcome=policy_violation_expected`.
  - Controlled-fixture policy-violation events do not count against the production zero-tolerance numerator.
- Source contracts:
  - `task_254` deterministic reject code stream.
- No-go trigger:
  - Any production-channel policy violation count above zero.
  - Any untagged policy-violation event.
  - Any controlled-fixture policy-violation event missing required fixture tags or expected-outcome marker.

---

## Final Go/No-Go Rubric (Normative)

### Mandatory Gate Checklist

All items must be `PASS` for `GO`:
1. Sample floors from Section 1 are met.
2. Light track gates `L-KPI-1..3` and `L-SLO-4` pass.
3. Heavy track gates `H-KPI-1..3` and `H-SLO-4` pass.
4. Shared safety hard SLOs `S-SLO-1..3` pass.
5. No `FAILED_TERMINAL` events in either track during signoff window.
6. Evidence artifacts are complete, reproducible, and traceable to source contracts (`task_251/252/253/254/256/257`).

Decision rule:
- `GO`:
  - All mandatory checklist items are `PASS`.
- `NO-GO`:
  - Any checklist item is `FAIL`, `UNKNOWN`, or lacks reproducible evidence.

Operational hold behavior on `NO-GO`:
- Keep beta flag OFF.
- Restrict program to preview-only/non-release path until failed gate is corrected and signoff window is re-run.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect "Light Track Success Metrics" and "Heavy Track Success Metrics" sections.
   - Expected result: each track has separate KPI/SLO formulas, thresholds, and explicit no-go triggers.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect "Shared Safety Metrics (Hard SLO Gates)" section.
   - Expected result: approval compliance, deterministic rollback denominator filters, and production-only policy-violation zero tolerance with explicit controlled-fixture channel constraints are measurable with strict thresholds.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect "Final Go/No-Go Rubric (Normative)" section.
   - Expected result: mandatory gate checklist and deterministic decision rule are complete.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incomplete or non-reproducible audit artifacts can hide real regressions during beta gating.
  - Sample floors not met can create false confidence from under-observed scenarios.
- Roll-back:
  - Keep beta flag off until all mandatory gates pass in a fresh 7-day window.
  - Enforce preview-only mode if any shared safety hard gate fails.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User instruction in chat on 2026-02-16: "You own Task 258 documentation completion..."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`
- `sed -n '300,470p' codex_tasks/task_252_light_user_auto_responsive_adaptation.md`
- `sed -n '1,340p' codex_tasks/task_254_heavy_user_module_capability_sandbox.md`
- `sed -n '1,360p' codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`
- `nl -ba codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`
- `apply_patch` (complete Task 258 metric gates, rubric, and closeout sections; corrective patch for AC-2 contradictions and rollback reproducibility)

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
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: Light and Heavy tracks now have separate KPI/SLO gate sets with explicit formulas, thresholds, and no-go triggers.
- AC-2 PASS: Shared safety SLO gates now explicitly require 100% approval compliance, deterministic rollback denominator taxonomy/filters, and zero policy violations on production traffic while allowing tightly tagged controlled-fixture evidence.
- AC-3 PASS: Final signoff rubric now defines mandatory checklist items and deterministic GO vs NO-GO decision outcomes.

Notes:
- Scope lock respected: only this task file was modified.
- No runtime/code changes and no dependency changes.
- 2026-02-16 corrective patch applied: resolved AC-2 contradiction between rollback scenario coverage and policy-violation zero tolerance, and made rollback denominator reproducible with canonical taxonomy/filters.
