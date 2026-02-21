# Task 468: Features Taxonomy Scaffold v2 (chrome/editor/collaboration/governance/platform)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - 목표 기능 분류 체계를 위한 `features/{chrome,editor,collaboration,governance,platform}` 스캐폴드를 생성한다.
  - 기존 경로를 깨지 않기 위해 새 그룹 엔트리에서 re-export 브리지 제공.
- What must NOT change:
  - 물리 이동(파일 mv) 수행 금지
  - 런타임 UI/동작 변경 금지

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/**` (신규 index/bridge)
- `v10/src/features/editor/**` (신규 index/bridge)
- `v10/src/features/collaboration/**` (신규 index/bridge)
- `v10/src/features/governance/**` (신규 index/bridge)
- `v10/src/features/platform/**` (신규 index/bridge)
- `v10/tsconfig.json` (`@features/chrome/*` 등 alias)
- `v10/AI_READ_ME.md`

Out of scope:
- 기존 `features/layout`, `features/toolbar` 등 디렉터리 이동
- 대량 import cutover

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 신규 taxonomy 폴더는 브리지/엔트리 역할만 수행
- Compatibility:
  - 기존 import가 그대로 동작해야 함

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W468
- Depends on tasks:
  - ['task_467']
- Enables tasks:
  - `task_469`, `task_470`
- Parallel group:
  - G-features-taxonomy
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
  - ~30min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
- Rationale:
  - taxonomy scaffold 생성은 독립 분할 가능.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Assigned roles:
    - Implementer-A: taxonomy directories + bridge index
    - Implementer-B: tsconfig alias + docs sync
    - Reviewer+Verifier: import smoke check

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - `node scripts/gen_ai_read_me_map.mjs`
  - [ ] Semantic/rule changes:
    - `v10/AI_READ_ME.md` taxonomy 섹션 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `features` 하위에 5개 신규 taxonomy 폴더가 생성된다.
- [x] AC-2: 각 taxonomy 폴더에 공개 엔트리(`index.ts`)가 존재하고 re-export 계약을 제공한다.
- [x] AC-3: 신규 alias 경로(`@features/chrome/*` 등) import가 빌드 가능.
- [x] AC-4: 기존 import 경로도 동일하게 동작.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find v10/src/features -maxdepth 2 -type d | rg "features/(chrome|editor|collaboration|governance|platform)$"`
   - Expected result:
     - 5개 taxonomy 확인
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `test -f v10/src/features/chrome/index.ts`
     - `test -f v10/src/features/editor/index.ts`
     - `test -f v10/src/features/collaboration/index.ts`
     - `test -f v10/src/features/governance/index.ts`
     - `test -f v10/src/features/platform/index.ts`
   - Expected result:
     - taxonomy 공개 엔트리 존재
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - 신규 alias + 기존 경로 모두 통과
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 브리지 엔트리 설계 불량 시 향후 이동단계 충돌
- Roll-back:
  - taxonomy scaffold 커밋 revert

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Closeout (2026-02-21)

- Result:
  - taxonomy roots `features/{chrome,editor,collaboration,governance,platform}` scaffolded and wired.
  - path aliases for taxonomy lanes enabled in `v10/tsconfig.json`.
- Commands run:
  - `bash scripts/check_layer_rules.sh`
  - `cd v10 && npm run build`
- Verification:
  - PASS
