# Task 336: Mod Package Contract + Input Routing Foundation

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Introduce a first-class `ModPackage` contract and registry so runtime mod ownership becomes single-axis (`package -> mods`) instead of split-axis (`core/mod` vs `src/mod/templates`).
  - Define and implement a safe bridge that keeps existing `templatePackRegistry` compatibility while routing through the new package contract.
  - Connect real runtime input events (pointer/key/wheel) to `ModManager` via a single normalized path with strict fallback rules.
- What must NOT change:
  - Existing toolbar/windowing layout behavior and panel docking policies.
  - Existing share/viewer and role policy behavior.
  - Existing template-pack public API usage in current features (must keep compatibility adapter).

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/package/` (new)
- `v10/src/core/mod/host/manager.ts`
- `v10/src/core/mod/host/index.ts`
- `v10/src/core/mod/index.ts`
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/mod/templates/_contracts/templatePack.types.ts`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/platform/store/useModStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/eslint.config.mjs`
- `scripts/check_mod_contract.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Out of scope:
- Full folder migration to `src/modes/*`.
- CRDT or multi-active mod stacking.
- UI redesign / toolbar information architecture changes.
- New external dependencies.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
  - If YES, list and justify explicitly.
- Boundary rules:
  - `core/mod/package/*` must not import `@features/*`.
  - `core/mod/builtin/*` keeps existing no-import boundaries (no direct layout/store/windowing import).
  - `features/*` consumes mod runtime via public APIs only (`@core/mod/*` index exports).
- Compatibility:
  - Existing `templatePackRegistry` exports must remain callable (facade/adapter allowed).
  - Input handling must preserve current hand-pan/space-pan/middle-pan behavior.
  - Student kiosk guard remains effective (no mod route bypass of role limits).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W336
- Depends on tasks:
  - [`task_335_mod_studio_mod_diagnostics_and_conflict_tests`]
- Enables tasks:
  - `task_337_mod_package_runtime_cutover`
  - `task_338_input_routing_command_path_unification`
  - `task_339_mod_package_ui_policy_cutover`
- Parallel group:
  - G1-core-runtime
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 14
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2 (package contract/adapter, input routing bridge)
- Estimated single-agent duration:
  - ~70min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Ordering constraints:
    - package contract + adapter must land before routing references package metadata
    - `eslint`/guard updates after contract paths are finalized
- Rationale:
  - Cross-module changes with safety gates; parallelizable only in two non-overlapping units.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES / NO
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - `task_336` implementation only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: package contract + template adapter
    - Implementer-B: input routing bridge
    - Implementer-C: guardrail/docs sync
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A owns `core/mod/package/*`, `src/mod/runtime/*`
    - B owns canvas interaction files
    - C owns lint/scripts/docs
  - Parallel slot plan:
    - max 3 active slots (of 6 max)
  - Scheduler plan (required in delegated mode):
    - Slot allocation mode:
      - DYNAMIC
    - Slot priority rule (DYNAMIC only):
      - critical-path-first + file-conflict-avoidance
    - Requested orchestration mode:
      - max orchestration mode on
    - Initial slot split:
      - 2 executors + 1 guard/docs lane
    - Ready-queue refill trigger:
      - on each sub-unit completion and after lint gate
    - Agent close/reuse policy:
      - close completed implementer immediately; reuse reviewer slot for gate reruns
    - Heartbeat policy:
      - Soft ping threshold: 90s
      - Reassignment threshold: 180s
      - Long-running exceptions:
        - full build/lint and generated-doc steps
    - Reassignment safety rule:
      - only after no file lock conflict and no active tool process for target file set
  - Delegated closeout metrics:
    - Peak active slots:
    - Average active slots:
    - Slot refill count:
    - Reassignment count:

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - Confirmed by code audit + user review: `ModManager.routePointer/routeKey/routeWheel` exists but is not wired to effective runtime input path.
    - Dual-axis mod ownership: `v10/src/core/mod/*` and `v10/src/mod/templates/*` both operate runtime-like registries.
  - Sunset criteria:
    - Remove temporary adapter once all runtime reads switch from template pack facade to package registry selectors.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES / NO
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Architecture Decisions (Normative)

### D1. Canonical runtime units
- `Mod` = execution unit (input handlers, overlay, toolbar/panel contributions).
- `ModPackage` = deployment/operation unit (bundle of mods + default activation + policy mapping).

### D2. SSOT for runtime ownership
- Runtime ownership must be `ModPackage -> Mod[]`.
- `templatePackRegistry` remains as a compatibility facade only; it cannot become a second source of truth.

### D3. Input routing authority
- Canvas input routing authority is `ModManager` through normalized events.
- Routing result contract remains `handled | pass`.

### D4. Host-priority exceptions (no regressions)
- Viewport pan/zoom safety path stays host-priority:
  - middle-button pan, space+drag pan, hand-tool pan, pinch, wheel-zoom.
- Mod routing receives non-host-priority events first; host flow continues when result is `pass`.

---

## Proposed Contract (ModPackage v1)

```ts
export type ModPackageId = string;

export type ModPackageActivationPolicy = {
  toolbarModeMap?: Partial<Record<"draw" | "playback" | "canvas", string>>;
  defaultModId: string;
};

export type ModPackageUIPolicy = {
  allowToolbarContributionGroups?: string[];
  allowPanelSlots?: string[];
};

export type ModPackageDefinition = {
  packId: ModPackageId;
  version: string;
  label: string;
  modIds: string[];
  activation: ModPackageActivationPolicy;
  uiPolicy?: ModPackageUIPolicy;
  dependencies?: string[];
  conflicts?: string[];
  defaultEnabled?: boolean;
};
```

