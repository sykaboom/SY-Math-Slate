# Task 139: Policy-as-Data v1 Final Cutover

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Replace remaining role hardcoding in runtime UI/action gating with policy resolver calls.
  - Move role visibility and command/tool permission rules to policy data as SSOT.
- What must NOT change:
  - No behavior regression for current `host` / `student` baseline.
  - No bypass path that mutates doc state outside policy checks.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/config/rolePolicy.ts`
- `v10/src/core/config/rolePolicyGuards.ts`
- `v10/src/features/layout/**`
- `v10/src/features/extensions/commandExecutionPolicy.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- Mod Studio GUI.
- Realtime network sync.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Policy resolution in `core/config`, UI wiring in `features/**`.
  - Unknown role/surface/action must evaluate to deny.
- Compatibility:
  - Existing persisted docs remain compatible.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: policy core
    - B: command/tool policy hooks
    - C: layout visibility wiring
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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: No primary runtime role gating in touched files uses direct literal branching.
- [ ] AC-2: Role permission and visibility decisions resolve through policy helpers.
- [ ] AC-3: Unknown role/action/surface inputs are denied deterministically.
- [ ] AC-4: `scripts/check_layer_rules.sh` and lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "role ===|role !==" v10/src/features/layout v10/src/features/extensions`
   - Expected result: touched decision paths use policy helpers.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `scripts/check_layer_rules.sh`
   - Expected result: PASS.
   - Covers: AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misconfigured policy may hide required controls.
- Roll-back:
  - Revert policy wiring commits and restore previous branch conditions.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/config/rolePolicy.ts`
- `v10/src/features/extensions/commandExecutionPolicy.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `rg -n "role ===|role !==" v10/src/features/layout v10/src/features/extensions || true`
- `scripts/check_layer_rules.sh`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/check_v10_legacy_freeze.sh`
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
- `features/layout` + `features/extensions` 경로에서 1차 role literal 분기 검색 결과 0건 확인.
- command/tool approval queue path는 role policy helper 기반으로 중앙화된 결과 확인.

Notes:
- Policy-as-Data 기준으로 unknown role/surface/action은 deny-by-default 유지.
