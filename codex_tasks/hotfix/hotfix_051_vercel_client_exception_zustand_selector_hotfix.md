# Hotfix 051: Vercel Client Exception (Zustand Selector Stability)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Fix production client-side crash after deploy caused by unstable Zustand selector snapshots.
  - Replace inline object selectors with stable primitive/function selectors.
- What must NOT change:
  - No behavior change in Mod Studio workflows.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/core/ModStudioShell.tsx`
- `v10/src/features/mod-studio/core/ModStudioPanel.tsx`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/AI_READ_ME.md`

Out of scope:
- Mod Studio feature expansion.
- Store schema redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep Zustand store API unchanged.
  - Only selector consumption pattern can change.
- Compatibility:
  - Existing production build/deploy flow remains unchanged.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - hotfix single-task
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - single implementer (no conflict)
  - Parallel slot plan:
    - N/A

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: YES
- If YES:
  - User-approved hotfix scope:
    - Runtime crash fix for deployed production white-screen.
  - Exact touched files:
    - `v10/src/features/mod-studio/core/ModStudioShell.tsx`
    - `v10/src/features/mod-studio/core/ModStudioPanel.tsx`
    - `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: No inline object selector remains in newly added Mod Studio selector usages.
- [x] AC-2: Production build passes.
- [x] AC-3: Layer/lint/build checks pass.
- [x] AC-4: Hotfix scope remains minimal.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "useModStudioStore\\(\\(state\\) => \\(\\{" v10/src/features/mod-studio`
   - Expected result: no matches.
   - Covers: AC-1

2) Step:
   - Command / click path: `scripts/check_layer_rules.sh`
   - Expected result: PASS.
   - Covers: AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Minimal; selector access pattern only.
- Roll-back:
  - Revert this hotfix commit if regression appears.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/mod-studio/core/ModStudioShell.tsx`
- `v10/src/features/mod-studio/core/ModStudioPanel.tsx`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Inline object selector usage removed from hotfix scope files.
- Production build compiles cleanly.

Notes:
- Root cause hypothesis: unstable selector snapshots in Zustand v5 causing client runtime render loop on production bundle.