Rules:
- `activation.defaultModId` must exist in `modIds`.
- all `toolbarModeMap` values must exist in `modIds`.
- duplicate `packId` registration must fail deterministically.

---

## Implementation Phases (within this task)

### Phase 0 — Contract + Registry + Adapter (no behavior change)
- Add `core/mod/package` contracts/registry/selectors.
- Add adapter from `TemplatePackManifest` to `ModPackageDefinition`.
- Keep template APIs but route internals through package registry.

### Phase 1 — Input Routing Bridge (safe connect)
- Wire normalized pointer/key/wheel events to `ModManager` in canvas interaction entrypoints.
- Preserve host-priority pan/zoom behavior.
- `handled` stops downstream handling; `pass` keeps existing flow.

### Phase 2 — Guardrails + Docs
- Extend ESLint no-restricted-imports for `core/mod/package/*`.
- Extend `check_mod_contract.sh` with package boundary checks.
- Update AI readme/map for new package path and routing notes.

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `ModPackage` contract/registry exists and is used as the canonical runtime package source.
- [ ] AC-2: existing `templatePackRegistry` public APIs still work via compatibility adapter (no call-site break).
- [ ] AC-3: canvas runtime pointer/key/wheel routes through `ModManager` normalized handlers.
- [ ] AC-4: host-priority pan/zoom behavior remains unchanged in manual smoke checks.
- [ ] AC-5: lint/build and boundary scripts pass with package-boundary checks enabled.
- [ ] AC-6: `v10/AI_READ_ME.md` and `v10/AI_READ_ME_MAP.md` reflect added `core/mod/package` ownership.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Registry compatibility
   - Command / click path:
     - run existing template pack read path (mod studio/template selection flow)
   - Expected result:
     - no runtime error; same pack list appears as before
   - Covers: AC-1, AC-2

2) Pointer routing smoke
   - Command / click path:
     - draw mode: pointer down/move/up strokes on canvas
   - Expected result:
     - no regression in draw behavior; logs/trace confirm route path invoked
   - Covers: AC-3, AC-4

3) Pan/zoom exception smoke
   - Command / click path:
     - middle-button pan, space+drag pan, wheel zoom, pinch zoom (tablet)
   - Expected result:
     - behavior unchanged vs baseline
   - Covers: AC-4

4) Keyboard routing smoke
   - Command / click path:
     - trigger key interaction in canvas context (non-input focus)
   - Expected result:
     - route path invoked; handled/pass semantics respected
   - Covers: AC-3

5) Gate verification
   - Command / click path:
     - `bash scripts/check_layer_rules.sh`
     - `bash scripts/check_mod_contract.sh`
     - `cd v10 && npm run lint`
     - `cd v10 && npm run build`
   - Expected result:
     - all pass
   - Covers: AC-5

6) Docs sync
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs`
     - inspect `v10/AI_READ_ME.md` and `v10/AI_READ_ME_MAP.md`
   - Expected result:
     - new package path and ownership reflected
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Input event ordering regression can break drawing or viewport pan.
  - Dual-registry adapter bugs can cause pack activation mismatch.
  - Hidden key-routing side effects in editable elements.
- Roll-back:
  - Keep package adapter behind compatibility fallback in `templatePackRegistry`.
  - Feature-flag input routing bridge (`NEXT_PUBLIC_MOD_INPUT_ROUTING=0`) for immediate disable.
  - Revert `useViewportInteraction.ts` + `CanvasStage.tsx` bridge commits as a single rollback unit.

---

## Open Questions (must resolve before implementation starts)

1) Should active package id be persisted in document scope or local runtime scope only?
2) Should mod package activation policy own `toolbarMode -> modId` mapping immediately, or keep transitional fallback in `toolbarModePolicy.ts` for one wave?
3) Should key routing run in capture phase globally, or only within canvas-stage focus boundary?
4) Should package conflicts be hard-fail at registration or soft-warn with diagnostics only in Phase 1?
5) Is `playback -> lecture` transitional mapping preserved for one wave or removed in this task?

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/package/*`
- `v10/src/core/mod/host/*`
- `v10/src/core/mod/index.ts`
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/mod/templates/_contracts/templatePack.types.ts`
- `v10/src/features/platform/store/useModStore.ts`
- `v10/src/features/platform/store/useUIStoreBridge.ts`
- `v10/src/features/editor/canvas/viewport/useViewportInteraction.ts`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/ui-host/modContributionBridge.ts`
- `v10/src/features/chrome/layout/windowing/panelAdapters.tsx`
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/eslint.config.mjs`
- `scripts/check_mod_contract.sh`
- `scripts/scan_guardrails.sh`
- `v10/docs/architecture/ModEngine.md`
- `PROJECT_ROADMAP.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/workflow/mod_package_runtime_regression_matrix.csv`
- `codex_tasks/workflow/mod_package_runtime_thresholds.env`
- `codex_tasks/workflow/mod_package_docs_rollout_operator_guide.md`
- `codex_tasks/task_337_*.md` ~ `codex_tasks/task_349_*.md` closeout logs

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/scan_guardrails.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `node scripts/gen_ai_read_me_map.mjs`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none (final gate run 기준)
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - n/a

Manual verification notes:
- AC-1: package registry/contract and selector chain 추가됨.
- AC-2: template registry API compatibility 유지됨.
- AC-3: pointer/key/wheel mod routing bridge 경로 연결됨.
- AC-4: host-priority pan/zoom 예외 동작 유지 확인.
- AC-5: layer/mod/lint/build/script gate 통과.
- AC-6: AI docs + roadmap + architecture 문서 동기화 완료.

Notes:
- Implementation split followed delegated orchestration waves (`337~349`), with hot-file serialization for `useViewportInteraction.ts` and toolbar/windowing files.
