# Task 302: 인앱 AI 모듈 생성 (Mod Studio LLM 모딩 루프 내재화)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- IoStudioSection.tsx: Export/Import textarea만 존재. LLM 연결 없음.
  현재 LLM 모딩 루프: Export JSON → 외부 LLM → Import JSON (10단계, 외부 도구 의존)

- task_292(AI 테마 생성) 완료 — 재사용 가능한 패턴:
  - /api/ai/theme/route.ts: LLM 호출 + JSON 응답 파싱 패턴
  - useAIThemeGeneration.ts: POST 호출 → 드래프트 적용 훅 패턴
  - AIThemePromptBar.tsx + AIThemeGenerationPanel.tsx: UI 패턴

- KNOWN_UI_SLOT_NAMES: ["chrome-top-toolbar","left-panel","toolbar-inline","toolbar-bottom"] (확인됨)
- ModuleDraft 타입: { id, label, slot, enabled, order, action: { commandId, payload } }
- importStudioDraftBundle(json) 존재 (IoStudioSection에서 사용 중) — AI 결과 주입에 재사용 가능

- LLMCallService: /api/ai/call 경유. 브라우저 직접 LLM 호출 금지 정책 유지.
- AI_MOCK_MODE=true: 서버사이드 mock 지원 (task_289 패턴)
```

---

## Goal (Base Required)

- What to change:
  - `AIModulePromptBar.tsx` (신규) — 자연어 설명 입력 UI + "생성" 버튼
  - `useAIModuleGeneration.ts` (신규) — POST /api/ai/module → JSON 파싱 → setDraftBundle
  - `AIModuleGenerationPanel.tsx` (신규) — 입력 + 생성 결과 미리보기 + 적용 통합 패널
  - `/api/ai/module/route.ts` (신규) — LLM 호출, module JSON 생성 전용 엔드포인트
  - `IoStudioSection.tsx` — "AI 생성" 버튼/탭 추가 (AIModuleGenerationPanel 연결)
- What must NOT change:
  - 기존 Export/Import JSON 흐름 제거 금지 (고급 사용자 유지)
  - LLMCallService 내부 변경 없음
  - useModStudioStore 외부 API 변경 없음
  - importStudioDraftBundle 내부 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/platform/mod-studio/ai/AIModulePromptBar.tsx`
- `v10/src/features/platform/mod-studio/ai/AIModuleGenerationPanel.tsx`
- `v10/src/features/platform/mod-studio/ai/useAIModuleGeneration.ts`
- `v10/src/app/api/ai/module/route.ts`

Touched files/directories (write):
- `v10/src/features/platform/mod-studio/io/IoStudioSection.tsx` — AI 생성 패널 진입점 추가

Out of scope:
- 이미지/스크린샷 → 모듈 생성
- AI 생성 모듈 마켓플레이스
- 다중 제안 생성 (1회 1세트)
- commandId 자동 매핑 (생성된 commandId는 검증만, 선택 UI 별도)

---

## AI 시스템 프롬프트 (`/api/ai/module`)

```
system: |
  You are a UI module designer for a math education whiteboard app.
  Given a description, output an array of UI modules as JSON.
  Each module must have: id (snake_case), label (Korean or English), slot, order (integer), enabled (true), action.commandId, action.payload ({}).
  Valid slots: chrome-top-toolbar, left-panel, toolbar-inline, toolbar-bottom
  Known commandIds: nextStep, prevStep, triggerPlay, triggerStop, toggleAutoPlay, togglePause, setViewMode
  Ensure unique ids and non-overlapping order values.
  Output ONLY valid JSON array, no markdown, no explanation.

user: {description}

expected output:
[
  { "id": "my_next_btn", "label": "다음", "slot": "toolbar-bottom", "order": 10, "enabled": true,
    "action": { "commandId": "nextStep", "payload": {} } },
  ...
]
```

---

## 생성 흐름

```
사용자 입력 → POST /api/ai/module { description, providerId? } →
  LLM 호출 (JSON array) →
  응답 파싱 → validateModuleArray() →
  [유효] → useModStudioStore.upsertModuleDraft() 루프로 반영 (또는 기존 draft clone 후 setDraftBundle에 전체 전달) →
           Module Manager에 즉시 반영 → 사용자 확인 후 Publish
  [무효] → 에러 toast + 재시도 버튼
```

---

## validateModuleArray 설계

