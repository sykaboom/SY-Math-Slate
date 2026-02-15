# Task 167: Theme Token Schema V2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce a formal semantic theme-token schema (global + module-scoped) for W1 token migration.
- What must NOT change:
  - No feature behavior changes.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_167_theme_token_schema_v2.md`
- `v10/src/core/config/themeTokens.ts` (new)
- `v10/src/features/mod-studio/core/types.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- Full UI hardcoded-style removal.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Schema lives in `core/config` and remains framework-agnostic.
- Compatibility:
  - Existing draft data remains accepted (backward-safe extension).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1
- Depends on tasks:
  - [`task_162`, `task_163`, `task_164`, `task_165`, `task_166`]
- Enables tasks:
  - [`task_168`, `task_169`, `task_170`, `task_171`]
- Parallel group:
  - G1-theme
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
    - W1 (`task_167~174`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - theme token schema files single ownership
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
  - [x] Semantic/rule changes:
    - update AI_READ_ME theme schema references

---

## Acceptance Criteria (Base Required)

- [x] AC-1: semantic token keys are centrally defined in `themeTokens.ts`.
- [x] AC-2: module-scoped token typing is defined and reusable.
- [x] AC-3: Mod studio theme draft type references new token schema.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `cd v10 && npm run lint`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - type migration friction for theme draft consumers.
- Roll-back:
  - revert schema and restore loose `Record<string, string>` typing.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "바로 w1 넘어가자."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_167_theme_token_schema_v2.md`
- `v10/src/core/config/themeTokens.ts`
- `v10/src/features/mod-studio/core/types.ts`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS (`VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` includes full build)
- Script checks:
  - PASS (`scripts/check_layer_rules.sh`)

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
- `themeTokens.ts` now defines reusable global/module token key schema and preset ids.
- `ThemeDraft` references typed token maps while preserving backward-safe token records.

Notes:
- Schema introduced without new dependencies and without feature behavior changes.
