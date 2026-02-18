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
6. this file (`v10/AI_READ_ME.md`)
7. `v10/AI_READ_ME_MAP.md` (auto-generated structure map)

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
- `features` -> `core`, `ui`
- `app` -> `features`, `ui`

Forbidden:
- `ui` importing `features`
- resurrecting `src/lib`
- tracked Prisma client/generated code under `v10/src`

## 3) Path Aliases
- `@core/*` -> `v10/src/core/*`
- `@features/*` -> `v10/src/features/*`
- `@ui/*` -> `v10/src/ui/*`
- `@/*` -> `v10/src/*`

## 4) Runtime Architecture (Current)
Core subsystems:
- `core/engine`: command bus and preflight execution.
- `core/contracts`: runtime guards/contracts.
- `core/extensions`: plugin loader, registry, MCP gateway.
- `core/themes`: theme presets.
- `core/theme`: runtime theme apply/preference schema.
- `core/config`: tokens, capability/config defaults.

Feature subsystems:
- `features/extensions`: command registrations and UI slot runtime.
- `features/layout`: app shell/window host.
- `features/canvas`: board/cursor/render layers.
- `features/input-studio`: structured input + LLM draft flows.
- `features/store`: zustand stores and compatibility bridges.
- `features/theme`: end-user theme UI (`ThemePickerPanel`, provider wiring).

## 5) Store Authorities (SSOT)
Authority-layer stores:
- `useDocStore`: persisted document authority
- `useSyncStore`: shared session/sync authority
- `useLocalStore`: local role authority (`role`, `trustedRoleClaim`)

Compatibility / legacy:
- `useUIStoreBridge`: transitional bridge
- `useCanvasStore`: still active for legacy canvas mutation paths

Theme state authority:
- `useThemeStore`: active preset + token overrides + preferences + localStorage (`sy-theme-v1`)

## 6) Theme and Style Invariants
Token naming:
- `swatch-*` is canonical
- `neon-*` remains compatibility alias only

Theme runtime SSOT:
- `src/core/theme/applyTheme.ts`: CSS variable application (`--theme-*`, `--mod-*`, `--theme-*-rgb`)
- `src/features/mod-studio/theme/themeIsolation.ts`: draft-preview path using separate applier instance
- `src/features/theme/ThemeProvider.tsx`: mount-time active theme apply
- `src/features/theme/ThemePickerPanel.tsx`: end-user preset entry (chalk/parchment/notebook)

Ownership:
- `src/app/globals.css`: global tokens/resets/minimal app-wide rules only
- feature-specific CSS lives in:
  - `src/features/canvas/styles/content-layer.css`
  - `src/features/canvas/styles/mathjax.css`
  - `src/features/animation/styles/rich-text-animation.css`
  - `src/features/layout/styles/prompter.css`
- feature CSS imports are wired in `src/app/layout.tsx`

## 7) Error Boundary Policy
SSOT component:
- `src/ui/components/ErrorBoundary.tsx`

Required coverage:
- `src/features/extensions/ui/ExtensionSlot.tsx`
- `src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `src/features/layout/AppLayout.tsx`
- `src/features/layout/windowing/WindowHost.tsx`

Fallback rule:
- fallback UI must remain static/pure (no store hook dependency).

## 8) Command Registration Policy
- `registerCoreCommands.ts` is a facade.
- Domain modules:
  - `commands.doc.ts`
  - `commands.canvas.ts`
  - `commands.playback.ts`
  - `commands.tool.ts`
- Migration/guard scripts must scan command directory, not single monolith file assumptions.

## 9) Verification Gates
Primary checks used by hooks/CI:
- `scripts/check_layer_rules.sh`
- `scripts/check_v10_changed_lint.sh`
- `scripts/check_v10_hardcoding_budget.sh`
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/run_repo_verifications.sh`

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

Historical/non-SSOT artifacts must be treated as reference only:
- archived batch plans
- superseded tasks
- draft matrices
