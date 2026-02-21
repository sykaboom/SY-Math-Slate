# Task 289: Phase 5.5 — AI 승인 파이프라인 + Tutor Moderated AI 완성

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_287 COMPLETED: SessionPolicy.ai_question = "host_required" 이미 정의
- useSyncStore: pendingAIQueue 인프라 이미 존재
  (PendingAIQueueEntry: id, toolId, adapterId, payload, meta, toolResult, status)
- resolveQueueEntryConflict (features/sync/realtime/conflictPolicy.ts) 존재

[ DECISION - AI 승인 흐름 ]
학생 질문 흐름:
  학생 → ai_question proposal → teacher 검토 큐
  teacher: approve / modify_then_approve / reject
  approve → LLM 호출 → LLM 응답 → teacher 검토 큐
  teacher: forward_to_student / re_ask / modify_then_forward / reject

병목 완화:
  - one-click re-ask 프리셋 ("더 짧게", "더 쉽게", "예시 추가")
  - teacher 프롬프트 프로필 (전역/템플릿/세션/teacher override)
  - 유사 질문 일괄 승인
  - template 단위 auto-pass 옵션

[ LLM 구조 ]
- Provider Registry: OpenAI 1개 + mock fallback (MVP)
- Prompt Profile: { global, template, session, teacher_override }
- Policy Engine: who / when / what / which model
- MVP: 단일 모델(OpenAI) + Tutor Moderated AI 템플릿 + one-click re-ask

[ AI 승인 관련 기존 인프라 ]
- useSyncStore.pendingAIQueue: 이미 enqueuePendingAI, markApproved, markRejected 존재
- PendingApprovalPanel.tsx (features/toolbar): 승인 UI 이미 존재 (기반 활용)
```

---

## Goal (Base Required)

- What to change:
  - `AIProviderRegistry` — LLM provider 등록/선택 (OpenAI + mock)
  - `PromptProfile` 타입 + `resolvePromptProfile()` — 4단계 프로필 병합
  - `QuestionQueueEntry` 타입 — 학생 질문 전체 생명주기 상태
  - `useTeacherApprovalQueue` hook — 교사 측 질문/응답 검토 큐 UI
  - `TeacherApprovalPanel.tsx` — 교사 검토 패널 (approve/modify/reject + re-ask 프리셋)
  - `useStudentAISession` hook — 학생 측 질문 전송 + 응답 수신
  - `StudentAIPromptBar.tsx` — 학생 질문 입력 UI (ViewerShell 하단)
  - `LLMCallService` — LLM 호출 서비스 (provider registry 경유)
  - `ReAskPresetBar.tsx` — one-click re-ask 프리셋 버튼 (교사용)
  - `/api/ai/call` route — OpenAI 호출 + mock fallback (server-side only)
  - `useSessionPolicyStore.ts` 수정: auto-pass per-type 옵션 추가
  - 기존 `PendingApprovalPanel.tsx` 수정: ai_question 항목 UI 통합
- What must NOT change:
  - `useSyncStore.pendingAIQueue` 기존 API (enqueuePendingAI 등) 변경 없음
  - `PendingAIQueueEntry` 타입 구조 변경 없음 (QuestionQueueEntry는 별도 타입)
  - Phase 5.3의 canvas_mutation proposal 흐름 변경 없음

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/core/types/aiApproval.ts` — QuestionQueueEntry, PromptProfile, QuestionState 타입
- `v10/src/core/config/aiProviderRegistry.ts` — LLM provider 등록
- `v10/src/features/collaboration/sharing/ai/LLMCallService.ts` — LLM 호출 (provider 경유)
- `v10/src/features/collaboration/sharing/ai/resolvePromptProfile.ts` — 4단계 프로필 병합
- `v10/src/features/collaboration/sharing/useTeacherApprovalQueue.ts` — 교사 검토 큐 훅
- `v10/src/features/collaboration/sharing/useStudentAISession.ts` — 학생 질문 훅
- `v10/src/features/collaboration/sharing/ai/StudentAIPromptBar.tsx` — 학생 질문 입력 UI
- `v10/src/features/collaboration/sharing/ai/TeacherApprovalPanel.tsx` — 교사 검토 패널
- `v10/src/features/collaboration/sharing/ai/ReAskPresetBar.tsx` — one-click re-ask 프리셋
- `v10/src/app/api/ai/call/route.ts` — OpenAI 호출 + mock fallback

