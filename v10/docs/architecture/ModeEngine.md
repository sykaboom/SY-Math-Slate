# Canvas Modding Engine + Mod Manager (Spec)

Status: Draft for implementation dispatch  
Scope: Architecture contract (no runtime code changes in this document)  
Date: 2026-02-20

---

## 0. Discovery Summary (Read-Only)

### A) Current structure diagram

```text
AppLayout / WindowHost / panelAdapters
        <->  FloatingToolbar + mode slices (Draw/Playback/Canvas)
        <->  useUIStoreBridge (aggregates tool/chrome/viewport/playback stores)
        <->  commandBus + command modules (commands.tool/canvas/playback/doc)
        <->  rolePolicy + panelPolicy runtime resolution
```

Runtime mounting facts:
- Toolbar is mounted as a window-host panel, not a standalone fixed UI owner.
  - `features/layout/windowing/panelAdapters.tsx`
- Toolbar visibility/behavior is resolved through panel policy + role policy + layout gating.
  - `core/config/panel-policy.ts`
  - `core/config/rolePolicy.ts`
  - `features/layout/AppLayout.tsx`

### B) Core problem in one sentence

Toolbar and docking regressions recur because behavior is decided across multiple owners (layout/windowing + toolbar + store/commands + policy) without a single mode-level runtime authority.

---

## 1. Terms (short)

- Runtime:
  Browser execution state where input/state/render loops are active.
- Mod:
  Plugin unit that defines input interpretation, canvas behavior, overlay, and UI contributions.
- ModManager:
  Runtime authority that tracks active mod and routes input/lifecycle/UI contribution.
- Modding Engine:
  Contract + registry + loading + capability + conflict rules for mods.

Terminology compatibility:
- This spec uses `mod` as canonical product language.
- `mode` is treated as migration alias for compatibility with existing runtime naming.

---

## 2. Goals / Non-goals

### Goals
- `Lecture` is one regular mod (`lecture`) under the same contract as other mods.
- UI host owns layout/docking/windowing. Mods do not place/move UI directly.
- Mods mutate state only through `ModContext -> CommandBus` flow.
- Adding/replacing mods minimizes layout and toolbar regressions.

### Non-goals (initial)
- Arbitrary third-party code execution/downloading at runtime.
- Multi-active complex mod stacking in first rollout.

---

## 3. Proposed architecture (minimal 4-layer split)

### Layer 1) Canvas Runtime (Core)
- Owns normalized input stream, canvas state/hit-testing/render/history persistence hooks.
- Does not know specific mode UI.

### Layer 2) Mod Contracts (Core)
- Defines Mod interface, ModContext API, normalized events, UI contribution schema.
- Defines capability declarations and policy-gate integration points.

### Layer 3) Mod Host (Core)
- `ModRegistry`: register/list/resolve mod definitions.
- `ModManager`: active mod SSOT, lifecycle sequencing, input routing, contribution aggregation.

### Layer 4) UI Host (Features)
- Existing toolbar/layout/windowing remains host-owned.
- Receives merged contribution descriptors and renders through existing slot/panel runtime.
- Mods only request contribution; host decides final placement.

Dependency direction (mandatory):

```text
Mod -> ModContext -> CommandBus -> Runtime
Mod X-> layout/windowing/store direct imports
```

---

## 3.1 Target directory layout (final decision) + ownership

Decision:
- Keep current runtime stable and start with **Phase 0 no-move strategy**.
- Add new folders first, migrate by adapters, then optionally move files in Phase 3+.

Target layout (final-state goal with phased adoption):
- `v10/src/core/canvas-runtime/`
- `v10/src/core/mod/contracts/`
- `v10/src/core/mod/host/`
- `v10/src/core/mod/builtin/`
- `v10/src/features/ui-host/`
- `v10/src/features/mod-studio/`

Phase-0 compatibility note:
- Existing paths (`features/canvas`, `features/layout`, `features/windowing`, `features/toolbar`) remain in place.
- New `features/ui-host/*` starts as facade/adapters without mass file move.

Ownership table:

