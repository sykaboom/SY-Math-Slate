# Task 053: Simplify Profiles & Default to Advanced (Pro-level UI)

**Status:** COMPLETED  
**Date:** 2026-01-31  
**Assignee:** Codex CLI  
**Dependencies:** none

## Context
Standardize the application profile system to just **Basic** and **Advanced**.
- The "Pro" profile is removed.
- Both profiles must show the full set of toolbar icons (Hand, Pen, Eraser, Laser, Text, Image, Playback, Page/Break controls).
- The distinction is only in the Menu: **Export** is exclusive to the **Advanced** profile.
- The default profile should be **Advanced** to provide the "full" experience by default.

## Goal
1.  Refactor `capabilities.ts` to support only `basic` and `advanced`.
2.  Set `advanced` as the default profile in `useUIStore.ts`.
3.  Ensure `FloatingToolbar.tsx` renders all icons for both profiles, but gates the Export menu item.

## Requirements

### 1. Capability Definitions (`v10/src/core/config/capabilities.ts`)
- Remove `pro` profile name and type.
- Rename/Define `export.advanced` capability.
- **basic**: Includes all creation tools (autoplay, timing, overview, math, highlight).
- **advanced**: Includes everything in `basic` + `export.advanced`.

### 2. Store Defaults (`v10/src/features/platform/store/useUIStore.ts`)
- Change `capabilityProfile` default value to `"advanced"`.

### 3. Toolbar UI (`v10/src/features/chrome/toolbar/FloatingToolbar.tsx`)
- **Icons**: Ensure Hand, Pen, Eraser, Laser, Text, Image, Playback, and the Break button group are always visible (remove any profile-based gating for these icons).
- **Profile Switcher**: Update to show only "Basic" and "Advanced".
- **Export Button**: 
  - Shown/Enabled only when `capabilityProfile === 'advanced'`.
  - Label: "Export" (remove "Pro" suffix).
  - For now, click should trigger `window.alert("준비 중입니다.")` or similar if no specific external integration is ready.

## Acceptance Criteria
- [ ] App starts in **Advanced** profile by default.
- [ ] Bottom toolbar icons are identical in both Basic and Advanced profiles (Full set).
- [ ] Menu -> Profile switcher only lists "Basic" and "Advanced".
- [ ] Menu -> "Export" button is only visible (or active) in **Advanced** profile.

## Files to Change (by Codex)
- `v10/src/core/config/capabilities.ts`
- `v10/src/features/platform/store/useUIStore.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

## Closeout Notes
- Changed files:
  - `v10/src/core/config/capabilities.ts`
  - `v10/src/features/platform/store/useUIStore.ts`
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Commands run: none
- Manual verification: not run (use acceptance criteria)
