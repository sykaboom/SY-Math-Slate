# AI_READ_ME (Machine Mode)

Status: ACTIVE
Purpose: operational guidance for AI agents working in `v10/`.
Audience: Codex/Claude/Gemini-style coding agents, not human narrative reading.

## 0) Read Order (SSOT-aware)
1. `PROJECT_BLUEPRINT.md`
2. `PROJECT_CONTEXT.md` (context only; roadmap section is historical)
3. `AGENTS.md`
4. approved `codex_tasks/task_*.md`
5. `PROJECT_ROADMAP.md` (roadmap SSOT)
6. `v10/docs/architecture/ModEngine.md` (canonical Mod/ModPackage architecture doc)
7. this file (`v10/AI_READ_ME.md`)
8. `v10/AI_READ_ME_MAP.md` (auto-generated structure map)

## 1) Non-negotiable Invariants
- No `eval` / `new Function`.
- No new `window` global exports.
- Sanitize before any HTML injection path.
- Persist JSON-safe data only.
- No new dependencies without explicit approval.
- Respect layer boundaries.

## 2) Layer Boundaries
Allowed imports:
- `core` -> `core` only
- `ui` -> `ui`, `core`
- `features` -> `features`, `ui`, `core`, `mod`
- `app` -> `app`, `features`, `ui`, `mod`
- `mod` -> `mod`, `core`, `features`, `ui`

Forbidden:
- `ui` importing `features`
- `core/runtime/**` importing `@features/*` or relative `features/*`
- `features|app|mod` deep-importing `@core/runtime/modding/package/*` or `@core/runtime/modding/host/inputRoutingBridge`
- `features|app|mod` importing deprecated alias lanes (`@core/mod*`, `@core/{config,contracts,engine,extensions,math,migrations,persistence,sanitize,theme,themes,types}*`)
- importing deprecated legacy feature compat roots (`@features/{layout,toolbar,ui-host,shortcuts,theme,viewer,sharing,sync,canvas,editor-core,animation,input-studio,community,moderation,policy,extensions,mod-studio,observability,store,experiments,hooks}`)
- toolbar host renderer files (`FloatingToolbar.tsx`, `DrawModeTools.tsx`, `PlaybackModeTools.tsx`, `CanvasModeTools.tsx`) referencing `TOOLBAR_ACTION_CATALOG`, `FALLBACK_RULES`, or `TOOLBAR_MODES`
- resurrecting `src/lib`
- tracked Prisma client/generated code under `v10/src`

## 3) Path Aliases
- `@core/*` -> `v10/src/core/*`
- `@core/runtime/modding` -> `v10/src/core/runtime/modding/index` (runtime modding convergence entry)
- `@core/runtime/modding/*` -> `v10/src/core/runtime/modding/*` (target namespace)
- `@mod/*` -> `v10/src/mod/*` (optional, layer checker supports mod layer)
- `@features/chrome/*` -> `v10/src/features/chrome/*`
- `@features/editor/*` -> `v10/src/features/editor/*`
- `@features/collaboration/*` -> `v10/src/features/collaboration/*`
- `@features/governance/*` -> `v10/src/features/governance/*`
- `@features/platform/*` -> `v10/src/features/platform/*`
- `@features/*` -> `v10/src/features/*`
- `@ui/*` -> `v10/src/ui/*`
- `@/*` -> `v10/src/*`

