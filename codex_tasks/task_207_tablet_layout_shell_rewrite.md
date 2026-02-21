# Task 207: Tablet Layout Shell Rewrite

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Rewrite tablet/mobile app shell behavior in `AppLayout` to prioritize canvas continuity and safe-area aware chrome placement.
  - Add deterministic tablet shell profile helper for responsive layout branching.
- What must NOT change:
  - Desktop (`xl+`) authoring structure and existing role-policy visibility decisions must remain behaviorally compatible.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_207_tablet_layout_shell_rewrite.md`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/useTabletShellProfile.ts` (new)

Out of scope:
- Toolbar interaction logic changes (task_208).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - layout shell changes stay in `features/layout`.
- Compatibility:
  - Existing extension slots (`chrome-top-toolbar`, `left-panel`, `toolbar-bottom`) must remain available.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6
- Depends on tasks:
  - [`task_206`]
- Enables tasks:
  - [`task_208`, `task_209`, `task_212`]
- Parallel group:
  - G6-mobile
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
    - `design_drafts/layout_writer_shell_768x1024.svg`
    - `design_drafts/layout_writer_shell_820x1180.svg`
    - `design_drafts/layout_writer_shell_1024x768.svg`
    - `design_drafts/layout_writer_shell_1180x820.svg`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
    - top chrome min tap target: >=44px
    - bottom chrome safe-area padding: >= `env(safe-area-inset-bottom)` + 8px
    - canvas horizontal inset on tablet portrait: <=16px
    - left panel auto-overlay threshold: width < 1180px
  - [x] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W6 (`task_207~212`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - `AppLayout` + layout profile single-owner
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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Tablet shell profile is applied in `AppLayout` and responds to portrait/landscape breakpoints deterministically.
- [x] AC-2: Canvas-first layout on tablet keeps role-policy visibility behavior intact.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open app in 768x1024, 820x1180, 1024x768, 1180x820 responsive views.
   - Expected result: chrome placement follows tablet shell profile and canvas remains primary.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: host/student role toggle with same viewports.
   - Expected result: policy-driven visibility invariants remain unchanged.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Tablet branch can unintentionally alter desktop spacing.
- Roll-back:
  - Isolate tablet profile branch behind breakpoint predicate; fallback to current desktop path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 진행바람."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/useTabletShellProfile.ts`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`, `run_repo_verifications`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - N/A
- Mitigation:
  - N/A

Manual verification notes:
- Tablet shell profile branch activates compact insets/left-panel overlay behavior under tablet breakpoints while preserving role-policy slot rendering.

Notes:
- Safe-area bottom padding is applied via layout profile toggle for tablet/mobile chrome.
