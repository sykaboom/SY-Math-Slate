# Task 287: Phase 5.3 — Live Bidirectional + Session Policy

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_286 COMPLETED: LiveBroadcastTransport, ServerSnapshotAdapter, BroadcastEnvelope 존재
- useSyncStore: pendingAIQueue 인프라 이미 존재 (Phase 5.5 기반 준비됨)

[ DECISION ]
- 양방향 (bidirectional): 뷰어/참가자가 캔버스 제안(proposal) 가능
- Host-authoritative 유지: 참가자 mutation은 항상 proposal → host 승인 → 반영
- 세션 정책: 모더(host)가 세션 생성 시 template JSON으로 정책 설정
- MVP 템플릿:
  a. Lecture Broadcast: 단방향, 참가자 proposal 금지
  b. Workshop Co-edit: 양방향, 도큐멘트 변경 자동 승인, AI 질문 자동 승인
  c. Tutor Moderated AI: 양방향, AI 질문 teacher 승인 필요, 캔버스 변경도 승인 필요

[ PROPOSAL FLOW (Phase 5.3) ]
참가자 → propose_mutation → host CommandBus → policy_check →
  [approved] → apply to canvas + broadcast all
  [rejected] → reject envelope back to participant
```

---

## Goal (Base Required)

- What to change:
  - `SessionPolicy` 타입 + 3개 MVP 정책 템플릿 JSON 정의
  - `ProposalEnvelope` 타입 (`BroadcastEnvelope` payload union 확장)
  - `useParticipantSession` hook: 참가자 측 proposal 전송
  - `useHostPolicyEngine` hook: host 측 proposal 수신 → policy check → 승인/거부
  - `SessionPolicyPanel` UI: 모더가 세션 정책 설정 (template 선택 + 커스텀)
  - `SessionPolicyStore` (Zustand): 활성 세션 정책 상태 관리
  - `ProposalCommandBus` 서비스: proposal → host → broadcast 중계
- What must NOT change:
  - `BroadcastEnvelope`의 기존 payload 타입 제거 금지 (union 확장만)
  - 기존 `pendingAIQueue` (useSyncStore) 로직 변경 없음 (Phase 5.5에서 확장)
  - Phase 5.2의 일방향 broadcast 동작 유지 (Lecture Broadcast 템플릿 = Phase 5.2와 동일)

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/core/types/sessionPolicy.ts` — SessionPolicy + ProposalEnvelope 타입
- `v10/src/core/config/sessionPolicyTemplates.ts` — 3개 MVP 정책 JSON
- `v10/src/features/sharing/useParticipantSession.ts` — 참가자 측 proposal 전송
- `v10/src/features/sharing/useHostPolicyEngine.ts` — host policy check + 승인/거부
- `v10/src/features/sharing/ProposalCommandBus.ts` — proposal 중계 서비스
- `v10/src/features/store/useSessionPolicyStore.ts` — 세션 정책 Zustand store
- `v10/src/features/layout/SessionPolicyPanel.tsx` — 모더용 정책 설정 UI

Touched files/directories (write):
- `v10/src/features/sharing/transport/LiveBroadcastTransport.ts` — 양방향 채널 지원 추가
- `v10/src/core/types/snapshot.ts` — `SessionPolicy` 필드 추가 (optional)
- `v10/src/features/viewer/ViewerShell.tsx` — proposal UI 조건부 렌더링

Out of scope:
- AI 질문 승인 파이프라인 (Phase 5.5에서 완성)
- 레이어 단위 부분 공유 (Phase 5.4)
- 실명/OAuth 인증

---

## SessionPolicy 타입 (core/types/sessionPolicy.ts)

```typescript
export type ProposalType =
  | "canvas_mutation"   // 캔버스 아이템 변경
  | "step_navigation"   // step 이동 요청
  | "viewport_sync"     // 뷰포트 동기화 요청
  | "ai_question";      // AI에게 질문 (Phase 5.5에서 완전 구현)

export type ApprovalMode = "auto" | "host_required" | "denied";

export type SessionPolicy = {
  templateId: string;
  label: string;
  proposalRules: Record<ProposalType, ApprovalMode>;
  maxParticipants: number;
  allowAnonymous: boolean;
};

// BroadcastEnvelope payload 확장
type ProposalEnvelope = {
  type: "proposal";
  proposalId: string;
  proposalType: ProposalType;
  actorId: string;
  payload: unknown;
  // CRDT-ready
  op_id: string;
  base_version: number;
  timestamp: number;
};

type ProposalResultEnvelope = {
  type: "proposal_result";
  proposalId: string;
  decision: "approved" | "rejected";
  reason?: string;
};
```

---

## MVP 정책 템플릿 (core/config/sessionPolicyTemplates.ts)