## 4) Runtime Architecture (Current)
Core subsystems:
- `core/foundation`: policies + registries + schemas + types (canonical runtime contracts).
- `core/runtime`: command + plugin-runtime execution surfaces.
- `core/domain`: domain logic (math).
- `core/pipelines`: persistence/migrations/export flows.
- `core/ui/theming`: theme engine + tokens + presets.
- `core/security/sanitization`: sanitize runtime.
- Runtime modding namespace (finalized in task_471):
  - `core/runtime/modding/api`: mod runtime contracts and normalized event/context types.
  - `core/runtime/modding/package`: package contracts/registry/selectors/guards + template-pack adapter.
    - selector split (task_509): domain selectors live under `src/core/runtime/modding/package/selectors/*`; `src/core/runtime/modding/package/selectors.ts` is facade export only.
    - packageSelection stage2 split (task_515): `src/core/runtime/modding/package/selectors/packageSelection.ts` is facade and detailed selectors live under `src/core/runtime/modding/package/selectors/packageSelection/*`.
    - toolbarPlan stage2 split (task_518): `src/core/runtime/modding/package/selectors/toolbarPlan.ts` is facade and resolver modules live under `src/core/runtime/modding/package/selectors/toolbarPlan/*`.
    - registry split (task_521): `src/core/runtime/modding/package/registry.ts` is facade and runtime registry modules live under `src/core/runtime/modding/package/registry/*`.
    - guard split (task_511): domain validators live under `src/core/runtime/modding/package/guards/*`; `src/core/runtime/modding/package/guards.ts` is facade export only.
    - validateDefinition stage2 split (task_516): `src/core/runtime/modding/package/guards/validateDefinition.ts` is facade and validation stages live under `src/core/runtime/modding/package/guards/validateDefinition/*`.
    - ui/resource policy split (task_522): `src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy.ts` is facade and parser modules live under `src/core/runtime/modding/package/guards/validateDefinition/uiAndResourcePolicy/*`.
    - resourcePolicy stage2 split (task_519): `src/core/runtime/modding/package/guards/resourcePolicy.ts` is facade and parser modules live under `src/core/runtime/modding/package/guards/resourcePolicy/*`.
    - template-pack adapter split (task_513): adapter modules live under `src/core/runtime/modding/package/templatePackAdapter/*`; `src/core/runtime/modding/package/templatePackAdapter.ts` is facade export only.
    - toolbarDefinition split (task_524): `src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition.ts` is facade and parser modules live under `src/core/runtime/modding/package/templatePackAdapter/toolbarDefinition/*`.
    - resourceItemMerge split (task_525): `src/core/runtime/modding/package/selectors/resourceItemMerge.ts` is facade and merge modules live under `src/core/runtime/modding/package/selectors/resourceItemMerge/*`.
    - resourceCommandMerge split (task_526): `src/core/runtime/modding/package/selectors/resourceCommandMerge.ts` is facade and merge modules live under `src/core/runtime/modding/package/selectors/resourceCommandMerge/*`.
    - package types split (task_528): `src/core/runtime/modding/package/types.ts` is facade and canonical type groups live under `src/core/runtime/modding/package/types/*`.
    - policy merge selectors split (task_529): `resourcePolicyMerge.ts`, `resourceShortcutMerge.ts`, `resourceInputBehaviorMerge.ts` are facades and merge helpers live under sibling module folders.
    - activation/provider split (task_530): `packageSelection/activationMapping.ts` and `toolbarPlan/provider.ts` are facades and resolver steps live under `.../activationMapping/*`, `.../provider/*`.
    - guard parser split (task_531): `guards/uiPolicy.ts` and `guards/validateDefinition/baseFields.ts` are facades and parser modules live under `.../uiPolicy/*`, `.../baseFields/*`.
    - registry class split (task_533): `registry/classRegistry.ts` is facade and internals live under `registry/classRegistry/*`.
    - merge core split (task_534): `resourceCommandMerge/merge.ts` and `resourceItemMerge/merge.ts` are facades with operation modules under `.../merge/*`.
    - inputBehavior guard split (task_535): `guards/resourcePolicy/inputBehaviorRule.ts` is facade and parser modules live under `.../inputBehaviorRule/*`.
    - parser stage3 split (task_537, task_538): `guards/uiPolicy/parseUIItemRules.ts` and `guards/validateDefinition/baseFields/parse.ts` are facade-only exports; parser internals live under `.../parseUIItemRules/*` and `.../baseFields/parse/*`.
    - parser stage4 split (task_540, task_541): `guards/uiPolicy/parseUIItemRules/validators.ts` and `selectors/resourceCommandMerge/merge/operations.ts` are facade-only exports; internals live under `.../validators/*` and `.../merge/operations/*`.
    - type/merge stage5 split (task_543, task_544): `types/toolbarPlan.ts` and `selectors/resourceShortcutMerge/merge.ts` are facade-only exports; internals live under `.../types/toolbarPlan/*` and `.../resourceShortcutMerge/merge/*`.
    - selection/mapping stage6 split (task_546, task_547): `packageSelection/sortingAndActive.ts` and `packageSelection/activationMapping/base.ts` are facade-only exports; internals live under `.../sortingAndActive/*` and `.../activationMapping/base/*`.
    - selection policy stage7 split (task_549, task_550): `packageSelection/conflicts.ts` and `packageSelection/uiPolicyAccess.ts` are facade-only exports; internals live under `.../conflicts/*` and `.../uiPolicyAccess/*`.
    - template adapter stage8 split (task_552, task_553): `templatePackAdapter/adaptation.ts` and `templatePackAdapter/manifestSelectors.ts` are facade-only exports; internals live under `.../adaptation/*` and `.../manifestSelectors/*`.
    - validate policy stage9 split (task_555, task_556): `guards/validateDefinition/index.ts`, `.../uiAndResourcePolicy/uiPolicy.ts`, and `.../uiAndResourcePolicy/resourcePolicy.ts` are facade-only exports; internals live under `.../validateDefinition/index/*`, `.../uiPolicy/*`, and `.../resourcePolicy/*`.
    - resource policy rule stage10 split (task_558, task_559): `guards/resourcePolicy/commandRules.ts` and `guards/resourcePolicy/shortcutRules.ts` are facade-only exports; parser internals live under `.../commandRules/*` and `.../shortcutRules/*`.
    - resource policy validator stage11 split (task_561, task_562): `.../commandRules/validators.ts` and `.../shortcutRules/validators.ts` are facade-only exports; validator internals live under `.../validators/*`.
    - ui-policy/input-behavior stage12 split (task_564, task_565): `.../uiPolicy/sections.ts` and `.../inputBehaviorRule/normalize.ts` are facade-only exports; internals live under `.../sections/*` and `.../normalize/*`.
    - resource-policy/registry stage13 split (task_567, task_568, task_569): `.../resourcePolicy/sections.ts`, `registry/runtimeRegistryState.ts`, and `registry/resourceOverrides.ts` are facade-only exports; internals moved under `.../resourcePolicy/sections/*`, `.../runtimeRegistryState/*`, and `.../resourceOverrides/*`.
    - toolbar-plan stage14 split (task_571, task_572): `selectors/toolbarPlan/surfaceRules.ts` and `selectors/toolbarPlan/planResolution.ts` are facade-only exports; internals moved under `.../surfaceRules/*` and `.../planResolution/*`.
    - validate/item-ops stage15 split (task_574, task_575): `guards/validateDefinition/index/validate.ts` and `selectors/resourceItemMerge/merge/operations.ts` are facade-only exports; internals moved under `.../index/validate/*` and `.../merge/operations/*`.
    - legacy alias runtime path: retired (task_496).
    - legacy alias retire freeze gate:
      - budget: `codex_tasks/workflow/mod_alias_retire_budget.env`
      - operator plan: `codex_tasks/workflow/mod_alias_retire_plan.md`
  - `core/runtime/modding/host`: mod runtime manager/registry and normalized routing bridge.
  - `core/runtime/modding/builtin`: builtin mods (`draw`, `playback`, `canvas`, `lecture`) under one contract.
