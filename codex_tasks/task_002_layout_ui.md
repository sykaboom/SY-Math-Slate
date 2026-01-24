# Task 002: UI Architecture & Layout Design

**Status:** COMPLETED
**Priority:** HIGH
**Assignee:** Codex CLI
**Dependencies:** Task 001 (v10 Init)

## Context
The legacy application uses a raw CSS/HTML structure with a monolithic `style.css`. We need to establish a modern, component-based UI architecture using **Shadcn/UI** and **Tailwind CSS**. The goal is to retain the "Dark Mode Math Slate" identity while improving visual hierarchy and responsiveness.

## Goals
1.  Install and configure **shadcn/ui** (headless accessible components).
2.  Define the **Design System** (Colors, Typography) in `tailwind.config.ts`.
3.  Implement the **Global Layout** (Header, Toolbar, Canvas Area).

## Requirements

### 1. Shadcn/UI Setup
*   Run `npx shadcn-ui@latest init` inside `v10/`.
*   **Config:**
    *   Style: `Default`
    *   Base Color: `Slate`
    *   CSS Variables: `Yes`
*   **Install Components:**
    *   `button`, `slider`, `toggle`, `separator`, `popover`, `dialog`, `tooltip`.

### 2. Design System (Tailwind Config)
*   Update `v10/tailwind.config.ts` to include custom colors extended from the legacy app:
    *   **Backgrounds:**
        *   `slate-app`: `#111111` (Main BG)
        *   `slate-panel`: `rgba(30, 30, 30, 0.95)` (Floating Panels)
    *   **Accents (Neon Style):**
        *   `neon-yellow`: `#FFFF00` (Step/Pen)
        *   `neon-cyan`: `#00FFFF` (Accent/Selection)
        *   `neon-pink`: `#FF10F0` (Highlight)
        *   `neon-green`: `#39FF14` (Success/Pen)
    *   **Functional:**
        *   `cursor-blink`: `#FFA500`

### 3. Layout Implementation
*   Create `v10/src/components/layout/AppLayout.tsx`:
    *   **Structure:**
        *   **Top Bar (Optional):** Title, Theme Toggle, Zoom Controls.
        *   **Main Area:**
            *   **Canvas Layer (Z-Index 0):** Full screen absolute.
            *   **Content Layer (Z-Index 10):** Interactive text elements.
        *   **Floating Toolbar (Bottom/Center):** Replaces the old `#ui-layer`.
            *   Use a centralized, floating rounded container (Glassmorphism effect).
*   Update `v10/src/app/page.tsx` to use this layout.

### 4. Component Migration (Draft)
*   Create `v10/src/components/toolbar/PenTools.tsx` (Stub only).
*   Create `v10/src/components/toolbar/LaserTools.tsx` (Stub only).

## Aesthetic Guidelines (Gemini's Touch)
*   **Glassmorphism:** Use `backdrop-blur-md` and `bg-slate-900/80` for panels instead of solid colors.
*   **Borders:** Subtle `border-white/10` for depth.
*   **Typography:** Use `Inter` or `Noto Sans KR` (configure via `next/font`).

## Deliverables
*   `tailwind.config.ts` with custom colors.
*   `components.json` (Shadcn config).
*   `src/components/layout/AppLayout.tsx` and related UI components.
*   A visually polished "Empty Slate" screen in `page.tsx`.
