# Task 062: Cursor Latency Fix (Single Timeline Sync)

**Status:** COMPLETED
**Priority:** P1 (UX Performance)
**Assignee:** Codex CLI
**Dependencies:** Task 061

## Context
User reported that the chalk cursor "lags significantly" behind the text rendering during playback animations. This feels "sluggish" compared to the legacy implementation.
The current implementation relies on React State (`useState`) for updating the actor's (x, y) coordinates. This introduces a render cycle delay (16ms+ or more) between the text appearing and the cursor moving, causing a visible disconnect.
We can allow a small startup delay (1–2 frames) if needed, but the cursor and text **must finish at the same time** for UX.
Math (MathJax) vs plain text rendering speed differences must be accounted for.

## Goals
1.  **Single Timeline Sync:** Drive text/math reveal and cursor movement from the **same animation loop** so they end on the same frame.
2.  **Allow Micro Delay:** A 1–2 frame startup delay is acceptable if it keeps end-time alignment.
3.  **No Global Singleton:** Avoid global/singleton controller; use per-instance refs to prevent cross-instance conflicts.
4.  **Cursor Lead:** Cursor should start **one character ahead** (a small lead offset) for a more natural feel.
5.  **Restore "Legacy" Feel:** Cursor feels attached to writing with zero perceptible lag.

## Scope (Files)
- `v10/src/features/platform/hooks/useSequence.ts`: Pass a per-instance actor ref/controller down to animation components.
- `v10/src/features/editor/canvas/actors/ActorLayer.tsx`: Keep actor always mounted; expose `ref` target for movement.
- `v10/src/features/editor/canvas/actors/ChalkActor.tsx`: Remove transform transition; accept ref for direct transform updates.
- `v10/src/features/editor/canvas/actors/HighlighterActor.tsx`: Same as ChalkActor.
- `v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx`: Drive cursor position updates inside the same animation loop; apply lead offset.
- `v10/src/features/editor/canvas/animation/MathRevealBlock.tsx`: Use the same sync pattern (progress → cursor position).
- `v10/src/features/editor/canvas/CanvasStage.tsx`: Provide per-instance refs to actor layer / animation state.

## Detailed Plan (Single Timeline / Per-Instance Ref)

### 1. Per-Instance Actor Ref
- `ActorLayer` should always render an element with a stable `ref`.
- `useSequence` owns a `actorRef` and passes a `moveActor(x,y)` callback down to animation components.
- This avoids global state and allows multiple instances safely.

### 2. Refactor Actors (`ChalkActor`, `HighlighterActor`)
- Remove `transition-transform duration-100` (prevents lag).
- No `x/y` props. Position set via ref updates only.
- `TIP_OFFSET` applied inside `moveActor` so the cursor lead is consistent.

### 3. Sync Loop (AnimatedTextBlock / MathRevealBlock)
- **Single timeline:** Cursor position is updated inside the same animation loop that reveals text.
- **Cursor lead:** start at “one character ahead” by shifting caret position forward by one glyph width (use measured span width or average width).
- **Finish sync:** on the final frame, set cursor position and call `onDone()` in the same tick.

## Math vs Text Speed
- **Requirement:** Math and plain text should still end together.
- Approach:
  - Wait for MathJax typeset before starting animation.
  - Compute a duration weight:
    - Text: `textLength`
    - Math: `renderedWidthPx / k` (k ≈ 12–16) with minimum weight.
  - Allocate time by weight so math feels slower but still ends exactly with the cursor.

## Risks & Constraints
- **Race Conditions:** Actor ref must exist before animation starts. Keep ActorLayer mounted.
- **Offsets:** `TIP_OFFSET` applied in `moveActor` only; remove duplicate transforms.
- **Performance:** Avoid additional React renders per frame.

## Acceptance Criteria
- [ ] **Sync End:** Cursor and text/math finish on the same frame.
- [ ] **Lead Offset:** Cursor starts one character ahead.
- [ ] **Performance:** React DevTools "Highlight updates" should NOT flash `ActorLayer` during typing animation (except start/end).
- [ ] **Correctness:** Offset (tip position) remains accurate for both Chalk and Marker.
- [ ] **Safety:** No errors if `onMove` is called when Actor ref is unavailable (null check).

## Completion Notes
- **Changed files:**
  - v10/src/features/platform/hooks/useSequence.ts
  - v10/src/features/editor/canvas/CanvasStage.tsx
  - v10/src/features/editor/canvas/actors/ActorLayer.tsx
  - v10/src/features/editor/canvas/actors/ChalkActor.tsx
  - v10/src/features/editor/canvas/actors/HighlighterActor.tsx
  - v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx
  - v10/src/features/editor/canvas/animation/MathRevealBlock.tsx
  - v10/src/features/editor/canvas/MathTextBlock.tsx
- **Commands run:** None (not requested).
- **Manual verification:** Not run (dev/build not requested).
