# Task 026: Toolbar UX Reorg (Single-Line + Context Panels)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 025 (profile switcher)

## Context
Tablet UX suffers when the toolbar wraps into multiple rows. For a lecture tool, **immediacy** matters more than categorization. We will adopt a “single-line main bar + contextual panels + overflow menu” pattern.

## Goals
1) Keep the **main toolbar in a single line** at all times (no wrap).  
2) Expose only the most-used tools on the main bar (6–8 icons).  
3) Move advanced/secondary actions into an **overflow menu (⋯)**.  
4) Continue to use **contextual panels** for tool settings (pen/laser/playback/etc.).  
5) Preserve tool labels via tooltip/title for discoverability.

## Non-goals
- No new features or behavioral changes.  
- No new dependencies (use existing Popover/Tooltip).  
- No redesign of Pen/Laser panels.

## Scope (touched files)
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/atoms/ToolButton.tsx` (optional tooltip refinement)
- `v10/src/features/toolbar/atoms/ToolbarPanel.tsx` (if menu layout needs reuse)
- `v10/src/ui/components/popover.tsx` (no logic change; only if necessary for menu layout)

## Requirements
### 1) Main Bar (Single Line)
Main bar must **never wrap** (use `flex-nowrap` + horizontal scrolling disabled).  
Only the following remain on the main bar:
- Hand
- Pen
- Eraser
- Laser
- Text (Data Input Panel)
- Image
- Playback (existing Play/Pause cluster)
- Overflow (⋯)

### 2) Contextual Panels
Pen/Laser controls remain in popover panels.  
Playback controls stay in the same bar but compacted (no multi-row).

### 3) Overflow Menu
Move secondary actions into a popover menu:
- Save/Load `.slate`
- Export (Pro placeholder)
- Sound toggle
- Reset Local
- Overview toggle + ratio (if Advanced)
- Paste helper
- Page navigation (if space is tight; otherwise keep on main bar)

### 4) Tooltips / Labels
All main-bar buttons must have `title` and `aria-label` (existing ToolButton covers this).  
Overflow menu items must have visible text labels.

## Acceptance Criteria
1) Toolbar never wraps into multiple lines, even on tablet width.  
2) Core tools are accessible in one tap from the main bar.  
3) Secondary actions are available via the overflow menu.  
4) No regressions in pen/laser/playback behavior.

## Manual Verification
1) Shrink viewport to tablet width; toolbar stays in one line.  
2) Pen/Laser panels still open correctly.  
3) Overflow menu opens and contains moved actions.  

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/features/toolbar/FloatingToolbar.tsx`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions).
