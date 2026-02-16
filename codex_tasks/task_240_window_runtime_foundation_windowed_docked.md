# Task 240: Window Runtime Foundation (Windowed/Docked)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Build the headless window runtime foundation that can render panel modules in `windowed` or `docked` mode from declarative config.
  - Provide deterministic drag, clamp, reset, and z-order focus behavior as shared runtime primitives.
- What must NOT change:
  - Do not migrate DataInput/FloatingToolbar internals in this task.
  - Do not introduce role policy branching in `AppLayout`.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_240_window_runtime_foundation_windowed_docked.md`
- `v10/src/features/layout/windowing/windowRuntime.types.ts` (new)
- `v10/src/features/layout/windowing/windowRuntime.ts` (new)
- `v10/src/features/layout/windowing/useWindowRuntime.ts` (new)
- `v10/src/features/layout/windowing/WindowHost.tsx` (new)
- `v10/src/features/store/useChromeStore.ts` (minimal state surface update if needed)

Out of scope:
- Panel module adapter cutover (handled in `task_242`)
- Core control dogfooding (handled in `task_243`)
- Clean start shell cutover (handled in `task_244`)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Follow `sy-slate-architecture-guardrails` layer boundaries.
  - Runtime state must stay JSON-safe.
  - No `window` global assignments.
- Compatibility:
  - Must consume panel behavior contract from `task_237`.
  - Must conform to SVG/redline constraints from `task_238`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-B
- Depends on tasks:
  - [`task_237`, `task_238`]
- Enables tasks:
  - [`task_241`, `task_242`]
- Parallel group:
  - G-window-core
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
- BLOCKED until `task_238` is completed and references are copied into this spec before coding.

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

- [ ] AC-1: Runtime supports `displayMode: 'windowed' | 'docked'` with deterministic render path.
- [ ] AC-2: `movable=false` disables drag; `movable=true` allows drag within clamped bounds.
- [ ] AC-3: Reset action restores `defaultPosition` from contract and clamps to viewport.
- [ ] AC-4: Window runtime state is serializable/JSON-safe and free from DOM references.
- [ ] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `windowRuntime` types/hooks.
   - Expected result: mode/drag/reset/clamp semantics exist in shared runtime APIs.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: inspect state shape in store/runtime.
   - Expected result: only JSON-safe values (string/number/boolean/object/array).
   - Covers: AC-4

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Clamp math bugs could make panels unreachable on tablet.
  - Runtime API churn may ripple to adapter tasks.
- Roll-back:
  - Revert `windowing` runtime files and restore previous panel host path.

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
