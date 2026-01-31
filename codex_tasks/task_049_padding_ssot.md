# Task 049: Padding SSOT (48px) Unification

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 048-2

## Context
Currently, the padding constant is inconsistent. `boardSpec.ts` defines `getBoardPadding()` as 80, but `autoLayout.ts` and other components use a hardcoded value of 48. We will unify this to 48px to match the actual layout behavior.

## Goals
1) Set the single source of truth (SSOT) for board padding to 48px.
2) Replace all hardcoded 48px padding values with a reference to the centralized config.

## Scope (touched files)
- `v10/src/core/config/boardSpec.ts`
- `v10/src/features/layout/autoLayout.ts`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/canvas/AnchorIndicator.tsx`
- `v10/src/features/canvas/ContentLayer.tsx`

## Requirements
1) **Update Config:** Change `getBoardPadding()` in `boardSpec.ts` to return `48`.
2) **Replace Hardcoded Values:** 
   - Remove `const CONTENT_PADDING = 48` from the listed files.
   - Use `getBoardPadding()` instead.
3) **ContentLayer Padding:**
   - In `ContentLayer.tsx`, remove the Tailwind class `p-12` (which is 48px).
   - Instead, apply padding via inline style: `padding: \`\${getBoardPadding()}px\``.
4) **Zero Visual Change:** The actual layout must remain at 48px; only the source of the number changes.

## Risks & Rollback
- **Risk:** If any file still relies on a hardcoded 48px for layout calculations while others use the function, future changes to `getBoardPadding` could break the layout.
- **Rollback:** Revert changes to `boardSpec.ts` (set back to 80) and restore `CONTENT_PADDING = 48` constants.

## Acceptance Criteria
1) Layout and cursor positions remain identical to the current 48px behavior.
2) `grep` search for "CONTENT_PADDING" or padding-related "48" in the target files returns no hardcoded definitions (only imports/calls).
3) `ContentLayer` uses dynamic padding from `getBoardPadding()`.

## Closeout Notes
- Changed files:
  - `v10/src/core/config/boardSpec.ts`
  - `v10/src/features/layout/autoLayout.ts`
  - `v10/src/features/store/useCanvasStore.ts`
  - `v10/src/features/canvas/AnchorIndicator.tsx`
  - `v10/src/features/canvas/ContentLayer.tsx`
- Commands run: none
- Manual verification: not run (needs manual steps in spec)
