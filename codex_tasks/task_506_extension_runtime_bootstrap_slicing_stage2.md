# Task 506: ExtensionRuntimeBootstrap Slicing Stage 2 (gateway/routing extraction)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `ExtensionRuntimeBootstrap.tsx`의 gateway runtime 구성 및 adapter routing orchestration 로직을 별도 모듈로 추출한다.
  - Bootstrap 컴포넌트를 최종 오케스트레이터 형태로 축소한다.
- What must NOT change:
  - MCP gateway handshake/role trust/approval queue 정책 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/extensions/ui/runtime/createBrowserMcpRuntime.ts` (new)
- `v10/src/features/platform/extensions/ui/runtime/createRoutedAdapter.ts` (new)
- `v10/src/features/platform/extensions/ui/runtime/createBootstrapOrchestrator.ts` (new)
- `v10/src/features/platform/extensions/ui/runtime/index.ts`
- `codex_tasks/task_506_extension_runtime_bootstrap_slicing_stage2.md`

Out of scope:
- provider ABI contract 변경
- command bus API 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 추출 모듈은 feature/platform/extensions/ui/runtime 하위 유지.
  - core runtime 내부 import 경계 위반 금지.
- Compatibility:
  - 기존 extension bootstrap side effects 순서 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-P6-SLICE-EXT-2
- Depends on tasks:
  - `task_505`
- Enables tasks:
  - `task_508`
- Parallel group:
  - G-P6-SLICE-B
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - `ExtensionRuntimeBootstrap.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~55min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Stage1 이후 동일 파일 직렬 분해 작업.

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

- [x] AC-1: browser MCP runtime 생성 책임이 분리 모듈로 이동.
- [x] AC-2: routed adapter/fallback orchestration 책임이 분리 모듈로 이동.
- [x] AC-3: `ExtensionRuntimeBootstrap.tsx` 라인 수가 추가로 감소(Stage1 대비).
- [x] AC-4: `bash scripts/check_mod_contract.sh && bash scripts/scan_guardrails.sh` PASS.
- [x] AC-5: `cd v10 && npm run lint && npm run build` PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "createBrowserMcpRuntime|createRoutedAdapter|createBootstrapOrchestrator" v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx v10/src/features/platform/extensions/ui/runtime/*.ts`
   - Expected result:
     - 책임 함수가 분리 모듈로 이동.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `wc -l v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
   - Expected result:
     - Stage1 이후 추가 감소.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && bash scripts/scan_guardrails.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - bootstrap side-effect ordering 변경에 따른 런타임 회귀.
- Roll-back:
  - stage2 분리 모듈 + bootstrap 동시 revert.

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
- `v10/src/features/platform/extensions/ui/runtime/createBrowserMcpRuntime.ts`
- `v10/src/features/platform/extensions/ui/runtime/createRoutedAdapter.ts`
- `v10/src/features/platform/extensions/ui/runtime/createBootstrapOrchestrator.ts`
- `v10/src/features/platform/extensions/ui/runtime/index.ts`

Commands run (only if user asked or required by spec):
- `rg -n "createBrowserMcpRuntime|createRoutedAdapter|createBootstrapOrchestrator" v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx v10/src/features/platform/extensions/ui/runtime/*.ts`
- `wc -l v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/scan_guardrails.sh`
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
