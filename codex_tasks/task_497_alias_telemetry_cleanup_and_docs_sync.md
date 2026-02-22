# Task 497: Alias Telemetry Dead-code Cleanup + Docs Sync

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - task_496 이후 호출 경로가 사라진 `mod.alias_fallback_hit` audit emit 코드/타입을 제거한다.
  - architecture 문서에서 alias fallback 잔존 전제를 제거하고 retire 상태로 정합화한다.
- What must NOT change:
  - 기존 observability 다른 이벤트(command/extension/moderation 등) 동작 변경 금지.
  - runtime 기능 동작/툴바 렌더 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/observability/auditLogger.ts`
- `v10/docs/architecture/00_AsIs_SystemFlowMap.md`
- `v10/docs/architecture/01_ToBe_EngineModFlowMap.md`
- `v10/docs/architecture/02_Gap_Register_And_RiskMap.md`
- `v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_497_alias_telemetry_cleanup_and_docs_sync.md`

Out of scope:
- check script 정책 변경
- toolbar/layout 코드 변경
- mod package schema 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - observability 파일에서 제거되는 항목은 현재 무참조(dead code)만 대상.
  - architecture 문서 업데이트는 사실 반영만 수행(새 정책 추가 금지).
- Compatibility:
  - 기존 audit event 타입/키 이름 변경 금지(삭제 대상 제외).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-MEDIUM-07
- Depends on tasks:
  - `task_496`
- Enables tasks:
  - `task_498` docs closeout gate (planned)
- Parallel group:
  - G-ALIAS-DOCS-SYNC
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (source + architecture docs)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~20min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 문서/코드 정합은 단일 직렬 검증이 drift를 줄인다.

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

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `auditLogger.ts`에서 alias fallback audit payload/type/emit 함수가 제거된다.
- [x] AC-2: architecture 문서 4종에서 alias fallback 잔존 전제가 retire 상태로 정정된다.
- [x] AC-3: `bash scripts/check_mod_contract.sh` + `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "emitModAliasFallbackHitAuditEvent|ModAliasFallbackHitAuditPayload|mod\.alias_fallback_hit" v10/src/features/platform/observability/auditLogger.ts`
   - Expected result:
     - 매치 없음.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "legacy alias fallback|alias fallback" v10/docs/architecture/00_AsIs_SystemFlowMap.md v10/docs/architecture/01_ToBe_EngineModFlowMap.md v10/docs/architecture/02_Gap_Register_And_RiskMap.md v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md`
   - Expected result:
     - 잔존/활성 표현이 제거되고 retire/zero-budget 관리 문구로 치환.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 문서 문맥 수정 시 phase 용어가 과도하게 변경될 수 있음.
- Roll-back:
  - auditLogger 제거 블록 및 문서 변경 각각 커밋 단위 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "커밋/푸시 이후 이어서 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/observability/auditLogger.ts`
- `v10/docs/architecture/00_AsIs_SystemFlowMap.md`
- `v10/docs/architecture/01_ToBe_EngineModFlowMap.md`
- `v10/docs/architecture/02_Gap_Register_And_RiskMap.md`
- `v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/task_497_alias_telemetry_cleanup_and_docs_sync.md`

Commands run (only if user asked or required by spec):
- `rg -n "emitModAliasFallbackHitAuditEvent|ModAliasFallbackHitAuditPayload|mod\\.alias_fallback_hit" v10/src/features/platform/observability/auditLogger.ts || true`
- `rg -n "legacy alias fallback|alias fallback" v10/docs/architecture/00_AsIs_SystemFlowMap.md v10/docs/architecture/01_ToBe_EngineModFlowMap.md v10/docs/architecture/02_Gap_Register_And_RiskMap.md v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md || true`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
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
- AC-1 PASS: alias fallback audit payload/type/emit 함수 제거 확인.
- AC-2 PASS: architecture 문서 4종에 alias runtime retire 상태 반영.
- AC-3 PASS: `check_mod_contract.sh`, lint, build 모두 PASS.

Notes:
- 문서에서 `legacy alias fallback` 문자열은 “잔존” 의미가 아니라 “retired/zero-budget” 문맥으로 유지된다.
