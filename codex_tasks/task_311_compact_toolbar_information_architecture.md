# Task 311: Compact Toolbar Information Architecture (Mobile/Tablet First)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Reduce compact `More` overload with progressive disclosure and predictable grouping.
  - Preserve quick authoring actions in first interaction layer for mobile/tablet.
- What must NOT change:
  - Do not remove core command access paths.
  - Do not introduce blocking modal interactions.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/ThumbZoneDock.tsx`
- `v10/src/features/chrome/toolbar/compactToolbarSections.ts` (new, section map contract)
- `design_drafts/layout_toolbar_compact_ia_v1.svg` (required artifact before implementation)

Out of scope:
- Desktop toolbar redesign
- Dock/drag behavior changes (task_312)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Maintain `ExtensionSlot("toolbar-inline")` visibility.
  - Keep all mutations via command bus/store actions only.
- Compatibility:
  - Compact IA must degrade safely when custom extension modules are absent.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-B
- Depends on tasks:
  - [`task_312`]
- Enables tasks:
  - `task_313`
- Parallel group:
  - G2-compact-ia
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~4
- Files shared with other PENDING tasks:
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~40min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - Compact IA changes are render-dense and share conflict-heavy toolbar file.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Numeric redlines:
- Compact More panel max-height:
  - Mobile portrait (375x812 baseline): `max-h = 52vh`
  - Tablet portrait (768x1024 baseline): `max-h = 46vh`
  - Tablet landscape (1024x768 baseline): `max-h = 44vh`
- Compact controls row:
  - Minimum interactive row height: `48px`
  - Horizontal gutter: `8px`
- Section header + first control must fit in first viewport without scroll.

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - Compact mode overload and discoverability issues from toolbar UX report item #7.
- Sunset criteria:
  - Remove temporary compact grouping flags once contract test in `task_316` stabilizes.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Compact toolbar no longer stacks all sections in one long scroller by default.
- [ ] AC-2: Mobile/tablet에서 첫 상호작용 레이어에 Quick + 핵심 액션이 노출된다.
- [ ] AC-3: Compact panel scroll affordance(상/하 더보기 인지)가 존재한다.
- [ ] AC-4: Extension slot 영역이 compact에서 가려지지 않는다.
- [ ] AC-5: `cd v10 && npm run lint && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: 모바일 폭(390) + 태블릿 폭(820, 1024)에서 compact More 열기
   - Expected result: 과부하 단일 목록이 아닌 섹션 기반 점진 노출
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: panel scroll 상/하 이동
   - Expected result: 더보기 인지 UI(affordance) 확인 가능
   - Covers: AC-3

3) Step:
   - Command / click path: `toolbar-inline` 확장 모듈 활성화
   - Expected result: compact에서도 slot 가림/소실 없음
   - Covers: AC-4

4) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - compact IA 재배치로 기존 사용자의 muscle memory 저하 가능.
- Roll-back:
  - `git revert <commit>` + 이전 compact 섹션 조합 복구.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/ThumbZoneDock.tsx`
- `v10/src/features/chrome/toolbar/compactToolbarSections.ts`
- `design_drafts/layout_toolbar_compact_ia_v1.svg`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

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
- Compact More panel height policy is centralized and responsive by viewport class.
- Compact expanded panel now has explicit scroll affordance text.

Notes:
- ...
