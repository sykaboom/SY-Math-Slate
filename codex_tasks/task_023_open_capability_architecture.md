# Task 023: Open Capability Architecture (Easy Defaults + Power Options)

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 022 (layout cleanup)

## Context
We want the app to be **easy by default** for non-technical instructors, while still offering **high freedom** for power users. This requires a clear architecture that supports progressive complexity without scattering logic across the UI.

## Goals
1) Introduce a **capability profile system** (Basic / Advanced / Pro) that controls UI exposure without removing underlying functionality.  
2) Centralize “what is allowed/exposed” in a **single config module** (SSOT).  
3) Provide **extension points** for future export pipelines (MediaRecorder / FFmpeg / Server) without implementing them yet.

## Non-goals
- No new export pipelines in this task.  
- No new features or UI redesign beyond gating/labels.  
- No new dependencies.

## Scope (touched files)
- `v10/src/config/capabilities.ts` (new)
- `v10/src/store/useUIStore.ts`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/toolbar/PlaybackControls.tsx`
- `v10/src/components/layout/DataInputPanel.tsx`
- `v10/src/components/layout/PlayerBar.tsx`
- `v10/src/lib/exportPipeline.ts` (new, interface-only)

## Requirements
### 1) Capability Profiles (SSOT)
Create `capabilities.ts`:
- `CapabilityKey` union type (e.g., `"basic.playback" | "advanced.speed" | "pro.export"`).
- `CapabilityProfile` type with `name`, `description`, and `enabledCapabilities`.
- Export a `getCapabilities(profile)` helper returning a `Set<CapabilityKey>`.
- Default profile = `basic`.

### 2) UI Store Integration
Add to `useUIStore`:
- `capabilityProfile: "basic" | "advanced" | "pro"`
- `setCapabilityProfile(profile)`
- `isCapabilityEnabled(key)` (or derive via selector)

### 3) Progressive UI Exposure
Gate advanced controls using capabilities:
- Basic: show Play/Stop, Step nav, minimal toolbar.
- Advanced: show speed/delay sliders, auto-play, overview tools.
- Pro: reserved for export-related UI (placeholder labels only).

**Important:** Capabilities only affect **visibility**. Underlying logic stays intact.

### 4) Export Extension Point (Interface only)
Add `exportPipeline.ts` with:
- `ExportProvider` interface (name, supportsAudio, supportsVideo, export(data) -> Promise).
- `exportProviders` registry array (empty or stubbed with MediaRecorder placeholder).
No implementation yet; just a stable interface.

## Acceptance Criteria
1) Default profile = Basic, UI is simplified (no speed/delay sliders).  
2) Switching profile to Advanced exposes speed/delay and auto-play controls.  
3) Capability logic is centralized in `capabilities.ts`.  
4) No new runtime errors; existing playback still works.  
5) Export pipeline exists as interface-only module (no new deps).

## Manual Verification
1) Toggle profile in UI store (temporary hardcode acceptable) and confirm UI changes.  
2) Confirm default profile shows a minimal toolbar.  
3) No change in playback behavior when capabilities are hidden.

---

## Implementation Log (Codex)
**Status:** COMPLETED  
**Changed files:**
- `v10/src/config/capabilities.ts`
- `v10/src/store/useUIStore.ts`
- `v10/src/components/toolbar/FloatingToolbar.tsx`
- `v10/src/components/toolbar/PlaybackControls.tsx`
- `v10/src/components/layout/DataInputPanel.tsx`
- `v10/src/components/layout/PlayerBar.tsx`
- `v10/src/lib/exportPipeline.ts`

**Commands run:** None  
**Notes:** Manual verification not run (per instructions). Default profile is `basic`.
