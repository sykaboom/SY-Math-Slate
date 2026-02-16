# Task 243: Core Template Manifest Dogfooding (Playback/Pan/Pen/Laser)

Status: PENDING
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
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/extensions/ui/coreTemplates.ts` (new)
- `v10/src/core/extensions/pluginLoader.ts` (mapping updates if needed)
- `v10/src/features/layout/windowing/panelLauncher.registry.ts` (new/updated)
- `v10/src/features/toolbar/FloatingToolbar.tsx` (remove direct control mount hooks as needed)

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

- [ ] AC-1: Core controls are defined as manifest templates and injected through slot/registry runtime.
- [ ] AC-2: No direct hardcoded mount of playback/pan/pen/laser controls remains in layout shell files.
- [ ] AC-3: Core templates are discoverable in launcher metadata path.
- [ ] AC-4: Host/student visibility outcomes remain unchanged under existing policy.
- [ ] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect core template definitions and registration.
   - Expected result: controls are declared through manifest/template objects.
   - Covers: AC-1

2) Step:
   - Command / click path: `rg -n \"PenControls|LaserControls|PlaybackControls\" v10/src/features/layout v10/src/features/toolbar`
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
