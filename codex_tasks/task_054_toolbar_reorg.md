# Task 054: Reorganize Toolbar Items (Presentation & Paste Helper)

**Status:** COMPLETED  
**Date:** 2026-01-31  
**Assignee:** Codex CLI  
**Dependencies:** none

## Context
The user wants to improve accessibility for two features currently buried in the "More" menu:
1.  **Presentation Mode** (발표 모드): Move to the top header for easier access during class/presentation.
2.  **Paste Helper** (붙여넣기 도움말): Move to the bottom floating toolbar, adjacent to the Image tool, as it relates to content insertion.

## Goal
Extract "Presentation Mode" and "Paste Helper" from the "More" menu and place them as dedicated icons in the primary UI.

## Scope
- `v10/src/features/chrome/layout/AppLayout.tsx` (Top Header)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (Bottom Toolbar)

## Requirements

### 1. Presentation Mode Icon (Top Header)
- **Location**: `AppLayout.tsx`, inside the `<header>` section, next to the "View" (Overview) button.
- **Icon**: Use `MonitorPlay` (from `lucide-react`) or similar appropriate icon.
- **Action**: `setViewMode("presentation")`.
- **Visibility**:
  - Should be visible in "Edit" mode (when header is shown).
  - Disabled if `isOverviewMode` is true (consistent with other view controls).
- **Styling**: Match existing header button style (`variant="outline"` or `ghost` as appropriate to match neighbors).

### 2. Paste Helper Icon (Bottom Toolbar)
- **Location**: `FloatingToolbar.tsx`, next to the `ImageIcon` (Image Insert) tool.
- **Icon**: Use `HelpCircle` or `ClipboardList` (from `lucide-react`).
- **Action**: `handlePasteHelper` (opens the modal).
- **Visibility**:
  - Always visible in the toolbar.
  - Disabled if `isOverviewMode` is true.
- **Tooltip/Label**: "Paste Help" or "붙여넣기 도움말".

### 3. Cleanup ("More" Menu)
- Remove the "Mode" section (or the specific buttons) from the "More" menu in `FloatingToolbar.tsx` since they are now exposed directly.
- If the "Mode" section becomes empty, remove the section header/container as well.

## Acceptance Criteria
- [ ] Top header shows a "Presentation" (Monitor/Play) icon button next to "View".
- [ ] Clicking the top Presentation button switches to Presentation Mode.
- [ ] Bottom toolbar shows a "Help" (Clipboard/Help) icon button next to the Image tool.
- [ ] Clicking the bottom Help button opens the Paste Helper modal.
- [ ] The "Mode" section (Presentation Mode, Paste Helper) is removed from the "More" menu.
- [ ] All buttons are disabled when in Overview Mode.

## Risks
- Ensure `lucide-react` imports are updated for new icons.
- Ensure the top header layout (flex gap) accommodates the new button without breaking on smaller screens (though `max-w-6xl` suggests space is available).

## Closeout Notes
- Changed files:
  - `v10/src/features/chrome/layout/AppLayout.tsx`
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Commands run: none
- Manual verification: not run (use acceptance criteria)
