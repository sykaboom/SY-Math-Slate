# Task 003: Encapsulate Global Variables & Input Logic

**Status:** PENDING
**Priority:** MEDIUM
**Assignee:** Codex CLI

## Context
The current `src/main.js` relies heavily on file-level global variables (`evCache`, `activeStroke`, `state`, `solutionData`, etc.). This makes refactoring risky and testing impossible. We need to group these variables into cohesive Modules or Classes.

## Goals
1.  **Create `StateManager`:** Encapsulate `state` object and `solutionData`.
2.  **Create `InputManager`:** Encapsulate input-related variables (`evCache`, `activeStroke`, `lastRawPoint`, etc.) and related functions (`handlePointerDown`, `smoothPoint`, etc.).
3.  **No Logic Changes:** Keep the internal logic same, just refactor the structure.

## Requirements

### 1. `src/logic/store.js` (New File)
*   Move the `state` object here.
*   Export methods to mutate state (e.g., `setTool`, `setPenColor`, `nextPage`).
*   *Note:* Keep it simple. No Redux-like complexity yet.

### 2. `src/logic/input.js` (New File)
*   Move `evCache`, `activeStroke`, `isDrawing`, `isPanning` variables inside a class (e.g., `InputHandler`).
*   Move pointer event handlers (`handlePointerDown`, `handlePointerMove`, `handlePointerUp`) into this class.
*   Accept `canvas` and `state` as constructor dependencies.

### 3. Refactor `src/main.js`
*   Import `store` and `InputHandler`.
*   Replace global variable access with module access (e.g., `state.tool` -> `store.state.tool`).
*   Initialize `InputHandler` and bind events.

## Risk Management (Attention Codex!)
*   **`this` Binding:** Be very careful when moving event handlers to a class. Ensure `this` context is preserved (use `.bind(this)` or arrow functions).
*   **Event Listeners:** Make sure to remove old listeners before adding new ones if you use hot-reload, though pure refresh is safer.

## Output
*   New: `src/logic/store.js`
*   New: `src/logic/input.js`
*   Modified: `src/main.js`
