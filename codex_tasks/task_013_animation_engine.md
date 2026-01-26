# Task 013: Animation Engine (Cursor-Follow Illusion & SFX)

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 009 (Text Layer), Task 010 (MathJax), Task 012.5 (BoardSpec)

## Context
We are implementing a **cursor-follow illusion** animation engine where Chalk/Highlighter icons move near the currently revealed character (or math box) and visibly “shake” to sell the effect. We must also add Sound Effects (SFX). Actor positioning must respect the **Board Coordinate System** from Task 012.5.

## Goals
1. **Actor Components:** `ChalkActor` / `HighlighterActor` inside the Board.
2. **Logic:** Cursor-follow typewriter (Text) & Mask Reveal (Math).
3. **SFX:** Play sounds during animation (with autoplay unlock).
4. **Coordinates:** Use `useBoardTransform` to map DOM positions to Board space.
5. **Modes:** Support **Auto** and **Manual (Play button)**.

## Requirements

### 1. Actor Components (`src/components/canvas/actors/`)
*   **Location:** Render inside `PageViewport` so they scale with the board. **Do not show in Overview mode.**
*   **Props:** `targetPos` ({x,y} in Board Space), `visible`, `isMoving`.
*   **Behavior:**
    *   `transition`: `transform 0.1s linear` (or via JS frame loop for tighter sync).
    *   **Bobbing:** CSS Keyframes animation while `isMoving` is true.
        - **Amplitude:** noticeably larger than “gentle sway” (e.g., 8–14px).
        - Optional slight rotation ±6–12deg for extra realism.
    *   **Offset:** Adjust CSS to align the **Tip** of the tool with `targetPos`.

### 2. Logic & Coordinates (`useSequence.ts`)
* **Target Calculation (Text):**
  1. Build a **character map** by walking text nodes and using `Range` to get each char rect.
  2. For each revealed character, use its rect center → `toBoardPoint(cx, cy)` → `targetPos`.
  3. If rect lookup fails, fallback to container center.
* **Text Animation:**
  * Typewriter reveal by inserting characters over time.
  * Actor follows the current character position and “shakes” while moving.
  * If content contains complex HTML tags, skip per-char tracking and just follow the container center.
* **Math Animation:**
  * Use `mask-image` + `-webkit-mask-image` on the MathJax container.
  * Animate mask 0%→100%, and move actor from left-center → right-center of the math box.
  * If mask unsupported, fallback to simple fade-in.

### 3. Sound Effects (`src/hooks/useSFX.ts`)
*   **Assets:** Place `chalk.mp3` and `marker.mp3` in `public/sfx/` (placeholders allowed).
*   **Logic:**
    *   `play(type: 'chalk'|'marker')`: Start looping sound.
    *   `stop()`: Fade out and pause.
    *   Sync strictly with `isMoving` state.
    *   **Autoplay unlock:** Require a user gesture once (first click/touch) to enable audio.

### 4. Integration
* Add **Manual Play** button + **Auto** toggle.
* Trigger sequence when `currentStep` changes **only if Auto is on**.
* Add cancel logic to avoid overlapping sequences.
* Update `ContentLayer` to support `isAnimating` state (disable interactions).

## Deliverables
*   `src/components/canvas/actors/*`
*   `src/hooks/useSequence.ts`
*   `src/hooks/useSFX.ts`
*   **Assets:** `public/sfx/chalk.mp3`, `public/sfx/marker.mp3`.

## Acceptance Criteria
1. **Visual:** Actor follows the current character (or math box) with noticeable shake.
2. **Audio:** Sound plays only while moving; auto-play works after a user unlock gesture.
3. **Consistency:** Works under BoardSpec scaling; not shown in Overview mode.