Touched files/directories (write):
- `v10/src/features/chrome/toolbar/PendingApprovalPanel.tsx` — ai_question 항목 통합
- `v10/src/features/chrome/viewer/ViewerShell.tsx` — StudentAIPromptBar 조건부 추가
- `v10/src/features/platform/store/useSessionPolicyStore.ts` — auto-pass per-type 추가
- `v10/src/core/config/sessionPolicyTemplates.ts` — TUTOR_MODERATED_AI 완성 (LLM provider 설정)

Out of scope:
  - Anthropic/Gemini provider 구현 (후속 태스크)
  - OpenAI API key UI (환경변수 기반)
  - 실명 기반 학생 추적
  - 질문 이력 영구 저장 (세션 내 메모리만)
  - multi-canvas 동시 AI 세션

---

## QuestionQueueEntry 타입 (core/types/aiApproval.ts)

```typescript
export type QuestionState =
  | "awaiting_teacher_approval"   // 학생 질문 → teacher 검토 대기
  | "approved_sending_to_llm"     // teacher 승인 → LLM 호출 중
  | "awaiting_teacher_review"     // LLM 응답 → teacher 검토 대기
  | "forwarded_to_student"        // teacher 전달 → 학생 수신
  | "rejected";                   // teacher 거부

export type QuestionQueueEntry = {
  id: string;
  actorId: string;            // 학생 익명 ID
  question: string;           // 원본 질문 텍스트
  modifiedQuestion?: string;  // teacher가 수정한 질문 (optional)
  llmResponse?: string;       // LLM 응답
  modifiedResponse?: string;  // teacher가 수정한 응답 (optional)
  state: QuestionState;
  createdAt: number;
  updatedAt: number;
  // CRDT-ready
  op_id: string;
  base_version: number;
};

export type PromptProfile = {
  global?: string;          // 전역 시스템 프롬프트
  template?: string;        // 템플릿 레벨 프롬프트
  session?: string;         // 세션 레벨 프롬프트
  teacher_override?: string; // 교사 override (최고 우선순위)
};
```

---

## Re-Ask 프리셋 (기본)

```
"더 짧게"       → prompt: "Please provide a shorter explanation"
"더 쉽게"       → prompt: "Explain more simply for students"
"예시 추가"     → prompt: "Include a concrete example"
"다시 시도"     → 동일 질문 재호출
```

---

## LLM 호출 흐름