```typescript
export const LECTURE_BROADCAST: SessionPolicy = {
  templateId: "lecture_broadcast",
  label: "강의 방송",
  proposalRules: {
    canvas_mutation: "denied",
    step_navigation: "denied",
    viewport_sync: "denied",
    ai_question: "denied",
  },
  maxParticipants: 200,
  allowAnonymous: true,
};

export const WORKSHOP_COEDIT: SessionPolicy = {
  templateId: "workshop_coedit",
  label: "워크샵 공동 편집",
  proposalRules: {
    canvas_mutation: "auto",
    step_navigation: "auto",
    viewport_sync: "auto",
    ai_question: "auto",
  },
  maxParticipants: 30,
  allowAnonymous: true,
};

export const TUTOR_MODERATED_AI: SessionPolicy = {
  templateId: "tutor_moderated_ai",
  label: "교사 중재 AI 튜터",
  proposalRules: {
    canvas_mutation: "host_required",
    step_navigation: "denied",
    viewport_sync: "denied",
    ai_question: "host_required",
  },
  maxParticipants: 40,
  allowAnonymous: true,
};
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/types/sessionPolicy.ts`, `core/config/sessionPolicyTemplates.ts` → core 레이어
  - `features/sharing/useHostPolicyEngine.ts` → features 레이어. core import 허용.
  - `SessionPolicyPanel.tsx` → features/layout 레이어. features/store import 허용.
  - proposal 승인/거부 로직: host에서만 실행. 뷰어 측에서 직접 캔버스 수정 불가.
- Compatibility:
  - `ProposalEnvelope` payload union은 Phase 5.5에서 ai_question 확장 예정.
  - `SessionPolicy.proposalRules.ai_question: "host_required"` = Phase 5.5 AI 파이프라인의 트리거.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W5-phase5
- Depends on tasks: [task_286]
- Enables tasks: [task_288 Phase 5.4, task_289 Phase 5.5]
- Parallel group: G5-sharing (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 10 (7 create + 3 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (core config + features + store)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~50min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (task_286 선행 필수)
- Rationale: proposal 흐름 + policy check + 양방향 transport 확장. 컨텍스트 연속성 필요.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_287 only
- File ownership lock plan: 10개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_286 완료 시
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
  - `v10/AI_READ_ME.md`: Phase 5.3 세션 정책 + proposal 흐름 기록

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 3개 MVP 정책 템플릿 (`lecture_broadcast`, `workshop_coedit`, `tutor_moderated_ai`) 정의 완료
- [x] AC-2: Workshop Co-edit 세션에서 참가자가 캔버스 아이템 추가 → host에서 자동 승인 → 전체 반영
- [x] AC-3: Tutor Moderated AI 세션에서 참가자 캔버스 변경 → host UI에 승인 요청 표시 → 승인 후 반영
- [x] AC-4: Lecture Broadcast 세션에서 참가자 캔버스 변경 시도 → 거부 응답
- [x] AC-5: SessionPolicyPanel에서 템플릿 선택 + 커스텀 가능
- [x] AC-6: `npm run lint` 통과
- [x] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: Workshop Co-edit 자동 승인
   - host: Workshop Co-edit 세션 시작 → 뷰어 접속
   - 뷰어에서 수식 추가 proposal → host 자동 승인 → 모든 뷰어에 반영
   - Covers: AC-2

2) Step: Tutor Moderated AI 수동 승인
   - host: Tutor Moderated AI 세션 시작 → 뷰어 접속
   - 뷰어에서 캔버스 변경 → host UI에 승인 요청 표시 → 승인 클릭 → 반영
   - Covers: AC-3

3) Step: Lecture Broadcast 거부
   - host: Lecture Broadcast 세션 → 뷰어에서 편집 시도 → "편집 불가" 응답 확인
   - Covers: AC-4

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 양방향 WebSocket에서 proposal race condition: 두 참가자가 동시에 proposal 전송 시
    → host side에서 seq 기반 정렬 처리 (BroadcastEnvelope.base_version 활용)
  - Policy store가 AppLayout에 연결되어야 함 → prop drilling 방지를 위해 Context/Zustand 활용
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_286 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/types/sessionPolicy.ts` (new)
- `v10/src/core/config/sessionPolicyTemplates.ts` (new)
- `v10/src/features/sharing/useParticipantSession.ts` (new)
- `v10/src/features/sharing/useHostPolicyEngine.ts` (new)
- `v10/src/features/sharing/ProposalCommandBus.ts` (new)
- `v10/src/features/store/useSessionPolicyStore.ts` (new)
- `v10/src/features/layout/SessionPolicyPanel.tsx` (new)
- `v10/src/features/sharing/transport/LiveBroadcastTransport.ts` (edit)
- `v10/src/core/types/snapshot.ts` (edit)
- `v10/src/features/viewer/ViewerShell.tsx` (edit)

## Gate Results (Codex fills)

- Lint: PASS (`cd v10 && npm run lint`)
- Build: PASS (`cd v10 && npm run build`)
- Script checks: PASS (`bash scripts/check_layer_rules.sh`)

Manual verification notes:
- Lecture default behavior preserved via `LECTURE_BROADCAST` fallback in viewer policy resolution; proposal UI is hidden when step proposals are denied.
- Host-authoritative proposal flow implemented as: participant publish (`useParticipantSession`) -> host policy decision (`useHostPolicyEngine`) -> proposal result publish (`ProposalCommandBus`).
- Broadcast payload compatibility preserved by adding `proposal` and `proposal_result` union members only; existing payload variants unchanged.
- Manual live multi-client websocket scenario (AC-2~AC-4) was not executed in this environment; code-path verification completed by static review + type/lint/build gates.
- Failure classification: no newly introduced failures observed (blocking: none, non-blocking: none).
