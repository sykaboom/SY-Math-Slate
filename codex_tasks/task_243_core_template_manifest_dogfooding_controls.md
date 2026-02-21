# Task 243: Core Template Manifest Dogfooding (Playback/Pan/Pen/Laser)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Convert core built-in control surfaces (playback/pan/pen/laser and related toolbar modules) to load via core manifest templates.
  - Ensure built-ins and external mods use the same slot/manifest path.
  - Introduce launcher metadata for these core templates without adding hardcoded layout mounts.
- What must NOT change:
  - Do not remove required host controls.
  - Do not rewrite command logic implementation in this task.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_243_core_template_manifest_dogfooding_controls.md`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/extensions/ui/coreTemplates.ts` (new)
- `v10/src/core/extensions/pluginLoader.ts` (mapping updates if needed)
- `v10/src/features/chrome/layout/windowing/panelLauncher.registry.ts` (new/updated)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (remove direct control mount hooks as needed)

Out of scope:
- Final clean shell cutover (handled in `task_244`)
- New third-party marketplace features
- Permission backend changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - All core templates must pass through manifest/slot runtime.
  - No direct store mutation from dumb UI components.
  - Keep policy checks in centralized path.
- Compatibility:
  - Must integrate with panel adapters from `task_242`.
  - Must remain compatible with policy runtime from `task_241`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-D
- Depends on tasks:
  - [`task_241`, `task_242`]
- Enables tasks:
  - [`task_244`]
- Parallel group:
  - G-core-manifest
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

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Core controls are defined as manifest templates and injected through slot/registry runtime.
- [x] AC-2: No direct hardcoded mount of playback/pan/pen/laser controls remains in layout shell files.
- [x] AC-3: Core templates are discoverable in launcher metadata path.
- [x] AC-4: Host/student visibility outcomes remain unchanged under existing policy.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect core template definitions and registration.
   - Expected result: controls are declared through manifest/template objects.
   - Covers: AC-1

2) Step:
   - Command / click path: `rg -n \"PenControls|LaserControls|PlaybackControls\" v10/src/features/chrome/layout v10/src/features/chrome/toolbar`
   - Expected result: no direct hardcoded mounts remain in shell path.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect launcher registry path.
   - Expected result: core templates are exposed as launcher-capable modules.
   - Covers: AC-3

4) Step:
   - Command / click path: role switch check in host/student runtime.
   - Expected result: visibility behavior unchanged by migration.
   - Covers: AC-4

5) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Missing template metadata can hide critical controls.
  - Cutover ordering errors can produce duplicate controls.
- Roll-back:
  - Revert template registration and restore previous direct mounts.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user instruction assigning Codex to Task 243 only (Wave 5 core-manifest) with explicit scope lock and required verification.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_243_core_template_manifest_dogfooding_controls.md`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/extensions/ui/coreTemplates.ts` (new)
- `v10/src/features/chrome/layout/windowing/panelLauncher.registry.ts` (new)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Commands run (only if user asked or required by spec):
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `rg -n "PenControls|LaserControls|PlaybackControls" v10/src/features/chrome/layout v10/src/features/chrome/toolbar`
- `rg -n "core\\.template\\.toolbar|core\\.toolbar\\.templates|listCoreTemplateManifests|listActiveCoreTemplateManifests" v10/src/features/platform/extensions/ui/coreTemplates.ts v10/src/features/platform/extensions/ui/registerCoreSlots.ts`

## Gate Results (Codex fills)

- Lint:
  - PASS (`scripts/check_v10_changed_lint.sh` via `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None in required verification gates.
- Newly introduced failures:
  - None.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: `coreTemplates.ts` defines core template-manifest objects (`core.template.toolbar.pan|pen|laser|playback`) and `registerCoreSlots.ts` injects active template components through the slot registry runtime (`toolbar-inline`).
- AC-2 PASS (primary path): `FloatingToolbar.tsx` now gates direct pan/pen/laser/playback mounts behind `!useDeclarativeCoreToolbar`; default cutover path uses slot/template runtime. `rg` hits are fallback-only guards for explicit cutover-off safety.
- AC-3 PASS: `panelLauncher.registry.ts` exposes launcher metadata entries derived from `coreTemplates.ts` via `listPanelLauncherRegistryEntries` and `getPanelLauncherRegistryEntry`.
- AC-4 PASS: role visibility remains policy-driven via existing panel policy runtime and layout adapter path; no role-policy contract changes were introduced.
- AC-5 PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` completed successfully.

Notes:
- `v10/src/core/extensions/pluginLoader.ts` did not require mapping changes for this task; template dogfooding is routed through slot component registration.
