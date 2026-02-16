# Task 254: Heavy User Module Capability Sandbox

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify capability-scoped sandbox policy for imported heavy-user modules.
  - Define permission prompts, default deny behavior, and resource boundaries.
- What must NOT change:
  - Do not weaken existing approval policy.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_254_heavy_user_module_capability_sandbox.md`

Out of scope:
- Module package format definition
- Runtime implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Capabilities must be explicit, enumerable, and auditable.
  - Unlisted capability usage is rejected by default.
- Compatibility:
  - Consumes ABI from `task_253` (`HeavyModulePackageV1.capabilitiesRequested`).
  - Provides safety contract outputs consumed by `task_258` signoff metrics (approval compliance, policy-violation zero tolerance, rollback success).

---

## Capability Sandbox Contract (Normative v1)

### Capability source and normalization

- Source-of-truth input:
  - `task_253` package field `capabilitiesRequested: string[]` (optional in package, normalized at policy layer).
- Normalization rules:
  - Missing `capabilitiesRequested` => treat as `[]`.
  - Normalize by trim, deduplicate, and stable sort ascending.
  - Empty strings and non-string values are invalid shape and remain covered by `task_253` import ABI (`invalid-capability-shape`).
- Semantic policy evaluation (this task) runs after `task_253` structural validation succeeds.

### Explicit capability catalog (allowlist only)

Only the following capability IDs are valid in v1:

1. `ui.slot.render`
   - Scope: render declarative UI entries already validated by plugin manifest rules (`task_253`).
   - Hard limits: no custom script execution, no new slot classes, no direct DOM mutation outside manifest-declared surfaces.
2. `state.read`
   - Scope: read current document/session state snapshots and selection metadata.
   - Hard limits: read-only; no mutation side effects.
3. `state.write.tx`
   - Scope: request persistent mutation commands through the shared transaction protocol only.
   - Hard limits: cannot bypass command bus approval/queue policy; no direct write path.
4. `module.storage.local`
   - Scope: JSON-safe, module-scoped key/value storage.
   - Hard limits: module namespace isolation; no cross-module reads/writes; no executable payloads.
5. `export.user.file`
   - Scope: export artifacts to user-selected destinations.
   - Hard limits: no silent path writes, no background overwrite, explicit user-selected target required.
6. `automation.invoke`
   - Scope: invoke module actions from approved automation/background surfaces.
   - Hard limits: same command policy as interactive path; no hidden escalation channel.

Non-catalog IDs are invalid and must be rejected deterministically. Wildcards (`*`), prefixes, aliases, and implicit capability expansion are forbidden.

### Default deny and grant model

- Default state is deny-all for every catalog capability.
- A capability is usable only when all conditions are true:
  1. Requested in `capabilitiesRequested`.
  2. Valid catalog ID.
  3. Explicitly granted by user through escalation flow.
  4. Grant is still valid for the active module identity.
- Grant identity key:
  - `(moduleId, moduleVersion, capabilityId, grantScope, approverIdentity)`.
- Grant invalidation rules:
  - Any `moduleVersion` change invalidates prior grants for that capability.
  - Any catalog major revision (future `capabilityCatalogVersion` bump) invalidates stale grants.
  - Deleted/expired grants immediately revert to deny.
- No silent fallback:
  - If grant is missing/invalid, action is rejected; system must not auto-grant or auto-retry with broadened scope.

### Permission escalation flow (explicit approval + audit required)

Deterministic escalation state flow:

1. `capability_check_started`
   - Build required capability set for the attempted action.
2. `capability_check_passed`
   - If all required capabilities already granted and valid, continue execution.
3. `capability_escalation_required`
   - If one or more required capabilities are missing, block execution and raise prompt.
4. `capability_escalation_decision`
   - Allowed user decisions:
     - `approve_session` (expires at session end).
     - `approve_persistent` (stored grant, version-bound).
     - `deny`.
   - `cancel` or prompt timeout is treated as `deny` (fail-closed).
5. `capability_escalation_result`
   - On approval: record grant and continue.
   - On denial: deterministic reject; no partial apply.

Mandatory audit record fields for each request/decision:

- `eventId` (unique)
- `timestampUtc` (ISO-8601)
- `moduleId`
- `moduleVersion`
- `capabilityId`
- `actionId` (if known from action graph metadata)
- `transactionId` (if action is inside transaction flow)
- `decision` (`requested|approved|denied|timeout|rejected`)
- `decisionReasonCode`
- `approverIdentity`
- `approverRole`
- `grantScope` (`session|persistent|none`)
- `grantVersion` (catalog/schema version at decision time)

Mandatory audit event names:

- `capability.escalation.requested`
- `capability.escalation.approved`
- `capability.escalation.denied`
- `capability.check.rejected`
- `capability.rollback.executed`
- `capability.rollback.failed`

### Deterministic reject and rollback behavior

#### Reject code contract (policy layer)

Capability policy checks must return one deterministic code:

- `capability-unknown-id`
- `capability-not-requested`
- `capability-not-granted`
- `capability-grant-stale`
- `capability-escalation-denied`
- `capability-escalation-timeout`
- `capability-policy-violation`

#### Enforcement behavior by execution stage

1. Import-time capability semantic failure:
   - Result: import reject, no module registration, no partial side effects.
2. Pre-apply/preview-time failure:
   - Result: reject action before mutation, transaction remains no-op.
3. In-transaction failure after partial mutation began:
   - Result: force rollback using shared rollback contract (`task_256`), emit rollback audit events.
   - Success path code: `capability-policy-violation` + rollback outcome `rolled_back`.
   - Failure path code: `capability-policy-violation` + rollback outcome `rollback_failed` and block further applies until operator intervention.

#### Determinism guarantees

- First-failure wins with stable validation order:
  1. Catalog membership
  2. Request presence
  3. Grant validity
  4. Escalation decision state
  5. Execution-time policy checks
- No probabilistic/heuristic allow decisions.
- No partial capability success inside one action; any required capability failure rejects whole action.

### Task 258 signoff metric hooks

This spec provides direct metric inputs for `task_258`:

- Approval compliance:
  - Derived from escalation decision audit events.
  - Required threshold for signoff: 100% explicit approval on approval-sensitive paths.
- Rollback success rate after capability-triggered reject:
  - Derived from `capability.rollback.executed` vs `capability.rollback.failed`.
  - Required threshold for signoff: 100% successful rollback for reject-after-partial-apply scenarios.
- Policy-violation zero tolerance:
  - `capability-policy-violation` must be zero in beta signoff windows.
  - Any non-zero count is immediate no-go until root cause and corrective action are complete.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M2-HEAVY
- Depends on tasks:
  - [`task_253`]
- Enables tasks:
  - [`task_258`]
- Parallel group:
  - G-heavy
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

- [x] AC-1: Capability catalog and default deny behavior are fully defined.
- [x] AC-2: Permission escalation path requires explicit user approval with audit trace.
- [x] AC-3: Sandbox breach attempts map to deterministic failure and rollback behavior.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect capability catalog.
   - Expected result: each capability has clear scope and limits.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect permission escalation flow.
   - Expected result: escalation always requires explicit approval.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect failure handling section.
   - Expected result: deterministic reject + rollback path is defined.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-broad capability requests can create approval fatigue and operator error.
  - Missing or dropped audit events can undermine signoff metrics and traceability.
  - Rollback failure handling can become operationally blocking if not exercised in staging.
- Roll-back:
  - Force strict deny-all profile for all heavy modules.
  - Temporarily disable heavy-module action execution while preserving import read-only inspection.
  - Route all capability-rejected transactions to hard block until policy/audit pipeline is stable.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User instruction in chat on 2026-02-16: "You own Task 254 only (Wave 6 heavy branch)."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_254_heavy_user_module_capability_sandbox.md`

