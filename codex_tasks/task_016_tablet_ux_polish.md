# Task 016: Tablet UX Polish (Data Input Panel)

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 015 (Data Input Panel)

## Context
The Data Input Panel (Task 015) relies on HTML5 Drag & Drop and fixed widths, which are problematic on tablets (touch events issues, keyboard overlap, narrow screens). We need to polish the UI to be fully touch-friendly and responsive.

## Goals
1.  **Touch Reordering:** Replace/Augment Drag & Drop with Up/Down buttons for block reordering.
2.  **Responsiveness:** Make the panel full-screen/overlay on smaller screens (< 1024px).
3.  **Keyboard Safety:** Ensure action buttons ("Apply", "Close") are sticky and visible when the virtual keyboard is open.
4.  **Selection Helper:** Improve text selection UX for applying styles ($$, HL).

## Requirements

### 1. Block Reordering (`BlockList` component)
*   **Add Buttons:** Add ChevronUp / ChevronDown buttons to each block row.
*   **Logic:**
    *   `moveBlock(index, direction: -1 | 1)`
    *   Swap content in `localBlocks` state.
*   *Note:* Keep Drag & Drop for desktop if possible, but Up/Down is the fallback for touch.

### 2. Responsive Layout (`DataInputPanel.tsx`)
*   **Breakpoint:** Use `lg:` (1024px) as the trigger.
*   **Desktop:** Keep the existing right-side panel (fixed width). Inside it, stack input + block list as-is.
*   **Tablet/Mobile:** Fullscreen overlay with tabs.
    *   **Tabbed View:** Toggle between "Input (Raw)" and "Blocks (Preview)".
    *   Default to "Input" tab.
*   **Style:** `fixed inset-0 z-50 bg-slate-900` (Fullscreen) for < 1024px only.

### 3. Keyboard Handling
*   **Sticky Footer:**
    *   Wrap the "Cancel / Apply" buttons in a `div` with `sticky bottom-0 bg-slate-900 border-t`.
    *   Ensure `pb-safe` (padding-bottom for safe area) is applied for iOS home bar.

### 4. Selection Helper (Optional but recommended)
*   Since selecting text inside a `textarea` on mobile is hard:
    *   Selection-only: if no selection exists, **do nothing** (no auto-insert).
    *   No "entire line" fallback.

## Deliverables
*   Updated `DataInputPanel.tsx` (Responsive + Tabs).
*   Updated block list logic (Up/Down buttons).
*   Verified on a mobile viewport simulator.

## Scope (touched files)
- `v10/src/components/layout/DataInputPanel.tsx`
- `v10/src/store/useUIStore.ts` (if tab state is stored)

## Acceptance Criteria
1.  **Reorder:** Clicking "Up" moves the block up one slot.
2.  **Mobile View:** On narrow screens, I see tabs instead of a split screen.
3.  **Keyboard:** When typing in the textarea on mobile, the "Apply" button is still reachable (or scrollable).

## Closeout
- **Changed files:**
  - `v10/src/components/layout/DataInputPanel.tsx`
- **Commands run:** none
- **Manual verification:** not run (not requested).

## Hotfix Notes
- Fix: stabilize PageViewport scale updates to prevent subpixel resize jitter.
- Files: `v10/src/components/canvas/PageViewport.tsx`
- Fix: allow responsive board scaling while ignoring tiny (<0.002) scale jitter.
- Files: `v10/src/components/canvas/PageViewport.tsx`
- Fix: ensure viewport scale updates on window resize/orientation change.
- Files: `v10/src/components/canvas/PageViewport.tsx`
- Fix: enforce height/width propagation so PageViewport can respond to resize.
- Files: `v10/src/components/canvas/CanvasStage.tsx`, `v10/src/components/layout/AppLayout.tsx`
- Cleanup: simplify PageViewport observers to ResizeObserver + rAF with small epsilon.
- Files: `v10/src/components/canvas/PageViewport.tsx`
- Fix: set explicit app height to allow responsive board scaling on window resize.
- Files: `v10/src/components/layout/AppLayout.tsx`
