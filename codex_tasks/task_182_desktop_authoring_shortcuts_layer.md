# Task 182: Desktop Authoring Shortcuts Layer

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add desktop keyboard shortcuts layer routed through command dispatch (undo/redo/step/page/navigation basics).
- What must NOT change:
  - No shortcut interception while typing in input/contentEditable fields.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_182_desktop_authoring_shortcuts_layer.md`
- `v10/src/features/shortcuts/useAuthoringShortcuts.ts`
- `v10/src/features/layout/AppLayout.tsx`

Out of scope:
- Mobile/tablet gesture shortcuts and user-custom shortcut editor.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Shortcut module remains headless hook; no direct DOM writes beyond event subscription.
- Compatibility:
  - Existing toolbar click behavior unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - [`task_176`, `task_180`, `task_181`]
- Enables tasks:
  - [`task_190`]
- Parallel group:
  - G3-runtime
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

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
    - shortcut hook single-owner; AppLayout integration sequential
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

- [x] AC-1: Desktop shortcut hook dispatches command path for undo/redo/step/page operations.
- [x] AC-2: Shortcuts are suppressed while focused on input/textarea/contentEditable elements.
- [x] AC-3: `cd v10 && npm run lint && npm run build` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint -- --max-warnings=0 -- src/features/shortcuts/useAuthoringShortcuts.ts src/features/layout/AppLayout.tsx`
   - Expected result: PASS.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run build`
   - Expected result: PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Unexpected hotkey collisions with browser defaults.
- Roll-back:
  - Gate hook behind feature flag and disable by default.

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
- `codex_tasks/task_182_desktop_authoring_shortcuts_layer.md`
- `v10/src/features/shortcuts/useAuthoringShortcuts.ts`
- `v10/src/features/layout/AppLayout.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/shortcuts/useAuthoringShortcuts.ts src/features/layout/AppLayout.tsx`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

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
- Desktop shortcuts hook is wired in AppLayout and suppresses shortcut dispatch while typing in editable controls.

Notes:
- Shortcut map includes undo/redo, step nav, and page nav through command dispatch only.
