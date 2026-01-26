# Task 021: Audio Architecture (Global Step, Non-Export)

**Status:** COMPLETED
**Priority:** HIGH
**Dependencies:** Task 020 (Presentation Mode)

## Context (The "TTS" Vision)
The ultimate goal is to integrate **Local Model TTS** and **Voice Recording**. This requires the animation engine to shift from a "Timer-based" approach to an "**Audio-driven**" approach.
- Current: Step duration = `autoPlayDelayMs` (fixed).
- Target: Step duration = `audio.duration` (dynamic).

## Goals
1.  **Global Step Audio Mapping:** Attach audio to **global step indices** (page-agnostic).
2.  **Audio-Driven Sequence:** `useSequence` waits for audio completion before advancing.
3.  **Future-Proofing:** Support async audio loading (TTS on-the-fly).

## Non-goals
- No .slate export/import of audio in this task.
- No TTS generation/recording UI in this task.
- No global timeline editor (step-based only).

## Requirements
### 1. Data Structure (`useCanvasStore` / `types`)
- Add a **global step** audio mapping:
  ```typescript
  interface StepAudio {
    id: string;        // UUID of the audio resource
    stepIndex: number; // Target step
    src: string;       // Blob URL (local) or remote URL
    duration: number;  // Seconds (cached for UI)
    type: 'recording' | 'tts' | 'upload';
    blockId?: string;  // Optional: stable link to block
  }
  ```
  - Storage: `audioByStep: Record<number, StepAudio>`
  - Persist as `audioByStep?` on `PersistedCanvasV2` (optional).

### 2. Audio Engine Hook (`useAudioPlayer`)
- Manage a singleton HTML5 `Audio` instance (or `Howler.js` if needed, but start native).
- Methods: `play(src)`, `stop()`, `pause()`, `resume()`.
- **Sync Logic:** When audio plays, it should emit time updates or `onEnded` events to drive the sequence.

### 3. Sequence Logic Update (`useSequence.ts`)
- **Hybrid Timing Logic:**
  - **IF** current step has an assigned `StepAudio`:
    1. Start Text/Math Animation.
    2. Start Audio Playback.
    3. Wait for **both**: animation complete **and** `Audio.onEnded`.
    4. After both end, wait `autoPlayDelayMs`, then `nextStep()`.
  - **IF** current step has **NO** Audio:
    1. Start Text/Math Animation.
    2. Wait for animation completion.
    3. Wait for `autoPlayDelayMs` (fallback timer).
    3. Trigger `nextStep()`.

## Deliverables
- `v10/src/features/hooks/useAudioPlayer.ts` (New hook).
- `v10/src/features/hooks/useSequence.ts` (Audio-aware sequencing).
- `v10/src/core/types/canvas.ts` (Audio metadata definitions).
- `v10/src/features/store/useCanvasStore.ts` (audioByStep + actions).

## Scope (touched files)
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/core/types/canvas.ts`
- `v10/src/features/hooks/useAudioPlayer.ts`
- `v10/src/features/hooks/useSequence.ts`
- `v10/src/features/store/useUIStore.ts` (only if playback state needs audio flags)

## Acceptance Criteria
1) Steps can reference an audio clip (by step index) without export/import.  
2) When audio exists, next step waits for **audio + animation** to finish, then delay.  
3) When audio does not exist, next step waits for **animation**, then delay.  

## Manual Verification
1) Mock an audio entry and confirm `useSequence` waits for `onEnded`.  
2) Confirm no audio entry falls back to timer.  

## Risk Assessment
- **Autoplay Policy:** Browsers block audio autoplay without user interaction.
  - *Mitigation:* `Presentation Mode` entry (Task 020) must be a user-initiated click events, which we can use to unlock the `AudioContext`.
- **Race Conditions:** Ensure audio stops immediately if the user manually clicks "Next" or "Stop".

## Closeout Notes
- Audio is mapped by **global step index** via `audioByStep`.
- `useSequence` waits for **audio + animation** before advancing.
- Audio player is isolated in `useAudioPlayer` with stop/pause controls.
