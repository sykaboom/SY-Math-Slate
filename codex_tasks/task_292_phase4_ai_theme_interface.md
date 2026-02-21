# Task 292: Phase 4 — AI 테마 인터페이스

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_291 COMPLETED: ThemeExportButton/ImportButton, JSON I/O 유틸 존재
- task_289 COMPLETED: LLMCallService, AIProviderRegistry, PromptProfile 존재
- task_290 COMPLETED: useTokenDraftStore, custom preset localStorage 구조 존재
- THEME_GLOBAL_TOKEN_KEYS: 18개 토큰 (surface, text, border, accent 등)
- ThemeGlobalTokenMap: Record<ThemeGlobalTokenKey, string> (rgba 값 포맷)

[ GOAL ]
Phase 4: 자연어 설명 → AI가 18개 토큰 값 자동 생성 → 즉시 미리보기 → 저장
예시:
  입력: "따뜻한 가을 황혼, 갈색과 황금색"
  출력: surface = rgba(40, 25, 15, 0.94), accent = rgba(210, 140, 40, 1), ...

[ LLM 사용 ]
- LLMCallService (task_289) 재사용: /api/ai/call route 경유
- AIProviderRegistry (task_289) 재사용: provider 선택 동일
- 브라우저에서 직접 LLM API 호출 금지 (server-side only, 기존 정책 유지)

[ 출력 포맷 요구 ]
LLM에게 structured output (JSON) 강제:
  { "surface": "rgba(...)", "text": "rgba(...)", ... }
→ validateThemeJson (task_291) 재사용으로 유효성 검사
```

---

## Goal (Base Required)

- What to change:
  - `AIThemePromptBar.tsx` — 자연어 입력 UI (textarea + 생성 버튼)
  - `useAIThemeGeneration.ts` — LLMCallService 호출 → JSON 응답 파싱 → draft 적용
  - `AIThemeGenerationPanel.tsx` — 입력 + 미리보기 + 저장 통합 패널
  - `/api/ai/theme` Next.js API route — AI 테마 생성 전용 엔드포인트
    (LLMCallService와 분리: 테마 전용 시스템 프롬프트 + structured output 처리)
  - `ThemeStudioSection.tsx` 수정 — [Basic | Advanced | AI 생성] 탭 추가
- What must NOT change:
  - `THEME_GLOBAL_TOKEN_KEYS` 구조 변경 없음
  - 기존 3개 프리셋 (chalk/parchment/notebook) 변경 없음
  - `LLMCallService` 내부 구조 변경 없음 (새 route에서 재사용)
  - `useTokenDraftStore` 외부 API 변경 없음

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/platform/mod-studio/theme/AIThemePromptBar.tsx`
- `v10/src/features/platform/mod-studio/theme/AIThemeGenerationPanel.tsx`
- `v10/src/features/platform/mod-studio/theme/useAIThemeGeneration.ts`
- `v10/src/app/api/ai/theme/route.ts` — AI 테마 생성 API route

Touched files/directories (write):
- `v10/src/features/platform/mod-studio/theme/ThemeStudioSection.tsx` — AI 생성 탭 추가

Out of scope:
- 이미지/무드보드 → 테마 생성 (텍스트 입력만)
- AI 생성 프리셋 서버 마켓플레이스
- 실시간 스트리밍 생성 (단일 응답 MVP)
- 다중 제안 (한 번에 1개 생성)

---

## AI 시스템 프롬프트 설계 (`/api/ai/theme`)

```
system: |
  You are a theme color designer for a math education whiteboard app.
  Given a mood/style description, output EXACTLY 18 CSS color tokens as JSON.
  All values must be valid CSS rgba() strings.
  Token keys: surface, surface-soft, surface-overlay, text, text-muted,
  text-subtle, border, border-strong, accent, accent-soft, accent-strong,
  accent-text, success, success-soft, warning, warning-soft, danger, danger-soft.
  Ensure sufficient contrast (WCAG AA) between text and surface.
  Output ONLY valid JSON, no markdown, no explanation.

user: {description}

expected output:
{
  "surface": "rgba(245, 230, 200, 0.95)",
  "text": "rgba(60, 42, 20, 0.94)",
  ...
}
```

---

## 생성 흐름