| Directory | Owns | Allowed dependencies | Public API | Forbidden deep imports |
|---|---|---|---|---|
| `core/canvas-runtime/` | normalized input, render/runtime primitives, history runtime hooks | `core/*` only | `core/canvas-runtime/index.ts` | no import from `features/*` |
| `core/mod/contracts/` | Mod contracts/types/events/context interfaces | `core/*` only | `core/mod/contracts/index.ts` | no `core/mod/contracts/internal/*` import from outside |
| `core/mod/host/` | ModRegistry, ModManager, lifecycle/routing/conflict resolution | `core/*` only | `core/mod/host/index.ts` | no import from `features/*` |
| `core/mod/builtin/` | built-in mods (lecture/draw/playback etc.) | `core/mod/contracts`, `core/mod/host` public APIs, command facade | `core/mod/builtin/index.ts` | no import from `features/layout`, `features/windowing`, `features/store` |
| `features/ui-host/` | toolbar/layout/windowing host orchestration facades, contribution rendering bridge | `core/*`, `ui/*`, host feature modules | `features/ui-host/index.ts` | no import from `core/mod/*/internal` |
| `features/mod-studio/` | authoring/diagnostics/publish UI for mods | `core/mod/contracts` + studio-local features | `features/mod-studio/index.ts` | runtime core must not import `features/mod-studio/*` |

---

## 3.2 Dependency rules (import + call graph)

### Allowed dependency graph

```text
core/canvas-runtime  -> core/*
core/mod/contracts   -> core/*
core/mod/host        -> core/mod/contracts, core/canvas-runtime, core/engine
core/mod/builtin     -> core/mod/contracts, core/mod/host, core/engine (public APIs only)
features/ui-host     -> core/*, ui/*, features/layout|toolbar|windowing (host side)
features/mod-studio  -> core/mod/contracts (+ feature-local modules)

Forbidden:
core/*               X-> features/*
core/mod/builtin     X-> features/layout|windowing|store
core/mod/host        X-> features/ui-host
runtime(core/*)      X-> features/mod-studio
```

### Call-level rules

- Mod canvas mutation:
  - allowed: `Mod -> ModContext.dispatchCommand(...) -> CommandBus -> store/runtime`
  - forbidden: `Mod -> use*Store direct mutation`
- UI trigger unification:
  - buttons/shortcuts/menus must use the same command path for mod switching and dock-affecting actions.
  - no parallel ad-hoc path per surface.
- UI placement authority:
  - mod requests contributions only; host decides actual slot/panel placement.

---

## 3.3 Dependency enforcement (automatic)

Primary enforcement stack (low-cost first):
1. `index.ts` public entrypoint policy for each mod-related folder.
2. ESLint `no-restricted-imports` guardrails.
3. Existing layer checks + dedicated mod boundary script in CI.

Required ESLint restriction examples (normative):

```json
{
  "overrides": [
    {
      "files": ["v10/src/core/mod/builtin/**/*.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": [
            "@features/layout/*",
            "@features/store/*",
            "@features/layout/windowing/*"
          ]
        }]
      }
    },
    {
      "files": ["v10/src/core/mod/host/**/*.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": ["@features/*"]
        }]
      }
    },
    {
      "files": ["v10/src/features/ui-host/**/*.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": [
            "@core/mod/**/internal/*"
          ]
        }]
      }
    }
  ]
}
```

CI enforcement target:
- `bash scripts/check_layer_rules.sh` (existing)
- `bash scripts/check_mod_contract.sh` (new in later phase)
- Fail build on violations (no warning-only mode for boundary breaks).

---

## 4. Mod contract (required interfaces)

> Type signatures are normative targets for implementation tasks.

