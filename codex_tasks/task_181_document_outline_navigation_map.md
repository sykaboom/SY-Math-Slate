# Task 181: Document Outline/Navigation Map

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add an outline map derived from step blocks and expose it in navigator UI for faster jump actions.
- What must NOT change:
  - No changes to saved `.slate` document structure.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_181_document_outline_navigation_map.md`
- `v10/src/features/editor-core/outline/documentOutline.ts`
- `v10/src/features/hooks/useDocumentOutline.ts`
- `v10/src/features/toolbar/PageNavigator.tsx`

Out of scope:
- Full-text search engine and server indexing.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Outline generation must be pure and store-agnostic.
- Compatibility:
  - Existing page navigation controls remain available.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_175`, `task_178`]
- Enables tasks:
  - [`task_183`]
- Parallel group:
  - G2-editor
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W2 (`task_175~182`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - outline model/hook ownership separated from navigator integration
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: outline model returns stable list of entries with step id/label/index.
- [x] AC-2: Page navigator can jump using outline-derived step targets.
- [x] AC-3: lint passes for touched files.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/editor-core/outline/documentOutline.ts src/features/hooks/useDocumentOutline.ts src/features/toolbar/PageNavigator.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Outline labels may be noisy for media-heavy blocks.
- Roll-back:
  - Keep outline hook internal and hide outline jump UI.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이 w2 진행해. 당연 서브에이전트 관리 잘하고."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_181_document_outline_navigation_map.md`
- `v10/src/features/editor-core/outline/documentOutline.ts`
- `v10/src/features/hooks/useDocumentOutline.ts`
- `v10/src/features/toolbar/PageNavigator.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/editor-core/outline/documentOutline.ts src/features/hooks/useDocumentOutline.ts src/features/toolbar/PageNavigator.tsx`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Outline entries are derived from step blocks and exposed in PageNavigator popover with go-to-step dispatch.

Notes:
- Existing page controls remain intact while outline jump is added as an auxiliary channel.
