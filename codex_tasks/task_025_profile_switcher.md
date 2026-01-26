# Task 025: Capability Profile Switcher UI

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 023 (capability architecture), Task 024 (layered refactor)

## Context
We added capability profiles (basic/advanced/pro) but there is no UI to switch profiles. Users should be able to unlock advanced controls without editing code.

## Goals
1) Add a small, non-intrusive **profile switch UI** in edit mode.  
2) Default remains **basic**, but switching to advanced/pro reveals gated features.  
3) Keep the UI lightweight and discoverable (single chip + popover).

## Non-goals
- No persistence to server/auth.  
- No new dependencies.  
- No changes to capability logic.

## Scope (touched files)
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/store/useUIStore.ts` (only if needed for labels/derivations)

## Requirements
1) Add a profile chip (e.g., "Mode: Basic") in the toolbar.  
2) Clicking opens a popover with `Basic / Advanced / Pro` options.  
3) Selecting an option calls `setCapabilityProfile`.  
4) Visual feedback shows the current profile (active state).

## Acceptance Criteria
1) Profile switcher is visible in edit mode.  
2) Switching to Advanced shows speed/delay/auto controls immediately.  
3) Switching back to Basic hides advanced controls.  

## Manual Verification
1) Open toolbar, change profile to Advanced.  
2) Confirm advanced controls appear.  
3) Switch back to Basic and confirm they disappear.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/features/toolbar/FloatingToolbar.tsx`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions).
