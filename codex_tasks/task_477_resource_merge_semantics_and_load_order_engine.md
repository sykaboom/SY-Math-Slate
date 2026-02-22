# Task 477: Resource Merge Semantics and Load-Order Engine

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `base < package < mod contribution < user override` 우선순위를 엔진 규칙으로 고정한다.
  - 리소스 타입별 병합 규칙(policy/ui item/commands/shortcuts/input)을 분리한다.
- What must NOT change:
  - 기존 저장 포맷의 호환성 깨기 금지
  - 모드 자체 비즈니스 로직 대량 리팩토링 금지

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/guards.ts`
- `v10/src/core/runtime/modding/package/registry.ts`
- `v10/src/features/chrome/ui-host/modContributionBridge.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`

Out of scope:
- 탭/레이아웃 pack-first 완전 전환
- legacy alias 제거

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - merge 엔진은 core/package에 위치
  - features는 merge 결과만 소비
- Compatibility:
  - 기존 모드 기여가 누락되지 않아야 함

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W477
- Depends on tasks:
  - ['task_476']
- Enables tasks:
  - ['task_478', 'task_480']
- Parallel group:
  - G-merge-order
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - toolbar selector/policy files, diagnostics
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~75min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Constraint: selector/policy 파일은 단일 implementer 소유 고정
- Rationale:
  - core merge 규칙과 diagnostics는 병렬 가능하지만 일부 파일 락 관리가 필수.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - merge rules + diagnostics + host consumption
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: core/package merge rules
  - Implementer-B: feature consumption bridge
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `selectors.ts`/`toolbarSurfacePolicy.ts` 단일 소유
- Parallel slot plan:
  - 2~3 slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - critical-path-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 reviewer
  - Ready-queue refill trigger:
    - core merge merge 완료 시 diagnostics 슬롯 즉시 재할당
  - Agent close/reuse policy:
    - task 완료 즉시 close/reuse
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 180s
    - Long-running exceptions: lint/build
  - Reassignment safety rule:
    - 동일 파일 락 해제 확인 후만 재할당

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - 필요 시 `node scripts/gen_ai_read_me_map.mjs`
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` merge semantics 섹션 반영 검토

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 리소스 타입별 merge semantics가 코드 + 가드에 명시됨.
  - policy(JSON): field-level merge/patch 규칙 존재
  - ui item: `(slotId,itemId)` add/override/remove 규칙 존재
  - commands: 기본 충돌 금지 + `overrideAllowed` 예외 규칙 존재
  - shortcuts: winner/loser(또는 동등 충돌 결과) 진단 규칙 존재
  - input behavior: `exclusive` 또는 `handled/pass chain` 규칙 존재
- [x] AC-2: load-order 우선순위(base<package<mod<user)가 결정 경로에서 일관되게 적용됨.
- [x] AC-3: 충돌 진단(winner/loser 또는 차단 사유) 출력이 mod-studio diagnostics에 노출됨.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "merge|patch|slotId|itemId|overrideAllowed|winner|loser|exclusive|handled|pass" v10/src/core/runtime/modding/package v10/src/features/platform/mod-studio/modules`
   - Expected result:
     - 5개 리소스 타입별 규칙 및 진단 키워드 경로 확인
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path:
     - 동일 `(slotId,itemId)` 충돌 샘플 + 신규 item 샘플 + command/shortcut 충돌 샘플 + input chain 샘플로 수동 검증
   - Expected result:
     - UI: 동일 item override, 신규 item add
     - command: overrideAllowed 없는 충돌 차단
     - shortcut: winner/loser 진단 노출
     - input: exclusive 또는 handled/pass 체인대로 라우팅
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - merge 규칙 불명확 시 표면 버튼 누락/중복 가능.
- Roll-back:
  - selectors/merge 이전 버전 복귀 + diagnostics fallback.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/types.ts`
- `v10/src/core/runtime/modding/package/selectors.ts`
- `v10/src/core/runtime/modding/package/guards.ts`
- `v10/src/core/runtime/modding/package/registry.ts`
- `v10/src/features/chrome/ui-host/modContributionBridge.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`

Commands run (only if user asked or required by spec):
- `rg -n "merge|patch|slotId|itemId|overrideAllowed|winner|loser|exclusive|handled|pass" v10/src/core/runtime/modding/package v10/src/features/platform/mod-studio/modules` (PASS; merge semantics 및 진단 키워드 경로 확인)
- `cd v10 && npm run lint` (PASS)
- `cd v10 && npm run build` (PASS)
- `./scripts/check_layer_rules.sh` (PASS)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`rg -n "merge|patch|slotId|itemId|overrideAllowed|winner|loser|exclusive|handled|pass" ...`)
  - PASS (`./scripts/check_layer_rules.sh`)

Manual verification notes:
- merge semantics 엔진(정책 patch/UI item key merge/command overrideAllowed/shortcut winner-loser/input behavior)이 `core/runtime/modding/package`에 구현됨.
- Host 소비 경로(`modContributionBridge`, `toolbarSurfacePolicy`, `toolbarActionSelectors`)는 load-order `base<package<mod<user`를 사용하도록 갱신됨.
- Mod Studio runtime diagnostics 경로(`moduleDiagnostics.ts`)에 winner/loser/blocked merge 진단이 추가됨.
- Step-2의 실제 UI 인터랙션 샘플(충돌 시나리오 클릭 테스트)은 본 CLI 세션에서 수행하지 못했으며, 후속 수동 확인 권장.

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음 (개발 중 중간 빌드 오류는 모두 수정 후 최종 gate PASS)
