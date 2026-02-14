# Task 115: Strict Declarative UI Plugin

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Define and enforce a strict declarative UI plugin contract where extension UI contributions are data-declared, manifest-v1 typed, slot-scoped, and validated before render.
  - Prevent arbitrary imperative runtime/component injection from plugin payloads.
  - Keep plugin UI rendering constrained to whitelist slot/component bindings controlled by app runtime.
- What must NOT change:
  - Existing core UI behavior when no plugin UI contribution is registered.
  - Host/student runtime policy semantics introduced in prior tasks.
  - No new dependency.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_115_strict_declarative_ui_plugin.md`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/core/extensions/registry.ts`
- `v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx` (only if plugin loader wiring requires boot-order update)
- `v10/AI_READ_ME.md` (if runtime flow text changes)
- `v10/AI_READ_ME_MAP.md` (if file map changes)

Out of scope:
- Command bus facade introduction (Task 114)
- MCP-compatible secure gateway enforcement (Task 116)
- External plugin package loading/marketplace/discovery UX
- Layout/SVG redesign

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- `zod` allowed: NO
- Boundary rules:
  - Manifest v1 must be validated through explicit TypeScript type guards in core loader path (no schema library dependency).
  - Plugin UI declarations must be JSON-safe and validated at plugin-loader/registry boundary.
  - Runtime must reject unknown slot names or unknown declarative component IDs unless allowlisted.
  - No function/eval-based execution path from untrusted plugin payload.
- Compatibility:
  - Existing core slot registrations continue to render.
  - Empty/invalid plugin UI declarations must fail closed (no render) without crashing host UI.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 115
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `pluginLoader.ts`
    - Implementer-B: `registry.ts` + `ExtensionSlot.tsx`
    - Implementer-C: `registerCoreSlots.ts` + `ExtensionRuntimeBootstrap.tsx`
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
- [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `pluginLoader.ts` defines Manifest v1 contract and explicit type guards (`isPluginManifestV1`) with deterministic failures.
- [x] AC-2: Plugin loader enforces strict whitelist (`ui.type`, slot allowlist, props/action keys, JSON-safety limits) before registration.
- [x] AC-3: Declarative UI rendering path accepts only validated slot contributions and safe built-in `button/panel` renderers.
- [x] AC-4: No raw function/component references from plugin payload are accepted for render; click actions dispatch only through command bus.
- [x] AC-5: No new dependencies and no `zod` imports are introduced by Task 115 touched implementation files.
- [x] AC-6: Core slot behavior remains unchanged when no external declarative contributions exist.
- [x] AC-7: `cd v10 && npm run lint` passes (errors 0).
- [x] AC-8: `cd v10 && npm run build` passes.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: register valid declarative UI contribution payload for an existing slot
   - Expected result: manifest v1/type-guard validation passes in loader and contribution renders only through allowlisted declarative path
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: register payload with invalid manifest shape or unknown slot/component key
   - Expected result: deterministic validation failure and no rendered output from invalid declaration
   - Covers: AC-1, AC-2, AC-3, AC-4

3) Step:
   - Command / click path: click a valid declarative button entry
   - Expected result: action routes to `dispatchCommand` only; no arbitrary function execution path
   - Covers: AC-4

4) Step:
   - Command / click path: inspect touched files for imports/dependencies
   - Expected result: no `zod` imports/new dependencies
   - Covers: AC-5

5) Step:
   - Command / click path: run app without plugin declarations
   - Expected result: existing core UI remains behaviorally identical
   - Covers: AC-6

6) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: both pass
   - Covers: AC-7, AC-8

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict validation may suppress legitimate future plugin UI declarations.
  - Partial migration could leave mixed imperative/declarative paths and increase complexity.
- Roll-back:
  - Revert declarative registry/renderer changes and restore previous slot registration behavior.
  - Keep manifest contract edits and UI runtime edits in separate commits for targeted rollback.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "위임모드로 task 116까지 전부 마무리하라!")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_115_strict_declarative_ui_plugin.md`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/core/extensions/registry.ts`
- `v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS (warnings only, errors 0)
- Build:
  - PASS
- Script checks:
  - FAIL (`scripts/check_layer_rules.sh` not present in this checkout)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `scripts/check_layer_rules.sh` missing in repository.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - Used lint/build and runtime guard checks for manifest validation/rendering.

Manual verification notes:
- `pluginLoader` now enforces strict Manifest v1 validation with JSON-safe limits and command-target validation.
- `ExtensionSlot` renders validated declarative entries and dispatches command actions via command bus.
- `registerCoreSlots` keeps existing core panel registration and no longer depends on ad-hoc window event emission.

Notes:
- Slot allowlist is centralized in `registry.ts` and includes reserved `left-panel` for future extension slots.
