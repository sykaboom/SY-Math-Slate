# Task 244: Clean Start Shell Cutover (Hardcoding-Zero for Functional Mounts)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Cut over to a Slate-first start shell: heavy authoring panels closed by default and opened via launcher/modules.
  - Enforce hardcoding-zero for functional module mounts in `AppLayout` (runtime skeleton only).
  - Ensure panel behavior remains modding-driven (`windowed/docked/fixed/hidden`) through policy + manifest.
- What must NOT change:
  - Do not remove required host capabilities.
  - Do not alter command contracts.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_244_clean_start_shell_cutover_hardcoding_zero.md`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/layout/windowing/WindowHost.tsx`
- `v10/src/features/layout/windowing/PanelLauncher.tsx` (new or update)
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/store/useChromeStore.ts` (default open/closed state)

Out of scope:
- New module feature development
- Theme preset redesign
- Policy trust backend/API changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `AppLayout` keeps only shell skeleton + slots/window host/launcher.
  - No direct mount of domain controls/panels in shell.
  - Keep student/host outcomes driven by policy, not ad-hoc layout branches.
- Compatibility:
  - Must consume outputs from `task_243`.
  - Must respect SVG/redline pack from `task_238`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-E
- Depends on tasks:
  - [`task_243`]
- Enables tasks:
  - [`task_245`]
- Parallel group:
  - G-shell-cutover
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [ ] SVG path in `design_drafts/`
  - [ ] SVG has explicit `viewBox` (width / height / ratio)
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

Status note:
- BLOCKED until `task_238` completion values are referenced here.

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

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
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Initial host load is Slate-first with heavy panels closed by default.
- [ ] AC-2: Launcher can open required core modules deterministically.
- [ ] AC-3: `AppLayout` has zero direct functional mounts for core panels/controls (runtime skeleton only).
- [ ] AC-4: Student role remains read-focused with edit launchers/modules hidden by policy.
- [ ] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: fresh host load on desktop/tablet viewports.
   - Expected result: clean Slate-first shell, no persistent heavy panel occupancy.
   - Covers: AC-1

2) Step:
   - Command / click path: open/close panel modules from launcher.
   - Expected result: deterministic open path and stable module behavior.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect `AppLayout.tsx`.
   - Expected result: no hardcoded functional module mounts; only shell/slot/window host wiring.
   - Covers: AC-3

4) Step:
   - Command / click path: student role runtime check.
   - Expected result: edit launchers/modules hidden by policy.
   - Covers: AC-4

5) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-cutover can temporarily hide required controls.
  - Incorrect launcher defaults may hurt discoverability.
- Roll-back:
  - Revert shell cutover and restore previous mount path while preserving contract/runtime additions.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (to be filled)

Commands run (only if user asked or required by spec):
- (to be filled)

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- (to be filled)

Notes:
- (to be filled)
