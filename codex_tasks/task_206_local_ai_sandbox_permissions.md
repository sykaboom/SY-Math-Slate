# Task 206: Local AI Sandbox Permissions

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add local AI sandbox permission guard enforcing allowlist checks for local runtime requests.
  - Ensure sandbox decision is centralized and auditable before local adapter execution.
- What must NOT change:
  - Existing role-based approval interception (`student` queue) must remain active and unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_206_local_ai_sandbox_permissions.md`
- `v10/src/core/extensions/localAiSandboxPolicy.ts` (new)
- `v10/src/core/extensions/connectors.ts` (sandbox preflight hook)
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx` (sandbox context wiring)
- `v10/src/features/platform/observability/auditLogger.ts` (sandbox decision event)

Out of scope:
- OS-level sandboxing or process isolation.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Sandbox policy lives in core extensions; no direct UI/store imports.
- Compatibility:
  - Default policy must be deny-by-default only for local-runtime sensitive actions and must not break non-local adapters.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - [`task_199`, `task_200`, `task_201`, `task_202`, `task_205`]
- Enables tasks:
  - [`task_207`, `task_213`]
- Parallel group:
  - G5-security
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

- [x] AC-1: Local sandbox policy can deterministically allow/deny local adapter execution requests.
- [x] AC-2: Denied local requests return stable error code and emit audit event without mutation side effects.
- [x] AC-3: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke local adapter request with deny and allow policy fixtures.
   - Expected result: deny returns deterministic error; allow proceeds to adapter execution path.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: inspect audit event stream for sandbox decision event payload.
   - Expected result: redacted JSON-safe event emitted on deny/allow decisions.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict default sandbox could block intended local flows.
- Roll-back:
  - ship deny scope narrowly (`local:*` adapter ids) and allow explicit env-controlled overrides.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음웨이브 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/extensions/localAiSandboxPolicy.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/observability/auditLogger.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
- `node scripts/gen_ai_read_me_map.mjs`

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
- local sandbox policy가 local-sensitive adapter에 대해 handshake 기반 allow/deny 결정을 deterministic code로 반환함을 확인.
- deny 경로는 adapter invoke 이전 preflight에서 차단되고 sandbox decision audit event가 발행됨.
- end-stage verification 전체 PASS.

Notes:
- preflight hook은 global configure/reset API로 bootstrap lifecycle에 맞춰 등록/정리됨.
