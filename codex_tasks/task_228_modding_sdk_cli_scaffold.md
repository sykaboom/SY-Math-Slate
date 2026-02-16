# Task 228: Modding SDK + CLI Scaffold

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add a minimal Modding SDK facade and local CLI scaffold for manifest-first extension authoring.
  - Provide deterministic scaffold/validation path without new dependencies.
- What must NOT change:
  - Existing runtime plugin loader/command bus behavior must stay backward-compatible.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_228_modding_sdk_cli_scaffold.md`
- `v10/src/core/extensions/sdk/moddingSdk.ts` (new)
- `v10/src/core/extensions/sdk/index.ts` (new)
- `scripts/modding_sdk_cli.mjs` (new)
- `scripts/check_v10_modding_sdk_scaffold.sh` (new)
- `codex_tasks/workflow/modding_sdk_cli_scaffold.md` (new)

Out of scope:
- Marketplace API/runtime publication
- A/B experiment runtime
- UI redesign

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - SDK facade must consume existing command bus / plugin loader contracts only.
- Compatibility:
  - Existing plugin manifest schema (`manifestVersion: 1`) remains source-of-truth.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W10
- Depends on tasks:
  - [`task_227`]
- Enables tasks:
  - [`task_229`, `task_230`]
- Parallel group:
  - G10-growth
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
    - task_228~230
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - sdk and cli files owned by this task.
  - Parallel slot plan:
    - sequential

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

- [x] AC-1: SDK facade exposes `listSlots`, `listCommands`, `validateManifest`, `registerManifest`, and manifest template helper.
- [x] AC-2: CLI scaffold can generate and validate manifest JSON without external dependency.
- [x] AC-3: Guard script validates scaffold artifacts and exits non-zero on missing pieces.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `node scripts/modding_sdk_cli.mjs init --plugin-id demo --slot toolbar-bottom --command setTool --out /tmp/demo.manifest.json`
   - Expected result: scaffold JSON is created.
   - Covers: AC-2

2) Step:
   - Command / click path: `node scripts/modding_sdk_cli.mjs validate --manifest /tmp/demo.manifest.json`
   - Expected result: validation PASS.
   - Covers: AC-2

3) Step:
   - Command / click path: `scripts/check_v10_modding_sdk_scaffold.sh`
   - Expected result: PASS.
   - Covers: AC-1, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - CLI schema drift from runtime manifest validator.
- Roll-back:
  - Revert scaffold and keep runtime-only registration path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "실행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_228_modding_sdk_cli_scaffold.md`
- `v10/src/core/extensions/sdk/moddingSdk.ts`
- `v10/src/core/extensions/sdk/index.ts`
- `scripts/modding_sdk_cli.mjs`
- `scripts/check_v10_modding_sdk_scaffold.sh`
- `codex_tasks/workflow/modding_sdk_cli_scaffold.md`

Commands run (only if user asked or required by spec):
- `node scripts/modding_sdk_cli.mjs list-slots`
- `node scripts/modding_sdk_cli.mjs init --plugin-id demo --slot toolbar-bottom --command setTool --out /tmp/demo.manifest.json`
- `node scripts/modding_sdk_cli.mjs validate --manifest /tmp/demo.manifest.json`
- `scripts/check_v10_modding_sdk_scaffold.sh`

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
- CLI scaffold created/validated manifest successfully without extra dependencies.
- Guard script confirmed presence and runnable behavior of scaffold artifacts.

Notes:
- SDK facade intentionally wraps existing runtime validators rather than redefining contract logic.