```
사용자 입력 → POST /api/ai/theme { description, providerId } →
  LLM 호출 (structured output) →
  JSON 응답 → validateThemeJson() →
  [유효] → useTokenDraftStore.setDraft(tokens) →
          applyThemeDraftPreview() → 실시간 미리보기 →
          사용자: "저장" → saveTokenDraftAsPreset()
  [무효] → 에러 toast + 재시도 버튼
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
  - OpenAI structured output(JSON mode) — SDK는 task_289에서 추가됨
  - `/api/ai/theme` route는 `LLMCallService` 동일 SDK 사용, 별도 의존성 없음
- Boundary rules:
  - `AIThemeGenerationPanel.tsx` → `features/mod-studio/theme/` 레이어
  - `useAIThemeGeneration.ts` → features 레이어. `/api/ai/theme` POST 호출.
  - `/api/ai/theme` → app 레이어 (Next.js server). LLM API key 서버 환경변수만.
  - 브라우저에서 LLM API 직접 호출 금지 (기존 정책, task_289 동일).
- Compatibility:
  - `validateThemeJson()` (task_291) 재사용: AI 생성 JSON도 동일 스키마 검증.
  - `useTokenDraftStore.setDraft()` (task_290): AI 생성 결과를 draft로 주입.
  - `saveTokenDraftAsPreset()` (task_290): AI 생성 → 저장 동일 경로.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W7-phase4
- Depends on tasks: [task_289, task_290, task_291]
- Enables tasks: [로드맵 완성 선언]
- Parallel group: G7-phase4 (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 5 (4 create + 1 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (features → app API route)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~35min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (task_291 선행 필수)
- Rationale: LLMCallService + validateThemeJson + useTokenDraftStore 재사용 구조. 신규 코드 최소.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO (기존 ThemeStudioSection 탭 추가만)

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_292 only
- Assigned roles:
  - Implementer-A: 5개 파일 순차 작성
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 5개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_291 완료 시
  - Agent close/reuse policy: 완료 즉시 close
  - Heartbeat / Reassignment: task_281과 동일
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
- [x] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs` 실행 (신규 API route 디렉토리)
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: Phase 4 AI 테마 인터페이스 기록
  - `/api/ai/theme` route 레이어 규칙 (server-side only, LLM key 노출 금지) 명시
  - 전체 Phase 1~Phase 4 로드맵 완성 선언

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: ThemeStudioSection에 "AI 생성" 탭 표시
- [ ] AC-2: 자연어 입력 → "생성" 버튼 → `/api/ai/theme` POST → 로딩 표시
- [ ] AC-3: LLM 응답 수신 → validateThemeJson 통과 → 실시간 미리보기 적용
- [ ] AC-4: "저장" 클릭 → custom preset 저장 → ThemePickerPanel에 표시
- [ ] AC-5: LLM 응답이 유효하지 않은 JSON → 에러 toast + 재시도 버튼
- [ ] AC-6: `AI_MOCK_MODE=true` 시 mock 테마 JSON 반환 (API key 없이 동작)
- [ ] AC-7: LLM API key 브라우저 노출 없음 (DevTools Network 탭 확인)
- [ ] AC-8: `npm run lint` 통과
- [ ] AC-9: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: AI 테마 생성 전체 흐름
   - Mod Studio → Theme → "AI 생성" 탭 → "따뜻한 가을 황혼" 입력 → 생성
   - 실시간 미리보기 변경 확인 → "저장" → ThemePickerPanel에 카드 표시
   - Covers: AC-1, AC-2, AC-3, AC-4

2) Step: 잘못된 LLM 응답 처리
   - Mock 응답으로 broken JSON 주입 → 에러 toast + 재시도 버튼 확인
   - Covers: AC-5

3) Step: Mock 모드
   - `AI_MOCK_MODE=true` → 생성 실행 → mock 테마 수신 확인
   - Covers: AC-6

4) Step: API key 노출 없음
   - DevTools Network → `/api/ai/theme` 요청/응답 헤더 검사 → key 노출 없음 확인
   - Covers: AC-7

5) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-8, AC-9

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - LLM structured output: OpenAI JSON mode 응답 형식 이탈 가능
    → `/api/ai/theme` route에서 strict JSON parse + validateThemeJson 재검증
  - 18개 토큰 전부 생성 강제: LLM이 일부 누락할 수 있음
    → validateThemeJson에서 누락 키 감지 → 에러 처리 (기본값 fallback 옵션)
  - 색상 대비 부족: LLM이 WCAG AA를 항상 보장하지 않음
    → 대비 경고 표시 (자동 수정 없음, 사용자 책임)
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_291 COMPLETED.
> Phase 4 완성 = 전체 테마 로드맵 (Phase 1A~4) 완료.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/mod-studio/theme/AIThemePromptBar.tsx`
- `v10/src/features/platform/mod-studio/theme/AIThemeGenerationPanel.tsx`
- `v10/src/features/platform/mod-studio/theme/useAIThemeGeneration.ts`
- `v10/src/app/api/ai/theme/route.ts`
- `v10/src/features/platform/mod-studio/theme/ThemeStudioSection.tsx`

Commands run:
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- `ThemeStudioSection`에 `AI 생성` 탭이 추가되고, 생성/미리보기/프리셋 저장 흐름이 기존 Basic/Advanced를 깨지 않고 동작하도록 연결.
- `/api/ai/theme`는 구조화 JSON 파싱 + 18개 rgba 토큰 검증(엄격)을 수행하며 `AI_MOCK_MODE`를 지원.
