# Task 035: Data Panel Break Styling & Step Labeling

**Status:** COMPLETED  
**Priority:** HIGH  
**Assignee:** Codex CLI  
**Dependencies:** Task 034

## Context
The Data Input panel lists both content blocks and break blocks. The current labeling (Step numbers on every block) is confusing when break blocks are inserted. We need clearer visual semantics: step labels for content only, and distinct break labels.

## Goals
1. **Step labels only for content blocks.**
2. **Break blocks are compact and label-only** (no step number).
3. **Color coding:**
   - Step labels: yellow
   - Break labels: neon purple

## Requirements
1. **Content blocks:**
   - Keep “Step N” label.
   - Apply yellow color class to the label.
2. **Break blocks:**
   - Remove step number label.
   - Render a compact block with label text only.
   - Label text color: neon purple.
   - Preserve drag/delete/move actions.
3. **Layout:** break blocks should take less vertical space than content blocks.

## Scope (touched files)
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/app/globals.css`

## Acceptance Criteria
1. Content blocks show “Step N” in yellow.
2. Break blocks show only their label (no Step number), in neon purple.
3. Break blocks are visually smaller than content blocks.

## Manual Verification
1. Insert a line/column/page break; confirm it renders as a compact purple label without step number.
2. Content blocks retain “Step N” in yellow and remain readable.

## Closeout Notes
- Break blocks are compact and label-only in the panel.
- Step numbering now ignores break blocks (content-only).
- Step/break colors are centralized in `globals.css`.