```ts
// core/mod/contracts.ts
export type ModId = string;
export type ModCapability =
  | "input.pointer"
  | "input.keyboard"
  | "overlay.draw"
  | "toolbar.contribute"
  | "panel.contribute"
  | "playback.control";

export type ModMeta = {
  id: ModId;
  version: string;          // semver
  label: string;
  priority: number;         // conflict resolution
  capabilities: ModCapability[];
};

export type NormalizedPointerEvent = {
  pointerId: number;
  phase: "down" | "move" | "up" | "cancel";
  x: number;
  y: number;
  pressure: number;
  buttons: number;
  timestamp: number;
  modifiers: { alt: boolean; ctrl: boolean; shift: boolean; meta: boolean };
};

export type NormalizedKeyEvent = {
  phase: "down" | "up";
  code: string;
  key: string;
  repeat: boolean;
  timestamp: number;
  modifiers: { alt: boolean; ctrl: boolean; shift: boolean; meta: boolean };
};

export type NormalizedWheelGestureEvent = {
  dx: number;
  dy: number;
  dz: number;
  ctrlKey: boolean;
  timestamp: number;
};

export type ModToolbarItem = {
  id: string;
  commandId: string;
  label: string;
  icon?: string;
  group?: string;
  order?: number;
  when?: string;            // simple visibility expression key
};

export type ModPanelContribution = {
  id: string;
  title: string;
  slot: string;             // UI host slot id
  defaultOpen?: boolean;
  order?: number;
};

export type ModOverlayFrame = {
  viewport: { zoom: number; offsetX: number; offsetY: number };
  timestamp: number;
};

export type ModContext = {
  modId: ModId;
  dispatchCommand: (commandId: string, payload?: unknown, meta?: Record<string, unknown>) => Promise<unknown>;
  query: {
    activeTool: () => string;
    playbackStep: () => { current: number; total: number };
    role: () => "host" | "student";
  };
  publishNotice: (tone: "info" | "success" | "error", message: string) => void;
};

export interface ModDefinition {
  meta: ModMeta;
  onEnter?(ctx: ModContext): void | Promise<void>;
  onExit?(ctx: ModContext): void | Promise<void>;
  onSuspend?(ctx: ModContext): void | Promise<void>;
  onResume?(ctx: ModContext): void | Promise<void>;

  onPointer?(event: NormalizedPointerEvent, ctx: ModContext): "handled" | "pass";
  onKey?(event: NormalizedKeyEvent, ctx: ModContext): "handled" | "pass";
  onWheelGesture?(event: NormalizedWheelGestureEvent, ctx: ModContext): "handled" | "pass";

  drawOverlay?(
    canvasCtx: CanvasRenderingContext2D,
    frame: ModOverlayFrame,
    ctx: ModContext
  ): void;

  getToolbarItems?(ctx: ModContext): ModToolbarItem[];
  getPanels?(ctx: ModContext): ModPanelContribution[];

  serializeState?(): Record<string, unknown>;
  restoreState?(value: Record<string, unknown>): void;
}
```

Contract guard rules:
- Raw DOM events are never passed to mods.
- Mods do not mutate layout/windowing/store directly.
- Mod UI contribution is declarative request only.

---

## 5. ModManager responsibilities (SSOT)

### 5.1 Active mod SSOT
- Introduce a dedicated `useModStore` (local scope authority).
- `activeModId` is stored only in `useModStore`.
- `useUIStoreBridge` may expose a compatibility read path but must not become authority.

### 5.2 Input routing rules
- Default rule: active mod receives normalized input first.
- System exceptions (always host-owned):
  - pan/zoom safety gesture
  - emergency escape/fullscreen-exit
  - global accessibility shortcuts
- If mod returns `"pass"`, runtime fallback handlers execute.

### 5.3 Transition rules
- Deterministic order:
  1) `current.onExit`
  2) `next.onEnter`
  3) set `activeModId = next`
- In-flight event policy during transition: queue max `N` events (default 16), then drop oldest with warning.

### 5.4 Conflict rules
- Toolbar/shortcut collision resolution:
  - higher `meta.priority` wins
  - tie -> lexicographic `modId` for deterministic output
- Host can reject contribution by capability/policy gate.

### 5.5 UI contribution aggregation
- `ModManager.getResolvedUIContributions()` returns merged descriptors.
- UI host renders via existing slot runtime (`ExtensionSlot` / panel contracts).
- Mod never controls final dock/window position.

---

## 6. Lecture as normal mod (`LectureMod`)

`LectureMod` definition requirements:
- Input:
  - next/prev step controls
  - play/pause/skip control events
  - optional pointer highlight trigger
- Overlay:
  - presenter pointer/highlight and progression hint overlay only
- Toolbar contribution:
  - declarative items (prev, next, play/pause, speed)
- Registration lifecycle:
  - registered via ModRegistry same as draw/playback/canvas
  - activated/deactivated by ModManager only

No privileged path:
- no direct `AppLayout` branch for lecture logic
- no lecture-only command bypass

---

## 7. Migration plan (phased)

### Phase 0 — Contracts + manager skeleton
- Changed folders:
  - `core/mod/contracts/*`, `core/mod/host/*`, `features/store/*` (bridge), `features/toolbar/*` (adapter only)
- Deliverables:
  - mod contracts file
  - mod registry + manager skeleton
  - bridge adapter from current toolbar mode state to `activeModId`