```typescript
// useAIModuleGeneration.ts에 내장 또는 별도 파일
const validateModuleArray = (
  raw: unknown,
  knownCommandIds?: Set<string>
): ModuleDraft[] | null => {
  if (!Array.isArray(raw)) return null;
  const modules: ModuleDraft[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const { id, label, slot, order, enabled, action } = item as Record<string, unknown>;
    if (typeof id !== "string" || !id.trim()) return null;
    if (!isKnownUISlotName(slot)) return null;
    if (typeof action !== "object" || action === null) return null;
    const { commandId } = action as Record<string, unknown>;
    if (typeof commandId !== "string") return null;
    if (
      knownCommandIds &&
      knownCommandIds.size > 0 &&
      !knownCommandIds.has(commandId.trim())
    ) {
      return null;
    }
    modules.push({
      id: String(id).trim(),
      label: typeof label === "string" ? label.trim() : String(id),
      slot: slot as UISlotName,
      order: typeof order === "number" ? Math.round(order) : modules.length,
      enabled: enabled !== false,
      action: { commandId: String(commandId), payload: {} },
    });
  }
  return modules.length > 0 ? modules : null;
};
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
  - OpenAI SDK: task_289에서 이미 추가됨
  - `/api/ai/module` route: 동일 SDK + AI_MOCK_MODE 패턴 재사용
- Boundary rules:
  - `features/mod-studio/ai/` → features 레이어. core import 허용. app import 금지.
  - `useAIModuleGeneration.ts` → /api/ai/module POST 경유 (브라우저 직접 LLM 호출 금지)
  - `/api/ai/module/route.ts` → app 레이어. LLM API key 서버 환경변수만.
- Compatibility:
  - AI_MOCK_MODE=true 시 mock 모듈 배열 반환 (task_289, task_292와 동일 패턴)
  - 생성된 모듈은 moduleDiagnostics 검증 경로와 동일 기준(commandBus) 사용 (task_297과 연동)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P1
- Depends on tasks: [task_289 (LLMCallService, /api/ai/call), task_292 (AI 생성 패턴), task_297 (commandId 검증)]
- Enables tasks: [없음]
- Parallel group: G-hotfix-P1 (IoStudioSection.tsx 단독 파일 — 충돌 없음)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 5 (4 create + 1 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (features → app API route)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~40min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (독립 파일, task_297 완료 후 실행 권장)
- Rationale: task_292 패턴 직접 재사용. 신규 코드 최소. task_297(commandId 검증) 완료 후 실행.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_302 only
- File ownership lock plan: 5개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_297 완료 후
  - Agent close/reuse policy: 완료 즉시 close
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
- [x] Structure changes: `node scripts/gen_ai_read_me_map.mjs` 실행
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: Mod Studio AI 모듈 생성 루프 내재화, /api/ai/module route 규칙

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: IoStudioSection에 "AI 생성" 진입점(버튼 또는 섹션) 표시
- [ ] AC-2: 자연어 입력 → "생성" 버튼 → /api/ai/module POST → 로딩 표시
- [ ] AC-3: LLM 응답 → validateModuleArray 통과 → Module Manager에 모듈 즉시 반영
- [ ] AC-3: LLM 응답 → validateModuleArray 통과 → Module Manager에 모듈 즉시 반영
- [ ] AC-4: LLM 응답 유효하지 않으면 에러 toast + 재시도 버튼
- [ ] AC-5: commandBus 기준으로 알 수 없는 commandId가 포함된 응답은 거부됨
- [ ] AC-6: AI_MOCK_MODE=true 시 mock 모듈 배열 반환 (API key 없이 동작)
- [ ] AC-7: LLM API key 브라우저 노출 없음
- [ ] AC-8: 기존 Export/Import JSON 흐름 회귀 없음
- [ ] AC-9: `npm run lint` 통과
- [ ] AC-10: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: AI 모듈 생성 전체 흐름
   - Mod Studio → IO 섹션 → AI 생성 → "수학 뷰어용 다음/이전 버튼 2개 추가해줘" 입력 → 생성
   - Module Manager에 모듈 반영 확인 → Publish
   - Covers: AC-1, AC-2, AC-3

2) Step: 잘못된 응답 처리
   - Mock으로 broken JSON 주입 → 에러 toast + 재시도 버튼 확인
   - unknown commandId 포함 응답도 거부 확인
   - Covers: AC-4, AC-5

3) Step: Mock 모드
   - AI_MOCK_MODE=true → AI 생성 → mock 모듈 수신 확인
   - Covers: AC-6

4) Step: 기존 Export/Import 회귀 없음
   - Export → JSON 확인 → Import 정상 동작 확인
   - Covers: AC-8

5) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-9, AC-10

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - LLM이 알 수 없는 commandId 생성 → validateModuleArray에서 통과되지만 task_297 진단에서 에러 표시
    → 사용자가 Publish 전 수정할 기회 있음 (허용 가능한 리스크)
  - IoStudioSection 구조 변경으로 기존 Export/Import 흐름 회귀 가능
    → AI 생성 섹션을 기존 하단에 추가 (기존 UI 위치 변경 없음)
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> task_297(commandId 검증) 완료 후 실행 권장.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/mod-studio/ai/AIModulePromptBar.tsx`
- `v10/src/features/platform/mod-studio/ai/AIModuleGenerationPanel.tsx`
- `v10/src/features/platform/mod-studio/ai/useAIModuleGeneration.ts`
- `v10/src/app/api/ai/module/route.ts`
- `v10/src/features/platform/mod-studio/io/IoStudioSection.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- Mod Studio의 IO 섹션에서 JSON/AI 생성 모드 전환이 가능하도록 연결.
- `/api/ai/module` mock-first + 구조 검증 + client-side commandId 검증 파이프라인 반영.
- 모듈 반영은 `upsertModuleDraft` 루프를 사용해 partial bundle overwrite를 방지.
