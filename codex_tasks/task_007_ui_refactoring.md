# Task 007: UI Design System & Modularization

**Status:** COMPLETED
**Priority:** MEDIUM
**Assignee:** Codex CLI
**Dependencies:** Task 007.5 (Stability Fixes)

## Context
The `FloatingToolbar` component has grown too large and contains repetitive styling logic. Now that the underlying logic is stable (post-Task 007.5), we need to refactor the UI into atomic, reusable components with built-in animations.

## Goals
1.  **Atomic Design:** Create `ToolButton`, `ToolbarDivider`, `ToolbarPanel` components.
2.  **Animation:** Integrate `framer-motion` for smooth panel transitions and button interactions.
3.  **Cleanup:** Refactor `FloatingToolbar.tsx` to be declarative and concise.

## Requirements

### 1. Dependencies
*   Install: `npm install framer-motion`

### 2. Atomic Components (`src/components/toolbar/atoms/`)
*   **`ToolButton.tsx`:**
    *   Props: `active` (boolean), `icon` (LucideIcon), `onClick`, `label` (aria-label).
    *   Style: Encapsulate the `bg-neon-yellow`, `hover:text-white` logic here.
    *   Animation: Add `whileTap={{ scale: 0.9 }}` using motion.button.
*   **`ToolbarSeparator.tsx`:**
    *   Simple vertical divider with consistent styling.
*   **`ToolbarPanel.tsx`:**
    *   Wrapper for `PenControls` / `LaserControls`.
    *   Animation: `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}`.
    *   *Note:* This might replace or wrap the Shadcn Popover content.

### 3. Refactoring `FloatingToolbar.tsx`
*   Replace raw `<Button>` and `<Separator>` usage with the new atoms.
*   Extract the "Page Navigation" section into its own component: `PageNavigator.tsx` (inside `components/toolbar/`).
*   Extract the "History/File Controls" into a logical group if possible.

### 4. Aesthetic Polish
*   Ensure the toolbar looks consistent (pills, glassmorphism) but the code is clean.
*   The "Active State" glow effect (neon shadow) should be part of `ToolButton`.

## Deliverables
*   `src/components/toolbar/atoms/*.tsx`
*   `src/components/toolbar/PageNavigator.tsx`
*   Refactored `FloatingToolbar.tsx` (Should be significantly shorter).
*   Verified that animations work smoothly.
