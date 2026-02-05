# Task 065: Data/Font Styles Architecture & UI

## Status
- [ ] PENDING
- [ ] IN_PROGRESS
- [ ] COMPLETED

## Goal
Implement a granular typography and rich-text system that allows users to customize font styles (family, size, weight, color) for text data. This must include an intuitive "text editor" style interface in the Data Input Panel for easy application of Bold, Color, and Size changes to selected text segments.

## Scope
- `v10/src/core/types/canvas.ts`: Ensure `StepBlock` and `StepSegment` types support optional styling data.
- `v10/src/core/config/typography.ts`: (NEW) Define typography constants, color palettes, and size increments.
- `v10/src/features/layout/autoLayout.ts`: Update layout logic to faithfully measure and render rich HTML (inline styles).
- `v10/src/features/layout/DataInputPanel.tsx`: 
    - Add a formatting toolbar for `contentEditable` segments (Bold, Color, Font Size).
    - Implement selection-based styling (wrapping text in `<b>` or `<span style="...">`).
- `v10/src/features/store/useCanvasStore.ts`: Ensure store actions correctly handle and persist rich HTML content.

## Acceptance Criteria
1.  [ ] **Granular Styling (Selection-based)**:
    - Users can select text within a block in the Data Input Panel and apply **Bold**.
    - Users can select text and change the **Text Color** via a preset palette.
    - Users can select text and change the **Font Size** (relative or absolute increments).
2.  [ ] **UI/UX (Text Editor Ease)**:
    - A formatting toolbar appears near or within the block being edited.
    - Buttons for Bold (B), Color (A), and Size (T) provide instant feedback.
3.  [ ] **Font Family Support**:
    - Support global or block-level font family switching:
        - Sans: `Noto Sans KR` (Default)
        - Serif: `Noto Serif KR`
        - Handwriting: `Nanum Pen Script`
4.  [ ] **AutoLayout Consistency**:
    - The layout engine must accurately measure text with varying sizes and weights to prevent overlapping.
    - Inline styles must be preserved during the `autoLayout` cycle.
5.  [ ] **Persistence**:
    - Styled text (HTML tags) must be correctly saved to and loaded from `.slate` files.
    - Backward compatibility: Plain text blocks should render with default styles.

## Risks / Roll-back Notes
- **XSS Security**: Since we are storing and rendering HTML (`innerHTML`), strict sanitization via `DOMPurify` is mandatory.
- **Measurement Accuracy**: `autoLayout` depends on accurate browser measurements. Complex nested styles might introduce subtle measurement delays or errors.
- **`contentEditable` Complexity**: Managing selection and range across MathJax tokens ($$) and rich text tags can be tricky. Use a robust utility for selection wrapping.

## Proposed Implementation Plan (Codex)
1.  **Define Typography Config**: Create `v10/src/core/config/typography.ts` with font families and presets.
2.  **Update Types**: Modify `v10/src/core/types/canvas.ts`.
3.  **Update Store**: Ensure `importStepBlocks` and other actions handle the new `style` field.
4.  **Refactor AutoLayout**:
    - Update `buildTextSegment` to use styles from the segment.
    - Ensure `measureStep` transfers style to `TextItem`.
5.  **Enhance DataInputPanel UI**:
    - Add a "Global Style" selector.
    - Add a per-block style preset selector (Header/Body/Small).
6.  **Verify**: Test with various font sizes and families to ensure overflow handling works.
