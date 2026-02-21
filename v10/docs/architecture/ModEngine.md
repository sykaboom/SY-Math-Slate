# ModEngine + ModPackage Runtime Architecture

Status: ACTIVE (Task 348 docs rollout)
Scope: Architecture contract and operational rollout guide (no runtime behavior change in this document)
Date: 2026-02-20

---

## 0. Canonical Naming and Path

- Canonical architecture doc path: `v10/docs/architecture/ModEngine.md`.
- Canonical product terms:
  - `Mod`: runtime behavior unit (input handling, overlay, contributions).
  - `ModPackage`: operational package unit (activation policy, UI policy, dependency/conflict metadata).
- Compatibility term:
  - `mode` is a UI-facing alias resolved through `core/mod/package` selectors only.
- Archive rule:
  - `ModeEngine.md` is retired from active docs. Legacy mentions are archive-history only.

---

## 1. Core Problem Summary

Toolbar and docking regressions historically recurred because behavior ownership was split across multiple surfaces (layout/windowing, toolbar logic, store bridges, and command paths) without one package-level runtime authority.

The migration target is single-axis ownership:

```text
ModPackage -> activation/ui policy -> Mod host runtime -> UI host rendering
```

---

## 2. Terms

- Runtime:
  - browser execution state where input/state/render loops are active.
- Mod:
  - plugin unit implementing mod contracts (`onPointer`, `onKey`, overlay, UI contributions).
- ModPackage:
  - deployment/operation unit that groups mods and defines activation + UI policy.
- ModRegistry:
  - definition registry for available mod implementations.
- ModManager:
  - active runtime authority for lifecycle, event routing, and contribution aggregation.
- UI host:
  - host-owned layout/windowing/toolbar renderer that consumes contribution descriptors.

---

## 3. Package-First Runtime Architecture

Core namespace rollout note (task_461~465):
- Active namespaces:
  - `core/foundation/*`, `core/runtime/*`, `core/domain/*`, `core/pipelines/*`, `core/ui/theming/*`, `core/security/sanitization/*`
- Legacy core lanes (`core/config`, `core/contracts`, `core/engine`, `core/extensions`, etc.) are compatibility facades during cutover and are purge candidates at closeout.

### Layer 1) Canvas Runtime (Core)
- Owns normalized input stream, rendering primitives, and persistence hooks.
- Must not depend on feature-layer UI ownership.

### Layer 2) Mod Contracts (Core)
- Owns `ModDefinition` contracts and normalized event/context types.
- Path: `v10/src/core/mod/contracts/*`.

### Layer 3) ModPackage Contracts + Registry (Core)
- Owns `ModPackageDefinition`, validation, registry, selectors, and template-pack adapter.
- Path: `v10/src/core/mod/package/*`.

### Layer 4) Mod Host Runtime (Core)
- Owns `ModRegistry` + `ModManager` lifecycle, routing, and contribution resolution.
- Path: `v10/src/core/mod/host/*`.

### Layer 5) UI Host Runtime (Features)
- Owns final placement/rendering in toolbar/window/panel surfaces.
- Consumes package selectors + mod contributions, but keeps layout authority.
- Paths:
  - `v10/src/features/ui-host/*`
  - `v10/src/features/layout/*`
  - `v10/src/features/toolbar/*`

Required dependency direction:

```text
Mod -> ModContext -> CommandBus -> Runtime
ModPackage selectors -> host adapters -> UI host
core/* X-> features/* (forbidden)
```

---

## 3.1 Ownership Map (Current)

| Path | Owns | Allowed dependencies | Forbidden |
|---|---|---|---|
| `v10/src/core/mod/contracts/*` | mod contracts/types | `core/*` | `features/*` |
| `v10/src/core/mod/package/*` | package contracts/registry/selectors/guards | `core/*` | `features/*` |
| `v10/src/core/mod/host/*` | runtime host manager/routing | `core/*` | `features/*` |
| `v10/src/core/mod/builtin/*` | builtin mods | `core/mod/*`, engine public APIs | direct layout/windowing/store imports |
| `v10/src/mod/bridge/packRegistryBridge.ts` | template pack registry bridge authority | `@core/mod/package` + `src/mod/packs` + `src/mod/schema` | standalone package authority duplication |
| `v10/src/features/ui-host/*` | host contribution filtering/render bridge | `core/*`, `ui/*`, host features | `@core/mod/**/internal/*` |

Runtime authority lane:
- Runtime authority is package-first through `core/mod/package` selectors and registries.

---

## 3.2 Import and Call Rules

Allowed:
- `core/mod/package` and `core/mod/host` import only core-layer modules.
- Features resolve package policy through selector APIs.
- Mod state mutations flow through `ModContext.dispatchCommand`.

Forbidden:
- Mods mutating feature stores directly.
- Runtime core importing `features/*`.
- UI host reading core internals instead of public entrypoints.

