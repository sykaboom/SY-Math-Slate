# Task 474: Toolbar Plan/Resolver Patch v2 (Guardrails Hardening)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 하이브리드 상태(Host 중심)에서 `Resolver 결정 / Host 렌더` 구조로 안전 이행하기 위한 7단계 계획을 보정한다.
  - 기존 7단계 계획에 아래 5개 리스크 보정 규칙을 강제한다:
    1) BaseProvider 의존성 방향 고정
    2) 리소스 타입별 merge semantics 분리
    3) Pack 중심 전환의 AC 강화
    4) Mod Studio UX 역할 분리(Author vs Consumer)
    5) 기계적 검증(compile/rg/diagnostics/alias telemetry) 의무화
- What must NOT change:
  - 이 문서는 설계 보정만 수행하며, 런타임 코드/동작은 변경하지 않는다.
  - 기존 완료된 topology-v2 구조를 되돌리지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_474_toolbar_plan_resolver_patch_v2.md` (new)

Out of scope:
- `v10/src/**` 구현 변경
- 기존 task 파일 대량 수정/삭제

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/*`는 `features/*`를 import 금지.
  - BaseProvider는 `injection registration` 또는 `core-side data extraction`만 허용.
- Compatibility:
  - 현재 `base-education` 팩 + 내장 mod 흐름과 호환되는 점진 이행만 허용.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W474
- Depends on tasks:
  - ['task_471', 'task_473']
- Enables tasks:
  - ['task_475', 'task_476', 'task_477', 'task_478', 'task_479', 'task_480', 'task_481']
- Parallel group:
  - G-plan-hardening
- Max parallel slots:
  - 6
- Verification stage for this task:
  - mid

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 1
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 보정안 결정 문서 1건 작성 작업이며 충돌/병렬 이점이 없음.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - N/A (spec-only)
- [x] Semantic/rule changes:
  - 본 문서 자체가 규칙 보정 산출물

---

## Patch Addendum (Mandatory Guardrails)

### A. Dependency Direction Guardrail (Non-negotiable)
- Core 런타임이 feature 레이어를 직접 참조하지 않도록 고정한다.
- 허용 방식:
  - Injection: `features/*`가 bootstrap 시 BaseProvider를 registry에 등록.
  - 또는 Core Extract: BaseProvider 데이터 정의를 core-side로 승격.
- 금지:
  - `@core/runtime/**`에서 `@features/**` import.

### B. Resource-Specific Merge Semantics (Must split by type)
- `policy`:
  - JSON Merge/Patch 기반. 필드 단위 merge.
- `toolbar/panel UI item`:
  - `(slotId, itemId)` 기준 add/override/remove.
- `commands`:
  - 기본 충돌 금지. 명시 `overrideAllowed`일 때만 override.
- `shortcuts`:
  - 충돌 진단(`winner/loser`) 필수.
- `input behavior`:
  - `exclusive` 또는 `handled/pass chain` 정책 필수.

### C. Pack-Driven Product Definition (Host neutrality)
- 목표는 “호스트 코드 수정 없이” pack 정책으로 탭/액션/표면이 재구성되는 상태.
- Host는 `ResolvedToolbarPlan`만 렌더.
- `toolbarModePolicy.ts`, `toolbarActionCatalog.ts`, `toolbarSurfacePolicy.ts`는 최종적으로 provider input 또는 compat layer로 축소.

### D. Studio Role Split
- `Authoring`(제작)과 `Consumption`(설치/로드오더/충돌 해결)을 UI/권한/흐름에서 분리.
- 최소 기준:
  - Author 탭: pack/mod 제작 편집
  - Manager 탭: enable/disable/order/conflict apply

### E. Mechanical AC (No subjective completion)
- 컴파일 가드, rg 가드, 진단 가드, alias telemetry 가드 모두 통과해야 완료.

---

## 7-Step Refined Plan (from hybrid to skyrim-style)

### Step 1 — Plan SSOT Introduce (Behavior-preserving)
- Add `ResolvedToolbarPlan` contract.
- AC:
  - [ ] 기존 UI 스냅샷 동등성 유지
  - [ ] Host render path가 plan 객체를 입력으로 사용

### Step 2 — BaseProvider Promotion
- Move host hardcoded definitions into provider inputs.
- AC:
  - [ ] `core -> features import` 0건
  - [ ] provider 미등록 시 안전 fallback 동작

### Step 3 — Load Order + Merge Engine
- Enforce precedence: `base < package < mod contribution < user override`.
- AC:
  - [ ] 동일 itemId override / 신규 itemId add 재현
  - [ ] resource-type merge 규칙 테스트 통과

### Step 4 — Pack-First Toolbar Definition
- Tabs/actions/surface from pack policy (not host constant branches).
- AC:
  - [ ] host 상수 의존 분기 제거(또는 compat-only)
  - [ ] 신규 pack 추가 시 host 수정 없이 UI 변화

### Step 5 — Legacy Alias Isolation
- Keep `playback -> lecture` only in legacy adapter/fallback.
- AC:
  - [ ] alias hit 시 telemetry warning 출력
  - [ ] package policy 존재 시 alias 미사용

### Step 6 — Mod Manager UX Split
- Authoring/Consumption split with explicit diagnostics.
- AC:
  - [ ] load-order apply + conflict resolution UI 존재
  - [ ] winner/loser shortcut diagnostics 노출

### Step 7 — Guardrail Finalization
- Remove deprecated direct paths and enforce lint boundaries.
- AC:
  - [ ] forbidden import rules CI fail 연결
  - [ ] deep import violations 0건

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 5개 보정 포인트(A~E)가 문서에 명시적으로 고정됨.
- [ ] AC-2: 7단계 각 단계별 기계적 완료 기준(검증 가능한 조건)이 포함됨.
- [ ] AC-3: downstream task 분할 가능하도록 step별 산출 경계가 정의됨.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "Dependency Direction Guardrail|Resource-Specific Merge Semantics|Pack-Driven Product Definition|Studio Role Split|Mechanical AC" codex_tasks/task_474_toolbar_plan_resolver_patch_v2.md`
   - Expected result:
     - 5개 보정 섹션 검색됨
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "Step 1|Step 2|Step 3|Step 4|Step 5|Step 6|Step 7" codex_tasks/task_474_toolbar_plan_resolver_patch_v2.md`
   - Expected result:
     - 7단계 모두 검색됨
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `rg -n "Enables tasks|task_475|task_481" codex_tasks/task_474_toolbar_plan_resolver_patch_v2.md`
   - Expected result:
     - downstream 분해 지점 명시 확인
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 규칙만 있고 구현 task에 강제되지 않으면 문서-코드 괴리가 발생할 수 있음.
- Roll-back:
  - 문서 단일 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_474_toolbar_plan_resolver_patch_v2.md` (new)

Commands run (only if user asked or required by spec):
- file creation only

## Gate Results (Codex fills)

- Lint:
  - N/A (spec-only)
- Build:
  - N/A (spec-only)
- Script checks:
  - N/A (spec-only)

Manual verification notes:
- 보정 포인트 5개 + 7단계 refined plan + 기계적 AC 포함 확인.
