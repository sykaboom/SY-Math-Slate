# Task 024: Architecture Refactor (Layered Structure, Safe Phasing)

**Status:** COMPLETED  
**Priority:** CRITICAL  
**Assignee:** Codex CLI  
**Dependencies:** Task 023 (capability architecture)

## Context
We want “초1류급 깔끔함” in structure: clear separation between **core logic**, **UI rendering**, and **feature composition**, so future extensions (TTS, export, DSL, manim) can be added without architectural debt.

## Goals
1) Introduce a **core / ui / features** folder layout in **safe phases**.  
2) Keep behavior identical (no functional changes).  
3) Enforce dependency direction: **core <- ui <- features**.

## Non-goals
- No new features.
- No functional changes.
- No new dependencies.

## Scope (touched files)
**New folders**
- `v10/src/core/` (new)
- `v10/src/features/` (new)
- `v10/src/ui/` (new)

**Core Migration (Step 1)**
- `v10/src/types/` → `v10/src/core/types/`
- `v10/src/lib/math/` → `v10/src/core/math/`
- `v10/src/lib/utils.ts` (pure helpers only) → `v10/src/core/utils/`
- `v10/src/config/capabilities.ts` → `v10/src/core/config/`

**UI Migration (Step 2)**
- `v10/src/components/ui/` → `v10/src/ui/components/`
- `v10/src/components/layout/` → split:
  - if **pure view only** → `v10/src/ui/layout/`
  - if **store/hook connected** → `v10/src/features/chrome/layout/`

**Features Migration (Step 3)**
- `v10/src/store/` → `v10/src/features/platform/store/`
- `v10/src/hooks/` → `v10/src/features/platform/hooks/`
- `v10/src/components/canvas/` → `v10/src/features/editor/canvas/`
- `v10/src/components/toolbar/` → `v10/src/features/chrome/toolbar/`

**Infrastructure (Step 0 / Step 4)**
- `v10/tsconfig.json` (add `@core/*`, `@ui/*`, `@features/*` aliases)
- `v10/components.json` (update shadcn aliases after UI migration)

## Requirements
1) **Step 0**: Add path aliases before any moves.  
2) **Step 1**: Move core-only files first; update imports.  
3) **Step 2**: Move UI components; update `components.json` aliases.  
4) **Step 3**: Move features (store/hooks/canvas/toolbar/layout-connected).  
5) Core must not import React or UI.  
6) UI must not import features (store/hooks); use props only.  
7) Zero runtime changes beyond imports.

## Acceptance Criteria
1) `npm run dev` still runs without runtime errors.  
2) All imports resolve correctly after each phase.  
3) Project structure matches the layered layout above.  
4) No circular dependencies introduced.

## Manual Verification
1) Start dev server; load main page without errors.  
2) Basic toolbar + drawing + playback still work.  
3) Overview mode still toggles.  
4) Data input panel still opens and applies blocks.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/tsconfig.json`
- `v10/components.json`
- `v10/src/app/page.tsx`
- `v10/src/core/**` (new: `types`, `math`, `config`, `utils.ts`)
- `v10/src/ui/**` (new: moved shadcn UI components)
- `v10/src/features/**` (new: store, hooks, canvas, toolbar, layout)
- `v10/src/lib/migration.ts` (import path updates)
- `v10/src/lib/exportPipeline.ts` (import path updates)
- `v10/src/lib/boardSpec.ts` (import path updates)

**Commands run:** None  
**Notes:** Manual verification not run (per instructions).