```
teacher approve → LLMCallService.call({
  providerId: sessionPolicy.llmProviderId,
  prompt: resolvePromptProfile(profiles) + question,
  onResponse: (text) => enqueueLLMResponse(entry.id, text)
})
→ LLM 응답 → state: "awaiting_teacher_review"
→ teacher: forward / re-ask / reject
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: YES (한정)
  - OpenAI SDK (`openai`) — optional, env key `OPENAI_API_KEY`
  - `AI_MOCK_MODE=true` 시 mock 응답 사용 가능 (server-only)
- Boundary rules:
  - `features/sharing/ai/` → features 레이어. core import 허용. app import 금지.
  - `LLMCallService` → Next.js API route 경유 (브라우저에서 직접 LLM API 호출 금지)
  - LLM API key는 server-side only (`/api/ai/call` route)
- Compatibility:
  - Phase 5.5 이후 CRDT (Phase 6) 확장 시 QuestionQueueEntry.op_id, base_version 활용
  - provider registry는 Phase 4 (AI 테마 인터페이스)에서도 재사용

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W5-phase5
- Depends on tasks: [task_287, task_288]
- Enables tasks: [Phase 3-B, Phase 4]
- Parallel group: G5-sharing (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 14 (10 create + 4 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (features → core → app API route)
- Parallelizable sub-units: 2 (LLMCallService 그룹 / TeacherApprovalPanel 그룹)
- Estimated single-agent duration: ~70min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (task_287, task_288 선행 필수)
- Rationale: 가장 복잡한 Phase 5 태스크. 학생/교사/LLM 3자 흐름 구현. 단일 에이전트 컨텍스트 유지.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_289 only
- File ownership lock plan: 14개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_287 AND task_288 완료 시
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
  - `v10/AI_READ_ME.md`: Phase 5.5 AI 승인 파이프라인 완성 기록
  - AI provider registry 레이어 규칙 명시 (server-side only API key)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Tutor Moderated AI 세션에서 학생 질문 전송 → teacher 큐에 "awaiting_teacher_approval" 상태로 등록
- [ ] AC-2: teacher approve → LLM 호출 → 응답 → "awaiting_teacher_review" 상태
- [ ] AC-3: teacher forward → 학생에게 응답 전달 → "forwarded_to_student"
- [ ] AC-4: teacher reject → "rejected" 상태 + 학생에게 거부 알림
- [ ] AC-5: Re-Ask 프리셋 ("더 짧게") 클릭 → 수정 프롬프트로 LLM 재호출
- [ ] AC-6: `AI_MOCK_MODE=true` 시 mock 응답 사용 (API key 없이 동작)
- [ ] AC-7: LLM API key 서버 환경변수 노출 없음 (브라우저 console 검사)
- [ ] AC-8: `npm run lint` 통과
- [ ] AC-9: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 학생 질문 → teacher 큐 등록
   - Tutor Moderated AI 세션 → 학생 뷰어에서 질문 입력 → 전송
   - host의 TeacherApprovalPanel에 질문 표시 확인
   - Covers: AC-1

2) Step: 승인 → LLM → 전달 전체 흐름
   - teacher approve → LLM 호출 중 표시 → 응답 수신 → teacher 검토 → forward
   - 학생 뷰어에서 AI 응답 표시 확인
   - Covers: AC-2, AC-3

3) Step: Re-Ask 프리셋
   - teacher가 "더 짧게" 버튼 클릭 → LLM 재호출 → 더 짧은 응답 수신
   - Covers: AC-5

4) Step: Mock 모드
   - `AI_MOCK_MODE=true` 설정 → AI 세션 실행 → mock 응답 수신
   - Covers: AC-6

5) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-8, AC-9

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - LLM 응답 지연 (수 초) → teacher 검토 UI에 로딩 상태 표시 필요
  - 다수 학생 동시 질문 → teacher 큐 overflow → maxQueueSize 정책 (sessionPolicy에 설정)
  - LLM API 비용: 세션당 호출 횟수 cap (sessionPolicy.maxLLMCallsPerSession)
- Roll-back: `git revert <commit>` 한 줄 + `/api/ai/call` route 비활성화

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_287 COMPLETED AND task_288 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/types/aiApproval.ts`
- `v10/src/core/config/aiProviderRegistry.ts`
- `v10/src/features/collaboration/sharing/ai/resolvePromptProfile.ts`
- `v10/src/features/collaboration/sharing/ai/LLMCallService.ts`
- `v10/src/app/api/ai/call/route.ts`
- `v10/src/features/collaboration/sharing/useTeacherApprovalQueue.ts`
- `v10/src/features/collaboration/sharing/ai/ReAskPresetBar.tsx`
- `v10/src/features/collaboration/sharing/ai/TeacherApprovalPanel.tsx`
- `v10/src/features/collaboration/sharing/useStudentAISession.ts`
- `v10/src/features/collaboration/sharing/ai/StudentAIPromptBar.tsx`
- `v10/src/features/chrome/viewer/ViewerShell.tsx`
- `v10/src/core/types/sessionPolicy.ts`
- `v10/src/core/config/sessionPolicyTemplates.ts`
- `v10/src/features/platform/store/useSessionPolicyStore.ts`
- `v10/src/features/chrome/toolbar/PendingApprovalPanel.tsx`

## Gate Results (Codex fills)

- Lint: PASS (`cd v10 && npm run lint`)
- Build: PASS (`cd v10 && npm run build`)
- Script checks: PASS (`bash scripts/check_layer_rules.sh`)

Manual verification notes:
- Teacher approval queue UI renders in host approval panel and supports approve/reject/re-ask paths.
- Student prompt bar is mounted in viewer shell and submits `ai_question`-typed requests.
- Server-only `/api/ai/call` route wired with OpenAI/mock fallback, no client API key exposure path added.