Commands run (only if user asked or required by spec):
- `sed -n '1,260p' codex_tasks/task_254_heavy_user_module_capability_sandbox.md`
- `rg --files codex_tasks | rg 'task_253|task_258'`
- `sed -n '1,260p' codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`
- `sed -n '1,260p' codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`
- `sed -n '261,520p' codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`
- `rg -n "task_254|capability sandbox|capabilitiesRequested|approval compliance|rollback" codex_tasks`
- `rg -n "heavy module|capability" codex_tasks/task_25*.md`
- `sed -n '1,240p' codex_tasks/task_250_dual_track_modding_program_governance.md`
- `sed -n '1,260p' codex_tasks/task_256_shared_transactional_apply_preview_rollback.md`
- `sed -n '1,260p' codex_tasks/task_257_dual_mode_modding_gui_spec.md`
- `sed -n '1,320p' codex_tasks/task_255_shared_module_action_graph_for_llm_control.md`
- `rg --files | rg 'PROJECT_BLUEPRINT.md|PROJECT_CONTEXT.md'`
- `sed -n '1,260p' PROJECT_BLUEPRINT.md`
- `sed -n '1,260p' PROJECT_CONTEXT.md`
- `apply_patch` (complete Task 254 capability sandbox spec + closeout)

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
- AC-1: Verified v1 capability catalog is explicit, finite, and coupled to default deny + grant invalidation rules.
- AC-2: Verified escalation flow is deterministic, user-approval-driven, fail-closed on timeout/cancel, and includes mandatory audit schema/event names.
- AC-3: Verified reject code contract and stage-based rollback behavior are explicitly mapped, including partial-apply rollback and failure blocking behavior.

Notes:
- Compatibility preserved with `task_253`: semantic policy consumes existing `capabilitiesRequested` ABI without changing package structure.
- Compatibility preserved for `task_258`: audit and rollback outputs are explicitly defined for approval-compliance, rollback-success, and zero-violation signoff metrics.
- Scope lock respected: only this task file was modified; no runtime code edits.
