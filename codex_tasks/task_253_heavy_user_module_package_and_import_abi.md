# Task 253: Heavy User Module Package and Import ABI

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify heavy-user module package format and import ABI so advanced users can design modules directly and import them safely.
  - Define compatibility/versioning for module manifests and action bindings.
- What must NOT change:
  - Do not allow arbitrary executable payload injection.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_253_heavy_user_module_package_and_import_abi.md`

Out of scope:
- Light-user intent parsing
- Runtime implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Import format must be JSON-first with strict validation.
  - No eval/new Function style execution paths.
- Compatibility:
  - Align with existing plugin manifest and command bus boundaries.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M1-HEAVY
- Depends on tasks:
  - [`task_250`]
- Enables tasks:
  - [`task_254`, `task_256`, `task_257`]
- Parallel group:
  - G-heavy
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Module package format defines metadata, UI slots, command bindings, and compatibility version.
- [ ] AC-2: Import ABI defines validation failure codes and deterministic rejection behavior.
- [ ] AC-3: Upgrade path for future manifest versions is documented.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect package schema section.
   - Expected result: all required fields are explicitly typed and constrained.
   - Covers: AC-1

2) Step:
   - Command / click path: inspect import failure matrix.
   - Expected result: deterministic error codes and no silent fallback.
   - Covers: AC-2

3) Step:
   - Command / click path: inspect versioning/migration section.
   - Expected result: forward-compat and migration notes exist.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ABI ambiguity can break third-party modules.
- Roll-back:
  - Freeze to prior manifest ABI until migration tooling is ready.

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

