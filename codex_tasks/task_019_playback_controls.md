# Task 019: Playback Controls + True Autoplay

**Status:** COMPLETED  
**Priority:** MEDIUM  
**Assignee:** Codex CLI  
**Dependencies:** Task 013 (Animation Engine), Task 014/015 (Text input), Task 017 (cleanup)

## Context
The animation engine can replay a step when triggered, but there is no **true autoplay** (auto-advance between steps) and no way to pause or control speed. Instructors need hands-free playback, reliable pausing, and adjustable pacing.

## Goals
1) Add transport controls: Play/Pause, Stop, Skip, Speed.  
2) Implement **true autoplay**: auto-advance steps on a timer.  
3) Make playback speed apply to both text and math animation.  

## Non-goals
- Audio mixing, recording, or timeline editor.  
- Advanced easing or per-block timing.

## Scope (touched files)
- `v10/src/store/useUIStore.ts`
- `v10/src/store/useCanvasStore.ts`
- `v10/src/hooks/useSequence.ts`
- `v10/src/components/canvas/animation/AnimatedTextBlock.tsx`
- `v10/src/components/canvas/animation/MathRevealBlock.tsx`
- `v10/src/components/canvas/ContentLayer.tsx`
- `v10/src/components/layout/Prompter.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/toolbar/PlaybackControls.tsx` (new)

## Requirements
### 1) UI Store (Playback State)
Add state + actions:
- `playbackSpeed: number` (default `1.0`, slider range `0.1` → `2.0`, step `0.05`)
- `autoPlayDelayMs: number` (default `1200`, slider range `300` → `3000`, step `100`)
- `isPaused: boolean`
- `skipSignal: number` (increment to force-complete current animation)
- `stopSignal: number` (increment to cancel current animation)
- Actions: `setPlaybackSpeed`, `setAutoPlayDelay`, `togglePause`, `triggerSkip`, `triggerStop`
- Keep `isAutoPlay` and `triggerPlay` (manual play).

### 2) True Autoplay (Step Auto-Advance)
- When `isAutoPlay === true` and **not paused**:
  - If `currentStep <= maxStep`:
    - Animate the **current step**.
    - After animation completes, wait `autoPlayDelayMs`, then advance to the next step and repeat.
- If `currentStep >= maxStep`, auto-play stops by setting `isAutoPlay` to `false`.
- Autoplay should also advance empty steps (no items) after the same delay.

### 3) Pause / Stop / Skip Behavior
- **Pause:** Freezes animation mid-step (no actor movement). Resume continues from the same point.
- **Stop:** Cancels current animation immediately, hides actor, clears `isPaused`, and does **not** advance step.
- **Skip:** Forces the **current block** to finish immediately, then continues the rest of the step.

### 4) Speed 적용 (Text + Math)
- `AnimatedTextBlock` and `MathRevealBlock` accept `speed` + `isPaused` + `skipSignal` + `stopSignal`.
- `speed` scales timing (e.g., 2.0x = half duration / half interval).
- `isPaused` must freeze reveal progress.
- `skipSignal` forces immediate completion of the active block.
- `stopSignal` cancels and hides actor.

### 5) UI Controls
Add controls near existing Play/AutoPlay buttons:
- Play (manual, **animate current step, then advance pointer**)
- Pause/Resume
- Stop
- Skip
- **Speed slider** (0.1x ~ 2.0x, live update)
- **Auto-play delay slider** (0.3s ~ 3.0s, live update)

### 6) Interaction UX (Desktop + Tablet)
- **Desktop:** When the value chip is focused/hovered, mouse wheel adjusts value in small steps (0.05x / 0.1s).
- **Tablet:** 
  - Tap value chip to open slider.
  - Drag thumb for continuous control.
  - Double-tap chip to reset to default (1.0x / 1.2s).

## Acceptance Criteria
1) With AutoPlay on, steps advance automatically with the configured delay.  
2) Pause freezes the animation and actor; Resume continues.  
3) Speed 2.0x visibly speeds up both text and math reveal.  
4) Skip completes the current block immediately.  
5) Stop cancels animation and leaves the current step unchanged.
6) Step preview bar is horizontally scrollable and highlights the current step.

## Manual Verification
1) Load 3+ steps and enable AutoPlay; confirm auto-advance without clicks.  
2) While animating, press Pause; animation freezes. Resume continues.  
3) Toggle speed between 1x and 2x; animation duration changes.  
4) Press Skip mid-block; it completes instantly and proceeds.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/store/useUIStore.ts`
- `v10/src/store/useCanvasStore.ts`
- `v10/src/hooks/useSequence.ts`
- `v10/src/components/canvas/animation/AnimatedTextBlock.tsx`
- `v10/src/components/canvas/animation/MathRevealBlock.tsx`
- `v10/src/components/canvas/ContentLayer.tsx`
- `v10/src/components/layout/Prompter.tsx`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/toolbar/PlaybackControls.tsx`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions). Playback now treats `currentStep` as the next step to play (hidden until Play), with scrollable step preview.
