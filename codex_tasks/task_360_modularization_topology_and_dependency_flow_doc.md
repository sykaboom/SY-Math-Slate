# Task 360: Modularization Topology + Dependency Flow Decision Doc

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - 현재 v10의 폴더/함수 의존성을 그래프 관점으로 요약한 단일 문서 1개를 작성한다.
  - 순서도(mermaid) 기반으로 “전체 재설계 필요 여부”와 “추가 리팩토링 필요 지점”을 명확히 판단 가능하게 만든다.
  - 모딩 목표(정책 기반/패키지 기반 확장)와 충돌하는 병목을 계층적으로 표시한다.
- What must NOT change:
  - 런타임 코드 동작/기능 변경 없음.
  - 명령/정책/보안 경계 로직 수정 없음.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_360_modularization_topology_and_dependency_flow_doc.md`
- `v10/docs/architecture/ModularizationDependencyFlow.md` (new)

Out of scope:
- 코드 리팩토링/기능 변경.
- task_353~359 구현.
- 디자인 토큰/뷰/UI 동작 변경.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - 문서는 현재 구조를 반영하며, 레이어 규칙(`core/ui/features/app`) 위반 지시를 포함하지 않는다.
  - “modding 목표 = policy/package 중심” 원칙을 문서에 명시한다.
- Compatibility:
  - 기존 문서(`ModEngine.md`)와 충돌하지 않도록, 본 문서는 “운영판단용 topology/flow 보조문서”로 둔다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W360-doc
- Depends on tasks:
  - [`task_350`]
- Enables tasks:
  - [`task_353`, `task_354`, `task_355`, `task_356`, `task_357`, `task_358`, `task_359`]
- Parallel group:
  - G-doc-architecture
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 2
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO (documentation only)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~20min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - 문서 작업이라 파일 충돌 위험 낮음.
- Rationale:
  - 구조 진단/결정 문서는 단일 저자가 일관되게 작성하는 편이 정확도와 해석 일관성이 높다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
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
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 신규 문서가 폴더 구조/함수 의존성/정책 경계를 Mermaid 순서도로 시각화한다.
- [x] AC-2: 문서가 “전체 재설계 필요” vs “점진 리팩토링 필요”를 근거 수치와 함께 명시한다.
- [x] AC-3: 문서가 다음 리팩토링 우선순위(병목 1~5)를 실행 순서로 제시한다.
- [x] AC-4: `node scripts/gen_ai_read_me_map.mjs --check`가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `sed -n '1,260p' v10/docs/architecture/ModularizationDependencyFlow.md`
   - Expected result:
     - Mermaid flowchart + 의존성 경계 + 리팩토링 의사결정 표가 존재.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 문서가 실제 코드 상태와 다르면 잘못된 리팩토링 의사결정을 유도할 수 있음.
- Roll-back:
  - 해당 문서 파일 삭제 또는 task_360 커밋 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_360_modularization_topology_and_dependency_flow_doc.md`
- `v10/docs/architecture/ModularizationDependencyFlow.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_migration_baseline.sh`
- `node scripts/gen_ai_read_me_map.mjs --check`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none observed in executed checks
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- `ModularizationDependencyFlow.md`에 순서도(mermaid)와 구조 판정/우선순위를 반영했다.

Notes:
- This task is documentation-only and does not alter runtime behavior.
