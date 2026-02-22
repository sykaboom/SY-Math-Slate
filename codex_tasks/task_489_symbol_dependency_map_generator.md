# Task 489: Symbol Dependency Map 자동 생성기 + 04 순서도 맵 작성

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - `v10/src` 전체를 대상으로 폴더/파일/함수/변수/메서드 정의와 import 의존성을 자동 수집하는 생성 스크립트를 추가한다.
  - 생성 결과를 바탕으로 `04_Symbol_Dependency_Map.md`를 생성하여 “순서도 + 전수 인덱스 진입점”을 제공한다.
- What must NOT change:
  - `v10/src/**` 런타임 코드 변경 금지.
  - 신규 npm 의존성 추가 금지.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/gen_symbol_dependency_map.mjs` (new)
- `v10/docs/architecture/04_Symbol_Dependency_Map.md` (new, generated)
- `v10/docs/architecture/generated/symbol_inventory.json` (new, generated)
- `v10/docs/architecture/generated/folder_dependency_edges.json` (new, generated)
- `v10/docs/architecture/generated/file_dependency_edges.json` (new, generated)
- `v10/docs/architecture/ModEngine.md` (update: 04 링크 추가)
- `v10/docs/architecture/ModularizationDependencyFlow.md` (update: 04 링크 추가)

Out of scope:
- `v10/src/**` 코드 수정
- 리팩토링/구조 이동 구현
- CI 정책 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 스크립트는 repo 내 기존 TypeScript 설치(`v10/node_modules/typescript`)만 사용한다.
  - import 해석은 로컬 경로/alias 범위(`@/`, `@core/`, `@features/`, `@ui/`)만 다룬다.
- Compatibility:
  - 생성 결과가 누적되지 않도록 매 실행 시 파일을 덮어쓴다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-MAP-DEEPEN-1
- Depends on tasks:
  - `task_488`
- Enables tasks:
  - `task_490+` 구조 리팩토링 분할(증거 기반)
- Parallel group:
  - G-DOCS-TOOLING
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - none (docs/scripts only)
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 생성기/출력 포맷의 정합을 단일 구현자가 유지해야 drift를 줄일 수 있다.

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
  - 문서/생성 출력 추가
- [x] Semantic/rule changes:
  - 아키텍처 문서 참조 링크 확장

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `scripts/gen_symbol_dependency_map.mjs` 실행 시 JSON 3종 + `04_Symbol_Dependency_Map.md`가 생성된다.
- [ ] AC-2: `symbol_inventory.json`에 파일별 함수/변수/메서드 정의 메타(이름/라인/export 여부)가 포함된다.
- [ ] AC-3: `folder_dependency_edges.json`가 상위 폴더 단위 의존성(from->to,count)을 제공한다.
- [ ] AC-4: `04_Symbol_Dependency_Map.md`가 순서도(mermaid) + 해석 가이드 + 데이터 파일 경로를 명시한다.
- [ ] AC-5: `ModEngine.md`, `ModularizationDependencyFlow.md`가 04 문서를 참조한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `node scripts/gen_symbol_dependency_map.mjs`
   - Expected result:
     - 생성 완료 로그와 함께 4개 출력 파일이 갱신된다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `node -e "const f=require('./v10/docs/architecture/generated/symbol_inventory.json'); console.log(f.totals)"`
   - Expected result:
     - files/functionDecl/classMethod/varDecl/varFn 수치 객체 출력.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `node -e "const e=require('./v10/docs/architecture/generated/folder_dependency_edges.json'); console.log(e.edges.slice(0,10))"`
   - Expected result:
     - 상위 엣지 목록 출력.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `rg -n "Symbol Dependency Map|generated/symbol_inventory.json|generated/folder_dependency_edges.json" v10/docs/architecture/04_Symbol_Dependency_Map.md`
   - Expected result:
     - 맵 문서에 데이터 소스 링크/설명 존재.
   - Covers: AC-4

5) Step:
   - Command / click path:
     - `rg -n "04_Symbol_Dependency_Map" v10/docs/architecture/ModEngine.md v10/docs/architecture/ModularizationDependencyFlow.md`
   - Expected result:
     - 2개 문서에서 04 참조 확인.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - JSON 출력량이 커져 가독성이 낮아질 수 있다.
  - alias 해석 누락 시 의존성 edge 일부가 `external/unknown`으로 분류될 수 있다.
- Roll-back:
  - 생성기/생성 파일/링크 업데이트를 단일 커밋으로 되돌린다.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "그럼 만들어봐."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/gen_symbol_dependency_map.mjs` (new)
- `v10/docs/architecture/04_Symbol_Dependency_Map.md` (new, generated)
- `v10/docs/architecture/generated/symbol_inventory.json` (new, generated)
- `v10/docs/architecture/generated/folder_dependency_edges.json` (new, generated)
- `v10/docs/architecture/generated/file_dependency_edges.json` (new, generated)
- `v10/docs/architecture/ModEngine.md` (updated link)
- `v10/docs/architecture/ModularizationDependencyFlow.md` (updated link)

Commands run (only if user asked or required by spec):
- `node scripts/gen_symbol_dependency_map.mjs`
- `node -e "const f=require('./v10/docs/architecture/generated/symbol_inventory.json'); console.log(f.totals)"`
- `node -e "const e=require('./v10/docs/architecture/generated/folder_dependency_edges.json'); console.log(e.edges.slice(0,10))"`
- `rg -n "Symbol Dependency Map|generated/symbol_inventory.json|generated/folder_dependency_edges.json" v10/docs/architecture/04_Symbol_Dependency_Map.md`
- `rg -n "04_Symbol_Dependency_Map" v10/docs/architecture/ModEngine.md v10/docs/architecture/ModularizationDependencyFlow.md`
- `bash scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A (docs/scripts task)
- Build:
  - N/A (docs/scripts task)
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
- AC-1 PASS: generator execution created/updated JSON 3종 + 04 map markdown.
- AC-2 PASS: `symbol_inventory.json` includes totals and per-file symbol metadata.
- AC-3 PASS: `folder_dependency_edges.json` provides `from/to/count` edge list.
- AC-4 PASS: 04 map contains mermaid flow + generated data paths.
- AC-5 PASS: `ModEngine.md` and `ModularizationDependencyFlow.md` reference 04 map.

Notes:
- This task intentionally made no changes under `v10/src/**`.
