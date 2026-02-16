# Task 251: Light User Intent-to-Manifest Pipeline

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Specify the light-user flow: natural-language request -> structured plan -> manifest/policy draft -> preview.
  - Ensure light users never need direct module code editing.
- What must NOT change:
  - Do not bypass approval or command bus preflight.
  - Do not add dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_251_light_user_intent_to_manifest_pipeline.md`

Out of scope:
- Heavy-user module packaging
- Runtime implementation

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Generated output must be strict JSON manifest/policy, never executable strings.
  - Keep deny-by-default policy behavior.
- Compatibility:
  - Consumes governance from `task_250`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - M1-LIGHT
- Depends on tasks:
  - [`task_250`]
- Enables tasks:
  - [`task_252`, `task_256`, `task_257`]
- Parallel group:
  - G-light
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

- [ ] AC-1: Intent schema captures user request, constraints, target role, and success criteria.
- [ ] AC-2: Pipeline defines mandatory dry-run and diff preview before apply.
- [ ] AC-3: Failure path defines automatic corrective prompts without raw code exposure to light users.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: review intent schema examples.
   - Expected result: natural-language input is normalized into structured fields.
   - Covers: AC-1

2) Step:
   - Command / click path: review pipeline sequence.
   - Expected result: dry-run and diff preview are mandatory gates.
   - Covers: AC-2

3) Step:
   - Command / click path: review failure handling.
   - Expected result: corrective loop uses prompt-level guidance, not code editing.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Ambiguous intent extraction can generate wrong manifests.
- Roll-back:
  - Restrict to guided template prompts only until parser quality improves.

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

