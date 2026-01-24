# Task 003: Toolbar & Interaction Components

**Status:** COMPLETED
**Priority:** MEDIUM
**Assignee:** Codex CLI
**Dependencies:** Task 002 (UI Architecture)

## Context
In the legacy app, the toolbar logic is mixed with canvas logic inside `main.js`. We need to separate the **UI Controls** from the **Application State**. We will build the visual components first, which will later trigger actions in the Canvas Engine.

## Goals
1.  Implement the **Floating Toolbar** using Shadcn/UI components.
2.  Create **Pen Options** and **Laser Options** panels (context-aware popovers).
3.  Implement a local UI state store (using Zustand) to manage toolbar visibility and active tools.

## Requirements

### 1. State Management (UI Store)
*   Install Zustand: `npm install zustand`
*   Create `v10/src/store/useUIStore.ts`:
    *   State: `activeTool` ('pen', 'eraser', 'laser', 'hand'), `penColor`, `penWidth`, `isPanelOpen`.
    *   Actions: `setTool`, `setColor`, `togglePanel`.

### 2. Main Toolbar Component (`FloatingToolbar.tsx`)
*   **Location:** Bottom center of the screen.
*   **Style:** Pill-shaped, Glassmorphism (`bg-slate-900/90 backdrop-blur-md rounded-full`).
*   **Items (Lucide Icons):**
    *   `Hand` (Pan/Zoom)
    *   `Pen` (Opens Pen Options on long press/double click)
    *   `Eraser`
    *   `Zap` (Laser - named 'Zap' icon for Laser)
    *   `Divider` (Vertical separator)
    *   `Type` (Text Mode)
    *   `Image` (Upload)
    *   `Undo` / `Redo` (History)

### 3. Contextual Tool Panels
*   **Pen Options (`PenControls.tsx`):**
    *   **Pen Types:** Fountain (Ink), Pencil, Highlighter (ToggleGroup).
    *   **Color Picker:** Preset circles (Yellow, Green, Cyan, Pink, White) + Custom input.
    *   **Sliders:** Thickness, Opacity.
*   **Laser Options (`LaserControls.tsx`):**
    *   **Types:** Standard (Dot + Trail), Highlighter (Line).
    *   **Color:** Red, Yellow, Cyan.

### 4. Interaction Logic
*   Clicking a tool button updates the `useUIStore`.
*   The Toolbar buttons should define an `active` state styling (e.g., `bg-neon-yellow text-black` when active).
*   **Animation:** Use `framer-motion` (optional but recommended for "Gemini's Touch") for smooth panel transitions if library size permits. *For now, use Tailwind transitions.*

## Aesthetic Guidelines
*   **Icons:** Use `lucide-react`. Ensure stroke width is consistent.
*   **Feedback:** Buttons must have clear hover and active states.
*   **Compactness:** The toolbar should not obstruct the canvas. Tool options should appear *above* the main toolbar.

## Deliverables
*   `src/store/useUIStore.ts`
*   `src/components/toolbar/FloatingToolbar.tsx`
*   `src/components/toolbar/PenControls.tsx`
*   `src/components/toolbar/LaserControls.tsx`
*   Integration into `AppLayout.tsx`.