- Legacy compat lanes (temporary):
  - `core/{config,contracts,engine,extensions,math,migrations,persistence,sanitize,theme,themes,types}` are shim-only during cutover.

Feature subsystems:
- Topology-v2 taxonomy (finalized in task_471):
  - Only `features/{chrome,editor,collaboration,governance,platform}` roots remain.
- `features/chrome/layout`: app shell/window host.
  - `AppLayout` safe-area policy includes top/bottom + horizontal (landscape tablet) chrome padding.
  - bottom `toolbar-bottom` slot is suppressed when window-host panel mode is active (single render path).
- `features/chrome/ui-host`: host-side aggregation bridge for mod toolbar/panel contributions.
- `features/editor/canvas`: board/cursor/render layers.
- `features/chrome/toolbar`: mode-split floating toolbar, pen/laser/eraser controls, compact IA sections, centralized toolbar feedback/notices.
  - Toolbar dedup IA rule: mode-lane controls are primary; `More` is settings/secondary only; avoid duplicate action surfaces for the same command in the same mode.
  - Toolbar single-source invariant: base mode actions must be produced only by `FloatingToolbar` mode slices (`DrawModeTools.tsx`, `PlaybackModeTools.tsx`, `CanvasModeTools.tsx`); core declarative/template base injection into `toolbar-inline` remains disabled.
  - Mode surface split: `DrawModeTools.tsx`, `PlaybackModeTools.tsx`, `CanvasModeTools.tsx`, `MorePanel.tsx` are the primary render slices; `FloatingToolbar.tsx` is orchestration shell.
  - Toolbar SSOT/policy files:
    - `src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
    - `src/features/chrome/toolbar/catalog/toolbarViewportProfile.ts`
    - `src/core/runtime/modding/package/selectors.ts` (`selectResolvedToolbarPlanInputFromRuntimeResolver`)
- `features/collaboration/sharing`: snapshot share adapters, host live session/store wiring, live transport, policy/proposal flow, AI approval queue hook.
- `features/chrome/viewer`: public viewer shell/session/live sync hooks.
- `features/editor/input-studio`: structured input + LLM draft flows.
- `features/platform/store`: zustand stores and compatibility bridges.
- `features/chrome/theming-ui`: end-user theme UI (`ThemePickerPanel`, provider wiring).
- `features/platform/mod-studio/theme`: advanced token editor, JSON IO, AI theme generation panel/hooks.
- `features/platform/mod-studio/ai`: in-studio AI module generation UI/hooks (`AIModuleGenerationPanel`, `useAIModuleGeneration`).

Template pack runtime:
- `src/mod/packs/*`: folder-based template packs (active path).
- `src/mod/schema/*`: pack contract guards/types (active path).
- `src/mod/bridge/packRegistryBridge.ts`: runtime bridge authority (active path).
  - pack toolbar contract SSOT: `manifest.toolbar.{modeDefinitions,actionCatalog,actionSurfaceRules}` only (legacy top-level `actionSurfaceRules` path retired).
  - `NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP=0`이면 기본 템플릿팩 자동 부트스트랩을 끈다(no-mod boot certification path).

## 5) Store Authorities (SSOT)
Authority-layer stores:
- `useDocStore`: persisted document authority
- `useSyncStore`: shared session/sync authority
- `useLocalStore`: local role authority (`role`, `trustedRoleClaim`)
- `useChromeStore`: chrome/panel authority including `toolbarPlacement` (`floating|docked` + edge)

Compatibility / legacy:
- `useUIStoreBridge`: transitional bridge
- `useCanvasStore`: still active for legacy canvas mutation paths

Theme state authority:
- `useThemeStore`: active preset + token overrides + preferences + localStorage (`sy-theme-v1`)

Session policy authority:
- `useSessionPolicyStore`: active template/rules (`proposalRules`, `llmProviderId`, `autoPassLowRiskQuestions`, prompt profile fields)

## 6) Theme and Style Invariants
Token naming:
- `swatch-*` is canonical
- `neon-*` remains compatibility alias only

Theme runtime SSOT:
- `src/core/ui/theming/engine/applyTheme.ts`: CSS variable application (`--theme-*`, `--mod-*`, `--theme-*-rgb`)
- `src/features/platform/mod-studio/theme/themeIsolation.ts`: draft-preview path using separate applier instance
- `src/features/chrome/theming-ui/ThemeProvider.tsx`: mount-time active theme apply
- `src/features/chrome/theming-ui/ThemePickerPanel.tsx`: end-user preset entry (chalk/parchment/notebook)
- `src/features/platform/mod-studio/theme/useAIThemeGeneration.ts`: AI-generated token apply/preview path
- `src/app/api/ai/theme/route.ts`: server-side AI theme token generation (structured JSON + token validation)

AI call runtime:
- `src/features/collaboration/sharing/ai/LLMCallService.ts`: server/client call facade
- `src/core/foundation/registries/aiProviderRegistry.ts`: provider resolution and OpenAI/mock execution (no client key exposure)
- `src/app/api/ai/call/route.ts`: server-side LLM proxy endpoint
- `src/app/api/ai/module/route.ts`: server-side AI module generation endpoint (mock-first + structured validation)

Ownership:
- `src/app/globals.css`: global tokens/resets/minimal app-wide rules only
- feature-specific CSS lives in:
  - `src/features/editor/canvas/styles/content-layer.css`
  - `src/features/editor/canvas/styles/mathjax.css`
  - `src/features/editor/animation/styles/rich-text-animation.css`
  - `src/features/chrome/layout/styles/prompter.css`
- feature CSS imports are wired in `src/app/layout.tsx`

## 7) Error Boundary Policy
SSOT component:
- `src/ui/components/ErrorBoundary.tsx`

Required coverage:
- `src/features/platform/extensions/ui/ExtensionSlot.tsx`
- `src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `src/features/chrome/layout/AppLayout.tsx`
- `src/features/chrome/layout/windowing/WindowHost.tsx`

Fallback rule:
- fallback UI must remain static/pure (no store hook dependency).

## 8) Command Registration Policy
- `registerCoreCommands.ts` is a facade.
- Domain modules:
  - `commands.doc.ts`
  - `commands.canvas.ts`
  - `commands.playback.ts`
  - `commands.tool.ts`
- `setToolbarDock` contract is edge-first only (`top|right|bottom|left` + optional `mode`); legacy `left|center|right` payload path is retired.
- Migration/guard scripts must scan command directory, not single monolith file assumptions.
- Toolbar runtime policy:
- `src/core/runtime/modding/package/selectors.ts` (`selectRuntimeToolbarCutoverEnabled`) is the single env/cutover resolver for toolbar plan input.
- `src/features/chrome/toolbar/toolbarModePolicy.ts` is now a thin host bridge for alias-telemetry + package-aware mode resolution.
  - `src/core/runtime/modding/package/selectors.ts` facade + `src/core/runtime/modding/package/selectors/toolbarPlan/*` is the single source for mode/viewport/action surface plan resolution.
- Navigation copy policy:
  - `src/features/chrome/toolbar/navigationLabels.ts` is the shared vocabulary source for Page/Outline/Playback step labels.

## 9) Design SSOT and Verification Gates
Design SSOT docs (read together):
- `v10/docs/design/DESIGN_SYSTEM_BLUEPRINT.md`: canonical design-system rules and token/layout contracts.
- `v10/docs/design/UI_GOLDEN_SCREEN.md`: UI baseline redlines used for fidelity and drift checks.
- `v10/docs/design/LLM_DESIGN_PROMPT_TEMPLATE.md`: prompt contract for AI-assisted design outputs.

Primary checks used by hooks/CI:
- `scripts/check_layer_rules.sh`
- `scripts/check_mod_contract.sh`
- `scripts/check_design_ssot_contract.sh`
- `scripts/check_toolbar_contract.sh`
- `scripts/check_v10_changed_lint.sh`
- `scripts/check_v10_hardcoding_budget.sh`
- `scripts/check_v10_large_file_budget.sh`
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/check_v10_no_mod_boot.sh`
- `scripts/check_core_mod_boundary.sh`
- `scripts/check_toolbar_surface_uniqueness.mjs`
- `scripts/check_template_pack_contract.mjs`
- `scripts/scan_guardrails.sh`
- `scripts/run_repo_verifications.sh`

Verification runner invariant:
- `scripts/run_repo_verifications.sh` must always execute `scripts/check_layer_rules.sh` and `scripts/check_mod_contract.sh` as required guardrail checks.

Toolbar dedup verifier expectation:
- `node scripts/check_toolbar_surface_uniqueness.mjs` => PASS in normal runtime analysis.
- `node scripts/check_toolbar_surface_uniqueness.mjs --self-test-duplicate` => intentional FAIL with non-zero exit.

Guardrail warning scan note:
- `scripts/scan_guardrails.sh` step [3] overlay warning은 dynamic pointer policy(`pointerClass`), color-input hit-target overlay(`cursor-pointer`), 인접 라인 pointer-events 제어를 false-positive로 취급해 제외한다.
- `scripts/scan_guardrails.sh` step [4] NEXT_PUBLIC 토큰 검사는 allowlist 항목만 발견되면 `PASS`(informational)로 처리하고, allowlist 외 항목만 `FAIL`로 처리한다.
- `scripts/check_v10_feature_flag_registry.sh`는 `v10/src` + `v10/tests` + `scripts/check_v10_phase5_flag_cutover.sh` 기준으로 사용 플래그를 집계한다.

When touching `v10/src/**`, update this file (`v10/AI_READ_ME.md`) in same change set.

## 10) Generated Map
- `v10/AI_READ_ME_MAP.md` is generated via:
  - `node scripts/gen_ai_read_me_map.mjs`
- freshness check:
  - `node scripts/gen_ai_read_me_map.mjs --check`

## 11) Roadmap and Archive Hygiene
Execution planning sources:
- roadmap-level: `PROJECT_ROADMAP.md`
- execution-level: approved `codex_tasks/task_*.md`
- architecture-level: `v10/docs/architecture/ModEngine.md` (canonical active path)
- large-file slicing wave (latest): `W-P6-SLICE-W38`
  - split targets:
    - `selectors/activePackageRules/active/selectors/helpers.ts` + `helpers/{selectors.ts,withActiveDefinition.ts}`
    - `guards/resourcePolicy/commandRules/validators/entry/helpers.ts` + `entry/helpers/{shape.ts,build.ts}`
    - `guards/resourcePolicy/shortcutRules/validators/entry/helpers.ts` + `entry/helpers/{shape.ts,build.ts}`
    - (previous wave continuity)
      - `selectors/activePackageRules/active/selectors.ts` + `active/selectors/helpers.ts`
      - `guards/validateDefinition/baseFields/parse/rootFields/validate.ts` + `rootFields/validate/helpers.ts`
      - `selectors/packageSelection/uiPolicyAccess/checks.ts` + `uiPolicyAccess/checks/helpers.ts`
      - `selectors/packageSelection/conflicts/summary.ts` + `summary/helpers.ts`
      - `guards/resourcePolicy/commandRules/validators/entry.ts` + `entry/helpers.ts`
      - `guards/resourcePolicy/shortcutRules/validators/entry.ts` + `entry/helpers.ts`
      - `selectors/toolbarPlan/surfaceRules/merge.ts` + `merge/helpers.ts`
      - `guards/validateDefinition/uiAndResourcePolicy/uiPolicy/parse.ts` + `uiPolicy/parse/helpers.ts`
      - `guards/validateDefinition/uiAndResourcePolicy/resourcePolicy/parse.ts` + `resourcePolicy/parse/helpers.ts`
      - `selectors/activePackageRules/active.ts` + `active/selectors.ts`
      - `selectors/toolbarPlan/planResolution/sections.ts` + `sections/modes.ts`
      - `templatePackAdapter/adaptation/definition.ts` + `definition/helpers.ts`
      - `guards/validateDefinition/baseFields/parse/rootFields.ts` + `rootFields/validate.ts`
      - `guards/validateDefinition/baseFields/parse/activation.ts` + `activation/validate.ts`
      - `guards/validateDefinition/baseFields/parse/parse.ts` + `parse/buildContext.ts`
      - `selectors/toolbarPlan/provider/baseProvider.ts` + `baseProvider/compat.ts`
      - `guards/uiPolicy/parseUIItemRules/parse.ts` + `parse/entry.ts`
      - `guards/validateDefinition/baseFields/parse/modIds.ts` + `modIds/validate.ts`
      - `selectors/resourcePolicyMerge/merge.ts` + `resourcePolicyMerge/applyLayer.ts`
      - `selectors/resourceItemMerge/merge/run.ts` + `resourceItemMerge/merge/runLayerItem.ts`
      - `selectors/resourceCommandMerge/merge/run.ts` + `resourceCommandMerge/merge/runLayerRule.ts`
      - `registry/classRegistry/registryClass.ts` + `registryClass/{register,queries}.ts`
      - `guards/validateDefinition/activation.ts` + `activation/entry.ts`
      - `selectors/resourceInputBehaviorMerge/merge.ts` + `merge/applyLayer.ts`
      - `templatePackAdapter/toolbarDefinition/parsers.ts` + `parsers/*`
      - `selectors/activePackageRules.ts` + `activePackageRules/*`
      - `guards/validateDefinition/dependenciesAndFinalize.ts` + `dependenciesAndFinalize/*`
      - `guards/utils.ts` + `guards/utils/*`
      - `selectors/resourceShortcutMerge/merge/operations.ts` + `operations/*`
      - `guards/resourcePolicy/inputBehaviorRule/parse.ts` + `parse/*`
- phase9 ops docs:
  - `v10/docs/telemetry/README.md`
  - `v10/docs/trust/README.md`
  - `v10/docs/runbooks/README.md`

Historical/non-SSOT artifacts must be treated as reference only:
- archived batch plans
- superseded tasks
- draft matrices
- legacy `ModeEngine.md` path mentions (archive history only)
