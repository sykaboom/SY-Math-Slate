# Task 062: Cursor Latency Fix (Direct DOM Manipulation)

**Status:** PENDING
**Priority:** P1 (UX Performance)
**Assignee:** Codex CLI
**Dependencies:** Task 061

## Context
User reported that the chalk cursor "lags significantly" behind the text rendering during playback animations. This feels "sluggish" compared to the legacy implementation.
The current implementation relies on React State (`useState`) for updating the actor's (x, y) coordinates. This introduces a render cycle delay (16ms+ or more) between the text appearing and the cursor moving, causing a visible disconnect.

## Goals
1.  **Eliminate React Render Cycles for Movement:** Update the actor's position directly via DOM manipulation, bypassing `setState` and Re-renders.
2.  **Synchronize Text & Cursor:** Ensure the cursor moves strictly in sync with the text reveal logic in `useSequence` / `AnimatedTextBlock`.
3.  **Restore "Legacy" Feel:** The cursor should feel "attached" to the text being written, with zero perceptible lag.

## Scope (Files)
- `v10/src/features/canvas/actors/actorController.ts` (New): A lightweight singleton module to hold the reference to the active actor DOM element.
- `v10/src/features/hooks/useSequence.ts`: Refactor `onMove` to use `actorController` instead of `setActor` for coordinates.
- `v10/src/features/canvas/actors/ActorLayer.tsx`: Remove coordinate props; handle visibility/type via state, but position via internal logic/controller.
- `v10/src/features/canvas/actors/ChalkActor.tsx`: Register its Ref with `actorController` on mount.
- `v10/src/features/canvas/actors/HighlighterActor.tsx`: Register its Ref with `actorController` on mount.
- `v10/src/features/canvas/animation/AnimatedTextBlock.tsx`: (Optional) Optimize `onMove` frequency if necessary, but primary fix is in the consumer.

## Detailed Plan (Singleton Controller Pattern)

### 1. `actorController.ts`
Create a module-level store (not Zustand, just a closure) to manage the direct DOM reference.
```typescript
// features/canvas/actors/actorController.ts
let activeActor: HTMLElement | null = null;

export const registerActor = (el: HTMLElement | null) => {
  activeActor = el;
};

export const moveActor = (x: number, y: number) => {
  if (activeActor) {
    // Direct transform update
    activeActor.style.transform = `translate(${x}px, ${y}px)`;
  }
};
```
*Note: We still need to account for `TIP_OFFSET` which is currently handled in the Actor components. The controller might need to accept raw coordinates and apply offsets, or the Actor component sets the offset transform base.*

### 2. Refactor Actors (`ChalkActor`, `HighlighterActor`)
- Instead of receiving `x, y` as props, they will receive them ONLY for initial placement or not at all (if handled purely by controller).
- On mount (`useEffect`), they call `registerActor(ref.current)`.
- On unmount, `registerActor(null)`.
- **CSS Change:** The `transform` style currently in the component JSX must be removed or set to a default, as it will be overridden by `moveActor`.
- **Offset Logic:** The `TIP_OFFSET` logic should likely move to `moveActor` or be baked into the `translate` call.

### 3. Refactor `useSequence`
- **Remove:** `x, y` from the `actor` state object. Keep `visible`, `type`, `isMoving`.
- **Update:** `onMove` callback:
  ```typescript
  const onMove = useCallback((pos, tool) => {
    // ... sound logic ...
    
    // Direct DOM update (Fast!)
    moveActor(pos.x, pos.y);
    
    // React State update (Slow, only for non-positional changes)
    setActor(prev => {
      if (prev.visible && prev.isMoving && prev.type === tool) return prev; // No change
      return { ...prev, visible: true, isMoving: true, type: tool ?? prev.type };
    });
  }, ...);
  ```

## Risks & Constraints
- **Race Conditions:** Ensure `registerActor` happens before `onMove` is called. `ActorLayer` is always mounted, so this should be safe.
- **Cleanup:** Must ensure `activeActor` is cleared when components unmount to avoid memory leaks or manipulating dead nodes (though React handles node removal).
- **Theme Offsets:** `chalkTheme.ts` offsets must be correctly applied in the `moveActor` logic.

## Acceptance Criteria
- [ ] **Zero Lag:** Cursor moves simultaneously with text appearing.
- [ ] **Performance:** React DevTools "Highlight updates" should NOT flash `ActorLayer` during typing animation (except maybe at start/end).
- [ ] **Correctness:** Offset (tip position) remains accurate for both Chalk and Marker.
- [ ] **Safety:** No errors if `onMove` is called when Actor is unmounted (null check).