---

## 4. Contracts (Canonical)

### 4.1 Mod Contract (`core/mod/contracts/types.ts`)

```ts
type ModDefinition = {
  meta: { id: string; capabilities: string[]; priority: number };
  onPointer?(event, ctx): "handled" | "pass";
  onKey?(event, ctx): "handled" | "pass";
  onWheelGesture?(event, ctx): "handled" | "pass";
  getToolbarItems?(ctx): ModToolbarItem[];
  getPanels?(ctx): ModPanelContribution[];
};
```

### 4.2 ModPackage Contract (`core/mod/package/types.ts`)

```ts
type ModPackageDefinition = {
  packId: string;
  version: string;
  label: string;
  modIds: readonly string[];
  activation: {
    defaultModId: string;
    toolbarModeMap?: Partial<Record<"draw" | "playback" | "canvas", string>>;
  };
  uiPolicy?: {
    allowToolbarContributionGroups?: readonly string[];
    allowPanelSlots?: readonly string[];
  };
  dependencies?: readonly string[];
  conflicts?: readonly string[];
  defaultEnabled?: boolean;
};
```

Ownership rule:
- `Mod` decides behavior.
- `ModPackage` decides which behaviors are activated and where contributions are allowed.

---

## 5. Runtime Routing and Authority

### 5.1 Active state SSOT
- Active package: `activePackageId` in `useModStore` (feature authority state).
- Active mod: resolved through package activation policy + runtime manager lifecycle.
- Toolbar mode mapping authority: `core/mod/package/selectors.ts` (`mode <-> modId`) with deterministic compatibility policy.

### 5.2 Input routing
- Pointer/key/wheel normalization flows through `core/mod/host/inputRoutingBridge.ts`.
- Host-priority exceptions (pan/zoom safety and reserved shortcuts) still apply first.
- Mod route returns `handled` or `pass`; routing resolution is deterministic.

### 5.3 UI contribution policy
- UI host filters contributions using package policy selectors:
  - toolbar groups
  - panel slots
- Final placement remains host-owned.

---

## 6. Migration Wave Map (task_336~349)

### Phase A — Foundation
- `task_336`: package contract + input routing foundation baseline.
- `task_337`: canonical package contracts/registry core.
- `task_338`: template-pack adapter into package registry.
- `task_339`: active package store/runtime bridge.
- `task_340`: input routing bridge scaffold.

### Phase B — Input Integration
- `task_341`: pointer/wheel routing integration.
- `task_342`: keyboard routing with focus guard.

### Phase C — Policy Cutover
- `task_343`: toolbar mapping to package activation policy.
- `task_344`: UI host contribution filtering by package policy.

### Phase D — Diagnostics and Guardrails
- `task_345`: mod studio package diagnostics/conflict surface.
- `task_346`: package boundary enforcement and CI checks.
- `task_347`: regression matrix and runtime checks.

### Phase E — Docs and Retirement
- `task_348`: docs rollout, canonical naming/path sync, operator guide.
- `task_349`: retire feature-layer fallback branches; package selectors remain the only toolbar mapping authority.

Current phase boundary (as of 2026-02-20):
- Task 348 rollout in progress/completion window.
- Task 349 is the final retirement gate.

---

## 7. Operator Cutover and Rollback Checkpoints

Cutover checkpoints:
1. Canonical doc path is `ModEngine.md` and active references are updated.
2. `PROJECT_ROADMAP.md` includes phase mapping for `task_336~349`.
3. AI docs are refreshed (`AI_READ_ME.md` + generated map).
4. Required gates pass:
   - `node scripts/gen_ai_read_me_map.mjs`
   - `bash scripts/check_layer_rules.sh`
   - `bash scripts/check_mod_contract.sh`
   - `cd v10 && npm run lint && npm run build`

Rollback checkpoints:
1. If docs drift is discovered, revert only docs/workflow files from this wave.
2. Re-run all checks above after rollback commit.
3. Keep `ModeEngine.md` references archive-only; do not reintroduce as canonical path.

Operator note source:
- `codex_tasks/workflow/mod_package_docs_rollout_operator_guide.md`

---

## 8. Regression Prevention Checklist

- Ensure `core/mod/package/*` remains the package-level authority.
- Keep template-pack public API compatibility via adapter (`src/mod/bridge/packRegistryBridge.ts`) and catalog contracts (`src/mod/schema/*`).
- Keep layer boundaries enforced by lint and shell checks.
- Require deterministic conflict and policy selector behavior in diagnostics/tests.

---

## 9. Archive History (Non-SSOT)

- Legacy doc path `v10/docs/architecture/ModeEngine.md` was the pre-rollout filename.
- References to `ModeEngine.md` are allowed only in historical records (completed/superseded task logs).
- Active architectural references must use `ModEngine.md`.
