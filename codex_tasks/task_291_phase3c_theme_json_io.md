# Task 291: Phase 3-C — 테마 JSON 가져오기/내보내기

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_290 COMPLETED: useTokenDraftStore, custom preset localStorage 구조 완성
- ThemePresetDefinition 타입: id, label, description, globalTokens, moduleScopedTokens

[ GOAL ]
Phase 3-C: 현재 테마 설정을 JSON으로 내보내고, JSON을 가져와서 즉시 적용.
사용 시나리오:
  - 모더가 테마를 설계 → JSON export → 다른 모더와 공유
  - 외부 제작 테마 JSON import → 즉시 적용
  - Mod Studio의 IoStudioSection (I/O 레이어) 또는 ThemeStudioSection 내 버튼으로 접근
```

---

## Goal (Base Required)

- What to change:
  - `themeJsonIO.ts` — export/import 직렬화 유틸리티
  - `ThemeExportButton.tsx` — 현재 테마 JSON 파일 다운로드
  - `ThemeImportButton.tsx` — JSON 파일 업로드 → 유효성 검사 → 즉시 적용
  - `validateThemeJson()` — import 유효성 검사 (THEME_GLOBAL_TOKEN_KEYS 기준)
  - ThemeStudioSection.tsx 또는 IoStudioSection.tsx에 통합
- What must NOT change:
  - `ThemePresetDefinition` 타입 구조 변경 없음
  - 기본 3개 프리셋 불변
  - 가져온 테마는 custom preset으로 저장 (기존 프리셋 덮어쓰기 금지)

---

## JSON 포맷

```json
{
  "syMathSlateTheme": "1",
  "label": "My Custom Theme",
  "description": "Warm autumn palette",
  "globalTokens": {
    "surface": "rgba(245, 230, 200, 0.95)",
    "text": "rgba(60, 40, 20, 0.94)",
    "...": "..."
  },
  "moduleScopedTokens": {
    "core-toolbar": {
      "surface": "rgba(230, 215, 180, 0.9)",
      "...": "..."
    }
  }
}
```

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/mod-studio/theme/themeJsonIO.ts` — export/import/validate 유틸
- `v10/src/features/mod-studio/theme/ThemeExportButton.tsx`
- `v10/src/features/mod-studio/theme/ThemeImportButton.tsx`

Touched files/directories (write):
- `v10/src/features/mod-studio/theme/ThemeStudioSection.tsx` — 버튼 통합 (또는 IoStudioSection)

Out of scope:
- 서버 업로드 (파일 다운로드/업로드만)
- 테마 마켓플레이스
- 암호화/서명

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (브라우저 File API 사용)
- Boundary rules:
  - `themeJsonIO.ts` → `features/mod-studio/theme/` 레이어
  - import 유효성: `THEME_GLOBAL_TOKEN_KEYS` 기준. 알 수 없는 키는 무시.
- Compatibility:
  - `syMathSlateTheme: "1"` 스키마 버전 — 향후 마이그레이션 지원

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W6-phase3
- Depends on tasks: [task_290]
- Enables tasks: [task_292 Phase 4]
- Parallel group: G6-theming (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 4 (3 create + 1 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~25min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (task_290 완료 직후)
- Rationale: 소규모 File API + JSON 직렬화 구현.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_291 only
- File ownership lock plan: 4개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_290 완료 시
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: Phase 3-C JSON I/O 포맷 기록 (syMathSlateTheme schemaVersion "1")

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: "테마 내보내기" 버튼 → JSON 파일 다운로드 (현재 custom preset 또는 활성 프리셋)
- [ ] AC-2: "테마 가져오기" 버튼 → 파일 선택 → 유효성 검사 통과 → custom preset 저장 + 즉시 적용
- [ ] AC-3: 잘못된 JSON (syMathSlateTheme 없음) → 에러 메시지 표시 + 적용 안 됨
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: Export
   - ThemeStudioSection → 내보내기 버튼 → JSON 파일 다운로드 확인
   - Covers: AC-1

2) Step: Import
   - 다운로드한 JSON 파일 → 가져오기 버튼 → 테마 즉시 적용 확인
   - Covers: AC-2

3) Step: 잘못된 파일 거부
   - 임의 JSON 파일 import → 에러 toast 확인
   - Covers: AC-3

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 브라우저 File API 접근: `<input type="file">` 또는 drag-and-drop 방식
  - 파일 크기 제한: 1MB 이상 JSON은 경고 표시
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_290 COMPLETED.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (TBD)

## Gate Results (Codex fills)

- Lint: (TBD)
- Build: (TBD)

Manual verification notes:
- (TBD)
