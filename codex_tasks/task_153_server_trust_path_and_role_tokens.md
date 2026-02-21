# Task 153: Server Trust Path and Role Token Hardening

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce trusted server-side role/session validation path.
  - Stop treating client-local role as authoritative for high-impact actions.
- What must NOT change:
  - No breaking login/session behavior for existing users.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/app/api/**` (new/updated)
- `v10/src/core/extensions/mcpGateway.ts`
- `v10/src/features/platform/extensions/commandExecutionPolicy.ts`
- `v10/src/features/platform/extensions/toolExecutionPolicy.ts`
- `v10/src/features/platform/store/useLocalStore.ts`

Out of scope:
- Full auth provider redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (unless user approves auth lib addition)
- Boundary rules:
  - Trust boundary lives in server/API layer.
  - Client role is advisory; privileged checks use signed token/session claim.
- Compatibility:
  - Existing host/student flow preserved.

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
    - A: token/session verifier
    - B: command/tool policy bridge
    - C: local-store trust boundary updates
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

- [ ] AC-1: High-impact mutations require trusted role/session claim.
- [ ] AC-2: Privilege escalation via client-local state is blocked.
- [ ] AC-3: Unauthorized requests fail deterministically and are logged.
- [ ] AC-4: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: simulate client role tampering.
   - Expected result: privileged actions denied.
   - Covers: AC-2

2) Step:
   - Command / click path: valid host token/session action.
   - Expected result: permitted actions still succeed.
   - Covers: AC-1

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misconfigured trust path may block legitimate host actions.
- Roll-back:
  - Restore prior client role flow behind emergency feature flag.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/app/api/trust/role/route.ts`
- `v10/src/core/extensions/mcpGateway.ts`
- `v10/src/features/platform/extensions/commandExecutionPolicy.ts`
- `v10/src/features/platform/extensions/toolExecutionPolicy.ts`
- `v10/src/features/platform/store/useLocalStore.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`
- `scripts/run_beta_quality_gate.sh`

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
- MCP `init`에서 trust API 검증 실패 시 host 세션 발급 거부 확인.
- client-local role 단독 변경만으로 mcp host session 획득이 불가한 경로 확인.
- command/tool policy는 `trustedRoleClaim` 우선 경로로 role 해석.

Notes:
- 기존 host/student UI 플로우는 유지하되, 고권한 mcp 경로에 trust boundary를 추가.