- AC:
  - runtime compiles without behavior change
  - manager can report active mod from bridge path
- Risks:
  - dual-authority drift between legacy toolbar state and `activeModId`
  - accidental import boundary leak while introducing skeleton
- Rollback:
  - disable bridge write path and keep legacy selector as sole authority
  - keep new mod host unused behind adapter off-switch
- Minimum tests (3+):
  - compile + lint pass
  - legacy draw/playback/canvas toggles remain behavior-equivalent
  - no boundary violations from layer checks

### Phase 1 — Pilot migration (1~2 mods)
- Changed folders:
  - `core/mod/builtin/*`, `core/mod/host/*`, `features/toolbar/*` (consumption bridge)
- Target:
  - migrate `draw` and `lecture` first (or `draw` + `playback`) as first-class mods
- AC:
  - migrated mods operate through ModContext and command dispatch
  - no direct layout/windowing imports from migrated mod modules
- Risks:
  - parity regressions in toolbar interactions
  - hidden coupling to legacy `useUIStoreBridge`
- Rollback:
  - feature-flag migrated builtin mods individually
  - fallback to legacy mod selector/render path
- Minimum tests (3+):
  - lecture mod activation/deactivation path test
  - pilot mod interaction parity smoke test
  - command path audit (no direct store mutation from migrated mods)

### Phase 2 — Command path unification
- Changed folders:
  - `features/toolbar/*`, `features/shortcuts/*`, `core/engine/*`, `core/mod/host/*`
- Target:
  - toolbar buttons and shortcuts use same command path under mod host
- AC:
  - command IDs and payload validation remain stable
  - mod transition + command dispatch tests pass
- Risks:
  - duplicated/competing event routes during cutover
  - shortcut conflict regressions
- Rollback:
  - route-specific fallback gate (buttons/shortcuts separately)
  - retain previous command dispatch adapters until full cutover pass
- Minimum tests (3+):
  - toolbar button path == shortcut path command equivalence
  - transition sequencing (`onExit -> onEnter -> activeModId`) test
  - conflict deterministic resolution test

### Phase 3 — Studio/runtime integration
- Changed folders:
  - `features/mod-studio/*`, `core/mod/host/*`, `scripts/*`, optional `features/ui-host/*` facade refinements
- Target:
  - extend mod-studio diagnostics to mod enable/order/conflict
  - turn on strict import restrictions and CI fail policy for mod boundaries
- AC:
  - mod conflict diagnostics visible
  - invalid mod manifest fails fast with deterministic error
  - import-boundary violations fail CI
- Risks:
  - noisy false positives in diagnostics/enforcement
  - migration fatigue from delayed deep-import cleanup
- Rollback:
  - keep diagnostics read-only if needed
  - temporarily downgrade selected enforcement checks behind explicit allowlist
- Minimum tests (3+):
  - conflict diagnostics fixture (expected deterministic output)
  - `check_mod_contract.sh` pass/fail paths
  - CI path: restricted import intentionally fails

---

## 8. Test & regression prevention (required)

- Input routing tests:
  - active mod handled/pass behavior
  - transition-time queue/drop behavior
- UI contribution tests:
  - each mod contribution renders consistently in host slots
  - contribution collision deterministic order
- Layout/docking regression tests:
  - mod change must not require layout/windowing file edits
  - host-only docking behavior remains independent from mod internals
- Compatibility tests:
  - legacy toolbar mode selector maps to ModManager without crash

---

## 9. Open questions (must decide before full rollout)

1. Active mod model:
   - Keep single-active-mod strictly through Phase 2, or allow temporary stacked overlays?
2. Mod persistence ownership:
   - per-document mod state vs per-session mod state vs split ownership?
3. External mod trust level:
   - built-in only (MVP) vs signed pack allowlist vs fully open import?
4. Capability gate granularity:
   - static capability list only vs runtime conditional capability requests?
5. Shortcut collision policy:
   - global host shortcuts hard-reserved list scope and override exceptions?

---

## 10. Dispatch-ready task decomposition seed

Recommended follow-up sequence:
1. `task_331`: contracts + `ModRegistry` scaffolding.
2. `task_332`: `ModManager` + `useModStore` bridge.
3. `task_333`: `LectureMod` and one additional mod migration slice.
4. `task_334`: contribution aggregation into toolbar/window host.
5. `task_335`: conflict diagnostics in mod-studio + tests.
