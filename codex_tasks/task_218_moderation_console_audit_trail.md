# Task 218: Moderation Console and Audit Trail

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add moderation console headless view-model + UI panel for reviewing reports and approval/audit streams.
  - Extend audit trail emission for moderation decisions with redacted JSON-safe payloads.
- What must NOT change:
  - Existing approval queue functionality must remain operational.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_218_moderation_console_audit_trail.md`
- `v10/src/features/governance/moderation/useModerationConsole.ts` (new)
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx` (new)
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/observability/auditLogger.ts`
- `v10/src/features/governance/community/store/useCommunityStore.ts`

Out of scope:
- Global layout geometry refactors.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Moderation domain logic must remain separate from canvas mutation logic.
- Compatibility:
  - Moderation panel rendering must be role-gated and non-blocking for host authoring workflows.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W7
- Depends on tasks:
  - [`task_216`, `task_217`]
- Enables tasks:
  - [`task_219`, `task_220`]
- Parallel group:
  - G7-platform
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

- [x] AC-1: Host-only moderation console displays report queue and emits moderation audit events.
- [x] AC-2: Moderation actions update community report state deterministically.
- [x] AC-3: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: create reports then open moderation console as host.
   - Expected result: report queue and action controls render correctly.
   - Covers: AC-1

2) Step:
   - Command / click path: approve/reject moderation actions.
   - Expected result: report status updates and audit trail entries are emitted.
   - Covers: AC-1, AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - New slot injection could clutter toolbar-bottom region.
- Roll-back:
  - keep moderation panel registration isolated in core slot registry.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 위임모드로 진행! 역시 서브에이전트 설계부터하고 하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/governance/moderation/useModerationConsole.ts`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/observability/auditLogger.ts`
- `v10/src/features/governance/community/useCommunityActions.ts`
- `v10/src/app/api/community/route.ts`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
- `node scripts/gen_ai_read_me_map.mjs`

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
- Host-only moderation console is registered to slot runtime, shows pending/resolved reports, and emits moderation-channel audit entries on approve/reject.

Notes:
- Audit stream includes moderation channel events with existing redaction + JSON-safe payload shaping.
