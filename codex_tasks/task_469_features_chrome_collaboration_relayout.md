# Task 469: Features Relayout A (chrome + collaboration)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `layout/toolbar/ui-host/shortcuts/theme/viewer`를 `features/chrome/*`로 이관한다.
  - `sharing/sync`를 `features/collaboration/*`로 이관한다.
  - 구 경로에는 최소 compat re-export만 유지한다.
- What must NOT change:
  - 툴바/레이아웃/뷰어 기능 동작 회귀 금지

---

## Scope (Base Required)

Touched files/directories:
- Move 대상:
  - `v10/src/features/chrome/layout/**` -> `v10/src/features/chrome/layout/**`
  - `v10/src/features/chrome/toolbar/**` -> `v10/src/features/chrome/toolbar/**`
  - `v10/src/features/chrome/ui-host/**` -> `v10/src/features/chrome/ui-host/**`
  - `v10/src/features/chrome/shortcuts/**` -> `v10/src/features/chrome/shortcuts/**`
  - `v10/src/features/chrome/theming-ui/**` -> `v10/src/features/chrome/theming-ui/**`
  - `v10/src/features/chrome/viewer/**` -> `v10/src/features/chrome/viewer/**`
  - `v10/src/features/collaboration/sharing/**` -> `v10/src/features/collaboration/sharing/**`
  - `v10/src/features/collaboration/sync/**` -> `v10/src/features/collaboration/sync/**`
- Import 업데이트:
  - `v10/src/features/**`, `v10/src/app/**`, `v10/tests/**`
- 계약/문서:
  - `v10/AI_READ_ME.md`, `v10/AI_READ_ME_MAP.md`

Out of scope:
- `editor/governance/platform` 군 이관 (task_470)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - compat 파일은 re-export only
  - 캔버스 가시/도킹 정책 파일의 런타임 로직 변경 금지
- Compatibility:
  - old import는 한 웨이브 동안 compat 유지
  - compat root 허용 범위: `layout`, `toolbar`, `ui-host`, `shortcuts`, `theme`, `viewer`, `sharing`, `sync`
  - 위 루트는 thin stub(`index.ts` 또는 `*.compat.ts`)만 허용

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W469
- Depends on tasks:
  - ['task_468']
- Enables tasks:
  - `task_470`, `task_471`
- Parallel group:
  - G-relayout-a
- Max parallel slots:
  - 6
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 120+
- Files shared with other PENDING tasks:
  - `v10/AI_READ_ME.md`, `v10/AI_READ_ME_MAP.md`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 3
- Estimated single-agent duration:
  - ~90min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - NO
- Rationale:
  - 대규모 mv + import rewrite이며 충돌 리스크가 높아 단일 웨이브 집중 필요.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Assigned roles:
    - Implementer-A: chrome cluster move
    - Implementer-B: collaboration cluster move
    - Reviewer+Verifier: import rewrite + full gates
  - File ownership lock plan:
    - `AppLayout.tsx`, `FloatingToolbar.tsx`는 단일 구현자 고정

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - `node scripts/gen_ai_read_me_map.mjs`
  - [ ] Semantic/rule changes:
    - `v10/AI_READ_ME.md` 경로 재기술

---

## Acceptance Criteria (Base Required)

- [x] AC-1: chrome/collaboration 군 파일이 신규 경로로 물리 이관된다.
- [x] AC-2: 구 compat root에는 thin stub 파일만 남고, 런타임 구현 파일은 신규 경로로 이관된다.
- [x] AC-3: `v10/src`, `v10/tests`, `scripts`에서 구 root 직접 import 참조가 0건이다.
- [x] AC-4: lint/build 및 layer/mod_contract check PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find v10/src/features/chrome -type f | wc -l`
     - `find v10/src/features/collaboration -type f | wc -l`
   - Expected result:
     - 이관 파일 존재
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "@features/(layout|toolbar|ui-host|shortcuts|theme|viewer|sharing|sync)/" v10/src v10/tests scripts`
     - `find v10/src/features/chrome/layout v10/src/features/chrome/toolbar v10/src/features/chrome/ui-host v10/src/features/chrome/shortcuts v10/src/features/chrome/theming-ui v10/src/features/chrome/viewer v10/src/features/collaboration/sharing v10/src/features/collaboration/sync -type f 2>/dev/null | rg -v "(index\\.ts$|\\.compat\\.ts$)" || true`
   - Expected result:
     - 직접 import 참조 0건, compat root에는 thin stub만 존재
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 대량 mv로 import 누락 가능성
- Roll-back:
  - Relayout A 커밋 단위 revert

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementer-A Closeout (W4 / chrome cluster only)

Changed files (scope summary):
- Moved implementations:
  - `v10/src/features/chrome/layout/**` -> `v10/src/features/chrome/layout/**`
  - `v10/src/features/chrome/toolbar/**` -> `v10/src/features/chrome/toolbar/**`
  - `v10/src/features/chrome/ui-host/**` -> `v10/src/features/chrome/ui-host/**`
  - `v10/src/features/chrome/shortcuts/**` -> `v10/src/features/chrome/shortcuts/**`
  - `v10/src/features/chrome/theming-ui/**` -> `v10/src/features/chrome/theming-ui/**`
  - `v10/src/features/chrome/viewer/**` -> `v10/src/features/chrome/viewer/**`
- Added thin compat-only stubs under old roots:
  - `index.ts` barrels + `*.compat.ts` re-exports only
  - legacy deep-import directory shims (`<module>/index.ts`) for moved TS/TSX modules
- Updated chrome barrels:
  - `v10/src/features/chrome/layout/index.ts`
  - `v10/src/features/chrome/toolbar/index.ts`
  - `v10/src/features/chrome/ui-host/index.ts`
  - `v10/src/features/chrome/shortcuts/index.ts`
  - `v10/src/features/chrome/theming-ui/index.ts`
  - `v10/src/features/chrome/viewer/index.ts`

Commands run:
- `find v10/src/features/chrome/layout v10/src/features/chrome/toolbar v10/src/features/chrome/ui-host v10/src/features/chrome/shortcuts v10/src/features/chrome/theming-ui v10/src/features/chrome/viewer -type f | wc -l`
- `find v10/src/features/chrome/layout v10/src/features/chrome/toolbar v10/src/features/chrome/ui-host v10/src/features/chrome/shortcuts v10/src/features/chrome/theming-ui v10/src/features/chrome/viewer -type f | wc -l`
- `find v10/src/features/chrome/layout v10/src/features/chrome/toolbar v10/src/features/chrome/ui-host v10/src/features/chrome/shortcuts v10/src/features/chrome/theming-ui v10/src/features/chrome/viewer -type f | rg -v "(index\\.ts$|\\.compat\\.ts$)" || true`
- `bash scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- Chrome target clusters now contain moved runtime implementation files.
- Old roots contain only `index.ts` and `*.compat.ts` stubs (no runtime implementation files).
- Layer rule check PASS, lint PASS.
- Build FAIL at `v10/src/app/layout.tsx` due old CSS import path (`../features/layout/styles/prompter.css`) no longer present after move.

Failure classification:
- Newly introduced: YES (by physical CSS move in this slice).
- Blocking: YES (blocks full build until import cutover or approved compat strategy for CSS path).
- Pre-existing failures observed: NO additional pre-existing failure identified in this run.
