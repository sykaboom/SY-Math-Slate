# Task 055: Tablet UX Polish - Icon Exposure

Status: COMPLETED

## Context
As part of the ongoing Tablet environment improvements, certain core features are still buried in the "More" menu, making them hard to discover and use on touch devices. Moving these to direct-access icons improves the workflow for educators.

## Goal
Extract "Presentation Mode" and "Paste Helper" from the "More" menu and place them as dedicated icons in the primary UI for immediate access.

## Status: COMPLETED

## Scope
- `v10/src/features/chrome/layout/AppLayout.tsx` (Top Header)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx` (Bottom Toolbar)

## Requirements

### 1. Presentation Mode Icon (Top Header)
- **Location**: `AppLayout.tsx`, inside the `<header>` section, next to the "View" (Overview) button.
- **Icon**: `MonitorPlay` (from `lucide-react`).
- **Action**: Triggers `setViewMode("presentation")`.
- **Visibility**:
  - Always visible in Edit mode.
  - Disabled when `isOverviewMode` is true.
- **Style**: Ghost or Outline button matching the header theme.

### 2. Paste Helper Icon (Bottom Toolbar)
- **Location**: `FloatingToolbar.tsx`, placed **immediately to the right** of the `ImageIcon` (Image Insert) tool.
- **Icon**: `ClipboardList` (from `lucide-react`). This represents "Clipboard/Paste info".
- **Action**: Triggers `handlePasteHelper`.
- **Visibility**:
  - Always visible in the toolbar.
  - Disabled when `isOverviewMode` is true.

### 3. "More" Menu Cleanup
- Remove the "Mode" section containing "Presentation Mode" and "Paste Helper" from the `FloatingToolbar`'s More menu.
- Remove the section header/container since it will be empty.

## Acceptance Criteria
- [ ] Top header displays the `MonitorPlay` icon next to the "View" button.
- [ ] Bottom toolbar displays the `ClipboardList` icon immediately to the right of the Image tool.
- [ ] Both icons are functional and correctly toggle their respective modes/modals.
- [ ] Both icons are visually disabled when Overview Mode is active.
- [ ] The "More" menu no longer contains the "Mode" section or its buttons.

## Files to Change (by Codex)
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

## Closeout Notes
- Changed files: `v10/src/features/chrome/layout/AppLayout.tsx`
- Changed files: `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Commands run: none
- Manual verification: not run (user reported implemented)
