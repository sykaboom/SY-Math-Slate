# Task 480: Mod Manager UX Split (Author vs Consumer)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 모드 제작(authoring)과 모드 운영(consumption: enable/order/conflict apply) UX를 분리한다.
  - load-order 적용, 충돌 진단, override preview를 운영자 관점에서 명확히 제공한다.
- What must NOT change:
  - 기존 mod 생성/편집 기본 기능 제거 금지
  - runtime mod 실행 경로 변경 금지

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/platform/mod-studio/**` (author/consumer 탭 분리 파일)
- `v10/src/features/platform/store/useModStudioStore.ts`
- `v10/src/features/platform/store/useModStore.ts`

Out of scope:
- pack adapter/core selector 로직 변경
- toolbar shell 리렌더 정책 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - studio는 runtime core를 직접 변이하지 않고 command/store 경유
- Compatibility:
  - 기존 Module Studio 진입점 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W480
- Depends on tasks:
  - ['task_477', 'task_478']
- Enables tasks:
  - ['task_481']
- Parallel group:
  - G-mod-manager-ux
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 4~7
- Files shared with other PENDING tasks:
  - mod-studio files only
- Cross-module dependency:
  - NO (feature-local)
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~70min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Constraint: store 파일 단일 소유
- Rationale:
  - UI split과 diagnostics 확장은 feature-local이라 병렬성이 높음.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - mod-studio UX split + diagnostics 강화
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: UI split
  - Implementer-B: diagnostics/store wiring
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `useModStudioStore.ts` 단일 소유
- Parallel slot plan:
  - 2 executors + 1 reviewer
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - shortest-job-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 reviewer
  - Ready-queue refill trigger:
    - UI split 완료 시 diagnostics 검증 슬롯 보강
  - Agent close/reuse policy:
    - 완료 즉시 close/reuse
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 180s
    - Long-running exceptions: lint/build
  - Reassignment safety rule:
    - store 파일 충돌 금지

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - 필요 시 map regenerate
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` mod-studio 역할 분리 내용 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Author 탭과 Manager 탭(또는 동등한 분리 UX)이 구분되어 제공된다.
- [x] AC-2: Manager UX에서 enable/disable/order/conflict/winner-loser 진단이 확인 가능하다.
- [x] AC-3: 기존 모듈 제작 플로우 회귀가 없다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Mod Studio 진입 후 Author/Manager 분리 UI 확인
   - Expected result:
     - 기능과 목적이 분리되어 노출
   - Covers: AC-1

2) Step:
   - Command / click path:
     - 모듈 충돌/순서 변경 시 diagnostics 확인
   - Expected result:
     - winner/loser 또는 차단 사유 표시
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - UX 분리 중 state 동기화 누락 가능.
- Roll-back:
  - 기존 단일 섹션 UI로 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/platform/mod-studio/modules/ModuleStudioAuthorPanel.tsx` (new)
- `v10/src/features/platform/mod-studio/modules/ModuleStudioManagerPanel.tsx` (new)
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/platform/store/useModStudioStore.ts`
- `v10/src/features/platform/store/useModStore.ts`
- `codex_tasks/task_480_mod_manager_author_consumer_ux_split.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint` (initial 1회 JSX parse error 검출 -> 수정 후 재실행 PASS)
- `cd v10 && npm run build` (initial 1회 JSX parse error 검출 -> 수정 후 재실행 PASS)
- `rg -n "MODULE_WORKSPACE_LABELS|ModuleStudioAuthorPanel|ModuleStudioManagerPanel|setModuleWorkspace|moduleWorkspace" v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx v10/src/features/platform/store/useModStudioStore.ts` (PASS; Author/Manager 분리 + workspace 상태 경로 확인)
- `rg -n "setModuleEnabled|setModuleOrder|moveModuleOrder|mergeDiagnostics|winner|loser|blocked|resolvedToolbarContributionOrder|Conflict Diagnostics" v10/src/features/platform/mod-studio/modules/ModuleStudioManagerPanel.tsx v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts v10/src/features/platform/store/useModStudioStore.ts` (PASS; manager enable/order + winner/loser/blocked 진단 노출 경로 확인)
- `./scripts/check_layer_rules.sh` (PASS)

## Gate Results (Codex fills)

- Lint:
  - PASS (`cd v10 && npm run lint`)
- Build:
  - PASS (`cd v10 && npm run build`)
- Script checks:
  - PASS (`rg -n "MODULE_WORKSPACE_LABELS|ModuleStudioAuthorPanel|ModuleStudioManagerPanel|setModuleWorkspace|moduleWorkspace" ...`)
  - PASS (`rg -n "setModuleEnabled|setModuleOrder|moveModuleOrder|mergeDiagnostics|winner|loser|blocked|resolvedToolbarContributionOrder|Conflict Diagnostics" ...`)
  - PASS (`./scripts/check_layer_rules.sh`)

Manual verification notes:
- AC-1: `ModuleStudioSection`에 Author/Manager workspace 토글을 추가하고 전용 패널(`ModuleStudioAuthorPanel`, `ModuleStudioManagerPanel`)로 렌더 경로를 분리함.
- AC-2: Manager 패널에서 `enabled/order/up/down` 제어를 store action으로 적용하며, merge diagnostics(`winner/loser/blocked`)와 blocked reason, resolved contribution order preview를 표시함.
- AC-3: Author 패널은 기존 upsert/remove 중심 작성 플로우를 유지하고 Draft diagnostics를 그대로 노출함.

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음 (중간 JSX parse 오류는 즉시 수정 후 lint/build PASS 확인)
