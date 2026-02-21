# Task 466: Runtime Modding Namespace Convergence (Scaffold)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `core/mod/*` 실행 엔진을 목표 네임스페이스인 `core/runtime/modding/*`로 승격하는 스캐폴드 레이어를 만든다.
  - `api/host/package/builtin` 공개 경로를 고정한다.
- What must NOT change:
  - 런타임 동작/기능 회귀 금지.
  - 기존 `@core/mod/*` 경로는 이번 태스크에서 즉시 제거하지 않는다(compat 유지).

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/api/**` (신규)
- `v10/src/core/runtime/modding/host/**` (신규)
- `v10/src/core/runtime/modding/package/**` (신규)
- `v10/src/core/runtime/modding/builtin/**` (신규)
- `v10/src/core/runtime/modding/index.ts` (신규)
- `v10/src/core/mod/**` (compat re-export shim 최소화)
- `v10/tsconfig.json` (path alias 추가)
- `v10/AI_READ_ME.md` (구조 맵 반영)

Out of scope:
- `features/**` import cutover
- `core/mod/**` 물리 삭제
- 기능 추가/UX 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `runtime/modding/*`는 `features/*` 직접 import 금지
  - compat shim은 re-export만 허용 (신규 로직 금지)
- Compatibility:
  - 기존 코드가 `@core/mod/*`를 써도 빌드 가능한 상태 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W466
- Depends on tasks:
  - []
- Enables tasks:
  - `task_467`
- Parallel group:
  - G-core-modding
- Max parallel slots:
  - 6
- Verification stage for this task:
  - mid

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - ~20
- Files shared with other PENDING tasks:
  - `v10/tsconfig.json`, `v10/AI_READ_ME.md`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - 코어 트리 생성과 compat shim 정리를 분리 병렬화 가능.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - core/runtime/modding scaffold + compat shim
  - Assigned roles:
    - Implementer-A: runtime/modding tree scaffold
    - Implementer-B: compat shim + alias
    - Reviewer+Verifier: gate checks

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - `node scripts/gen_ai_read_me_map.mjs`
  - [ ] Semantic/rule changes:
    - `v10/AI_READ_ME.md` 검토

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `core/runtime/modding/{api,host,package,builtin}` 공개 엔트리가 생성된다.
- [x] AC-2: `@core/mod/*` 경로는 compat shim으로 기존 빌드가 유지된다.
- [x] AC-3: `npm run lint` 및 `npm run build` 통과.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find v10/src/core/runtime/modding -maxdepth 2 -type d | sort`
   - Expected result:
     - `api/host/package/builtin` 확인
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "@core/mod" v10/src | head`
   - Expected result:
     - import가 남아도 빌드 가능(compat)
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
  - alias/shim 충돌 시 순환 참조 가능성
- Roll-back:
  - runtime/modding scaffold 커밋 단위 revert

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Closeout (2026-02-21)

- Result:
  - `core/runtime/modding/{api,host,package,builtin}` scaffold created and wired.
  - runtime root export (`core/runtime/modding/index.ts`) activated.
  - compatibility lane was kept during wave start (later retired in task_471).
- Commands run:
  - `bash scripts/check_layer_rules.sh`
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`
- Verification:
  - PASS
