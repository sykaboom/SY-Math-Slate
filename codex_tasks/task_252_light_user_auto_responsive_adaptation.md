# Task 252: Light User Auto-Responsive Adaptation (Web/Mobile/Tablet)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Define a deterministic auto-responsive adaptation contract for light-user requests across `web`, `tablet`, and `mobile`.
  - Translate Task 238 canonical redlines into reusable adaptation rules and formulas.
  - Define explicit conflict resolver priorities and fallback/recoverability guarantees.
- What must NOT change:
  - Do not require manual per-device layout authoring by light users.
  - Do not edit runtime code.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_252_light_user_auto_responsive_adaptation.md`

Out of scope:
- Heavy-user advanced module controls
- Runtime implementation under `v10/src/**`
- Beta signoff rubric authoring (`task_258` owns final signoff policy)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adaptation output stays JSON-safe manifest/policy data only.
  - No executable content or direct mutation path.
  - Touch target and control reachability are non-negotiable hard constraints.
- Compatibility:
  - Input contract must accept `intent.normalized.v1` from `task_251_light_user_intent_to_manifest_pipeline.md`.
  - Redline constants must come from Task 238 canonical pack:
    - `design_drafts/layout_task238_redlines.json`
    - `design_drafts/layout_task238_redlines.md`
  - Output must provide measurable adaptation results consumable by `task_258_dual_track_beta_readiness_and_signoff.md`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M2-LIGHT
- Depends on tasks:
  - [`task_251`]
- Enables tasks:
  - [`task_258`]
- Parallel group:
  - G-light
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

Status note:
- Task 252 consumes Task 238 promoted canonical redlines and does not produce new layout drafts.

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
  - Deterministic adaptation and conflict/fallback contracts completed in this task file

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Deterministic adaptation rules are fully specified for `web`, `tablet`, and `mobile`, including formulas and canonical viewport handling.
- [x] AC-2: Conflict resolver defines strict priority order, deterministic tie-breakers, and no ambiguous outcomes.
- [x] AC-3: Fallback/recoverability guarantees preserve launcher visibility and close/reopen reachability under degradations.
- [x] AC-4: Input/output compatibility is explicit for upstream `task_251` and downstream `task_258`.

---

## Deterministic Auto-Responsive Adaptation Contract

### 1) Input Contract (from Task 251)

Required upstream artifact:
- `intent.normalized.v1.json`

Required fields used by adaptation:
- `schemaVersion` (must be `light.intent.v1`)
- `intentId`
- `targets.surface`
- `constraints.deviceTargets` (subset of `["web","tablet","mobile"]`)
- `constraints.must`
- `constraints.mustNot`
- `safety.denyByDefault` (must be `true`)
- `safety.requiresApproval` (must be `true`)

Normalization rules (deterministic):
1. De-duplicate and sort `constraints.deviceTargets` using canonical order: `web`, `tablet`, `mobile`.
2. If `constraints.deviceTargets` is empty, default to `["web","tablet","mobile"]`.
3. Reject unknown device labels with `E_ADAPT_DEVICE_TARGET_INVALID` (recoverable through Task 251 correction loop).
4. No adaptation output is emitted for targets excluded from normalized `deviceTargets`.

### 2) Task 238 Redline Constants (authoritative)

Constants:
- `topChromeHeightPx = 60`
- `bottomChromeHeightPx = 60`
- `launcherSizePx = 56`
- `launcherOffsetPx = 24`
- `dragClampInsetPx = 16`
- `touchTargetMinPx = 44`
- `dataInputWindowedMin = 320x240`
- `dataInputWindowedMax = 640x800`
- `toolbarAuxMin = 240x56`
- `toolbarAuxMax = 480x56`

Derived formulas:
- `safeRegion = { x:0, y:60, width:W, height:H-120 }`
- `launcherAnchor = { x:24, y:H-140, width:56, height:56 }`
- `dragClampBounds = { x:16, y:76, width:W-32, height:H-152 }`
- `maxX = clampBounds.x + clampBounds.width - panel.width`
- `maxY = clampBounds.y + clampBounds.height - panel.height`

Hard reachability invariants:
- launcher target: always visible and tapable at `56x56`
- close/recover controls: always at least `44x44`

### 3) Device Adaptation Matrix (deterministic)

#### A. `web` target profile

Profile ID:
- `web.windowed_dual.v1`

Reference viewport:
- `1440x1080` (Task 238 master shell context)

Rule set:
1. Start from Task 238 windowed defaults:
   - DataInput: `x:100 y:150 w:320 h:400`
   - ToolbarAux: `x:450 y:150 w:240 h:56`
2. Clamp all panel rects to `dragClampBounds`.
3. Enforce touch targets (`>=44x44`) for close/recover controls.
4. If overlap with launcher or close/recover zones occurs, hand off to conflict resolver.

#### B. `tablet` target profile

Profile ID:
- `tablet.docked_dual.v1`

Required canonical viewport set (Task 238):
- `768x1024`, `820x1180`, `1024x768`, `1180x820`

Deterministic docked formulas for any tablet viewport (`768 <= W <= 1180`):
- DataInput: `x=W-320, y=60, w=320, h=H-120`
- ToolbarAux: `x=0, y=H-116, w=W-320, h=56`

Notes:
- Formula reproduces Task 238 numeric docked defaults exactly for the four canonical viewports.
- `dataInputWindowedMax.height=800` applies to windowed mode only; tablet docked mode uses full `safeRegion.height` by design.

#### C. `mobile` target profile

Profile ID:
- `mobile.single_panel_recoverable.v1`

Deterministic mode:
- `maxConcurrentPanels = 1`
- launcher is always visible at Task 238 anchor formula

Panel behavior:
1. Default state: panels collapsed, launcher visible.
2. DataInput open state (sheet):
   - `x:0, y:60, w:W, h:H-120`
3. ToolbarAux open state:
   - `x:0, y:H-116, w:W, h:56`
4. If both are requested simultaneously, DataInput remains open and ToolbarAux is collapsed to launcher recover action.

Reasoning:
- Keeps close/reopen controls reachable on narrow screens.
- Preserves deterministic behavior without requiring per-device manual tuning.

### 4) Conflict Resolver Priority Rules

Resolver ID:
- `responsive.conflict_resolver.v1`

Priority order (highest first):
1. Policy safety locks from Task 251:
   - `denyByDefault=true`
   - `requiresApproval=true`
2. Recoverability invariants:
   - launcher visible
   - close/recover targets `>=44x44`
3. Task 238 hard geometry constraints:
   - chrome heights
   - anchor offsets
   - drag clamp formulas
4. Device profile state rules:
   - web dual windowed
   - tablet dual docked
   - mobile single-panel
5. User constraints:
   - `mustNot` (harder)
   - `must` (next)
6. Cosmetic/default preferences.

Deterministic resolution sequence:
1. Clamp panel rects to `dragClampBounds`.
2. Repair touch target violations by resizing controls to `44x44` minimum.
3. Resolve launcher occlusion before any other overlap (launcher anchor is reserved).
4. Resolve secondary panel conflicts first:
   - attempt ToolbarAux reposition
   - if unresolved, collapse ToolbarAux to launcher recover
5. Resolve primary panel conflicts:
   - switch DataInput to docked/sheet mode for target
   - if unresolved, collapse DataInput and keep recover action in launcher
6. If invariants still fail, emit blocked adaptation and halt apply handoff.

Tie-breakers (strict):
1. Candidate satisfying higher-priority rules wins.
2. If tied, candidate with larger visible canvas safe area wins.
3. If tied, candidate with fewer state transitions wins.
4. If tied, choose lexical-min candidate ID.

No random/stochastic path is permitted.

### 5) Fallback and Recoverability Guarantees

Recovery states:
- `normal`
- `degraded_recoverable`
- `blocked_safe`

Guarantees:
1. Launcher visibility guarantee:
   - launcher anchor remains reachable in all non-blocked states.
2. Recover action guarantee:
   - every collapsed/hidden panel has a launcher recover action.
3. Close-action guarantee:
   - open panel close target always remains `>=44x44` and reachable.
4. Safe-fail guarantee:
   - if unrecoverable, emit `blocked_safe`, do not emit apply-ready package.
5. State-preservation guarantee:
   - prior successful manifest state remains unchanged on blocked adaptation.

Failure codes:
- `E_ADAPT_DEVICE_TARGET_INVALID` (recoverable)
- `E_ADAPT_TOUCH_TARGET_BREACH` (recoverable)
- `E_ADAPT_PANEL_COLLISION_UNRESOLVED` (recoverable up to retry cap)
- `E_ADAPT_POLICY_LOCK_VIOLATION` (non-recoverable in light flow)
- `E_ADAPT_UNRECOVERABLE_GEOMETRY` (non-recoverable for current intent)

Task 251 loop integration:
- Recoverable failures must return bounded corrective prompts (max 3 retries per intent).
- Non-recoverable failures must return blocked packet with no partial apply path.

### 6) Output Artifacts and Task 258 Handoff

Primary adaptation artifact:
- `responsive.adaptation.v1.json`
  - `schemaVersion`
  - `intentId`
  - `targets`
  - `profilesByTarget`
  - `resolvedLayoutRules`
  - `resolutionStatusByTarget`
  - `failureCodes` (if any)

Signoff/report artifact for Task 258:
- `responsive.adaptation.report.v1.json`
  - `schemaVersion`
  - `intentId`
  - `targetResults[]`:
    - `target`
    - `profileId`
    - `resolutionStatus` (`normal | degraded_recoverable | blocked_safe`)
    - `conflictCount`
    - `recoverabilityPass` (boolean)
    - `launcherReachable` (boolean)
    - `closeRecoverReachable` (boolean)
    - `deterministicHash`
  - `aggregate`:
    - `allTargetsDeterministic`
    - `allTargetsRecoverableOrBlockedSafe`

Determinism hash rule:
- Hash canonical JSON serialization (stable key order + canonical array order) of per-target resolved rules.
- Identical input intent and viewport class must produce identical hash.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review sections "Task 238 Redline Constants" and "Device Adaptation Matrix".
   - Expected result: web/tablet/mobile outputs are formula-based and deterministic; tablet canonical viewports are explicitly covered.
   - Covers: AC-1

2) Step:
   - Command / click path: review "Conflict Resolver Priority Rules".
   - Expected result: strict priority, ordered resolution sequence, and tie-breakers remove ambiguity.
   - Covers: AC-2

3) Step:
   - Command / click path: review "Fallback and Recoverability Guarantees".
   - Expected result: launcher visibility and close/reopen reachability are guaranteed or system enters blocked-safe mode.
   - Covers: AC-3

4) Step:
   - Command / click path: review "Input Contract (from Task 251)" and "Output Artifacts and Task 258 Handoff".
   - Expected result: upstream input fields and downstream signoff metrics are explicitly contract-compatible.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Mobile sheet-mode assumptions may require additional UX policy tuning during runtime implementation.
  - Future changes to Task 238 redlines would require this contract to be re-baselined.
  - Over-constrained conflict resolution may increase blocked-safe outcomes for ambiguous intents.
- Roll-back:
  - Revert to tablet-only deterministic adaptation while keeping launcher and reachability invariants mandatory.
  - Keep non-tablet targets in preview-only mode until updated redlines are approved.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

Delegated approval reference:
- User instruction in chat on 2026-02-16: "You own Task 252 only (Wave 6 light branch)..."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_252_light_user_auto_responsive_adaptation.md`

Commands run (only if user asked or required by spec):
- `ls -1 codex_tasks`
- `sed -n '1,320p' codex_tasks/task_252_light_user_auto_responsive_adaptation.md`
- `sed -n '1,320p' codex_tasks/task_238_clean_start_shell_and_panel_launcher.md`
- `sed -n '1,560p' codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`
- `sed -n '1,320p' codex_tasks/task_258_dual_track_beta_readiness_and_signoff.md`
- `sed -n '1,260p' design_drafts/layout_task238_redlines.md`
- `sed -n '1,260p' design_drafts/layout_task238_redlines.json`
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
- AC-1 PASS: deterministic formulas and per-target profiles are explicit; tablet canonical viewports from Task 238 are fully mapped.
- AC-2 PASS: resolver priorities, ordered steps, and tie-breakers are defined without ambiguous branches.
- AC-3 PASS: fallback states and recoverability guarantees enforce launcher visibility and close/reopen reachability or blocked-safe halt.
- AC-4 PASS: Task 251 input contract and Task 258 signoff-report outputs are explicitly documented.

Notes:
- Scope lock respected: only Task 252 spec file was modified.
- No runtime code edits and no dependency changes.
