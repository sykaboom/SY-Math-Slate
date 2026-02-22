# Task 505: ExtensionRuntimeBootstrap Slicing Stage 1 (parser/normalizer extraction)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `ExtensionRuntimeBootstrap.tsx` 상단의 파서/정규화 유틸 묶음을 별도 runtime module로 추출한다.
  - bootstrap 컴포넌트는 orchestration 역할만 남기고 유틸 로직을 분리한다.
- What must NOT change:
  - extension routing/fallback/approval 런타임 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/extensions/ui/runtime/bootstrapParsers.ts` (new)
- `v10/src/features/platform/extensions/ui/runtime/bootstrapHealthHints.ts` (new)
- `v10/src/features/platform/extensions/ui/runtime/index.ts` (new)
- `codex_tasks/task_505_extension_runtime_bootstrap_slicing_stage1.md`

Out of scope:
- gateway handshake 정책 변경
- adapter route 실행 정책 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 추출 모듈은 동일 feature 하위에서만 재배치.
- Compatibility:
  - existing audit/telemetry 이벤트 계약 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-EXT-1
- Depends on tasks:
  - `task_503`
- Enables tasks:
  - `task_506`
- Parallel group:
  - G-P6-SLICE-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - `ExtensionRuntimeBootstrap.tsx` (task_506)
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~40min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO (task_506과 동일 파일 잠금)
- Rationale:
  - Bootstrap 대형 파일 분해의 1단계로 직렬 수행 필요.

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
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [ ] Semantic/rule changes:
  - N/A

---

## Acceptance Criteria (Base Required)

- [x] AC-1: parser/normalizer 함수군이 신규 runtime 모듈로 이동.
- [x] AC-2: `ExtensionRuntimeBootstrap.tsx` 라인 수가 baseline(942) 대비 감소.
- [x] AC-3: `bash scripts/check_mod_contract.sh` PASS.
- [x] AC-4: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "isRecord|pickPreferredLocalAdapterIds|pickLocalHealthHints|normalizeHealthHint" v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx v10/src/features/platform/extensions/ui/runtime/*.ts`
   - Expected result:
     - 유틸 함수가 runtime 파일로 분리.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `wc -l v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
   - Expected result:
     - 기존 942보다 감소.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - health hint 파싱 누락 시 fallback 경로 오동작 가능.
- Roll-back:
  - bootstrap + runtime 모듈 동시 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/extensions/ui/runtime/bootstrapParsers.ts`
- `v10/src/features/platform/extensions/ui/runtime/bootstrapHealthHints.ts`
- `v10/src/features/platform/extensions/ui/runtime/index.ts`

Commands run (only if user asked or required by spec):
- `rg -n "isRecord|pickPreferredLocalAdapterIds|pickLocalHealthHints|normalizeHealthHint" v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx v10/src/features/platform/extensions/ui/runtime/*.ts`
- `wc -l v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- ...
