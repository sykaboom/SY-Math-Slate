# Task 286: Phase 5.2 — Live One-Way Broadcast + Server Persistence

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_285 COMPLETED: CanvasSnapshot 타입, ViewerShell, /view/[shareId] 라우트 존재

[ SCOPE EXPANSION FROM 5.1 ]
1. localStorage → 서버 persistence (cross-device 공유 가능)
2. 일방향 실시간 브로드캐스트: Host 캔버스 변경 → 뷰어 즉시 반영
3. 공개 URL 발급 (shareId + access token)

[ SYNC MODEL DECISION ]
- Host-authoritative: 진실의 근원 = host 캔버스 상태
- 뷰어는 수신 전용. 뷰어 mutation 없음 (Phase 5.3에서 추가).
- CRDT-ready: op_id, actor_id, canvas_id, base_version, timestamp 포함

[ TRANSPORT ]
- configurable WebSocket relay (기본)
- ADAPTER 패턴으로 구현: transport 교체 가능 (PartyKit은 후속 옵션)
- Phase 5.1 localStorage 코드는 fallback으로 유지 (offline 지원)

[ STORAGE ]
- Upstash Redis를 Phase 5.2 MVP 저장소로 사용 (shareId -> JSON + TTL)
- SnapshotAdapterInterface 유지: 이후 Supabase/Postgres로 교체 가능

[ ANONYMOUS ACCESS ]
- 뷰어: 로그인 불필요. rate-limit 적용.
- 비공개 세션: access token (URL에 포함) 필요.
- 개인정보 최소화: sessionId만 추적, 실명 불필요.
```

---

## Goal (Base Required)

- What to change:
  - 서버 persistence adapter (`ServerSnapshotAdapter`): Upstash Redis 기반 snapshot 저장/로드 API
  - Upstash 저장소 adapter (`UpstashSnapshotAdapter`) 추가
  - WebSocket transport adapter (`LiveBroadcastTransport`)
  - Host 세션 훅 (`useHostSession`): 캔버스 변경 감지 → diff → broadcast
  - 뷰어 구독 훅 (`useViewerLiveSession`): 실시간 업데이트 수신 → ViewerShell 갱신
  - `useSnapshotShare.ts` 수정: localStorage fallback 유지 + server adapter 연결
  - `/view/[shareId]` 뷰어 라우트 수정: 실시간 구독 분기 (live vs snapshot)
  - 공개/비공개 access token 발급 (`generateAccessToken`)
  - Next.js API route: `POST /api/share` (스냅샷 저장), `GET /api/share/[shareId]` (로드)
- What must NOT change:
  - `PersistedCanvasV2`, `CanvasSnapshot` 타입 구조 변경 없음
  - 기존 에디터 기능 영향 없음
  - Phase 5.1의 localStorage fallback 제거 금지 (offline 지원)

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/collaboration/sharing/adapters/LocalSnapshotAdapter.ts` — Phase 5.1 localStorage 로직 추출
- `v10/src/features/collaboration/sharing/adapters/ServerSnapshotAdapter.ts` — API 기반 저장/로드
- `v10/src/features/collaboration/sharing/adapters/UpstashSnapshotAdapter.ts` — Upstash Redis 저장/로드 구현
- `v10/src/features/collaboration/sharing/adapters/SnapshotAdapterInterface.ts` — adapter 인터페이스
- `v10/src/features/collaboration/sharing/transport/LiveBroadcastTransport.ts` — WebSocket 추상화
- `v10/src/features/collaboration/sharing/useHostSession.ts` — host 캔버스 변경 → broadcast
- `v10/src/features/chrome/viewer/useViewerLiveSession.ts` — 실시간 뷰어 구독
- `v10/src/app/api/share/route.ts` — POST (저장) / GET (조회) API route
- `v10/src/app/api/share/[shareId]/route.ts` — GET (단일 조회) API route

Touched files/directories (write):
- `v10/src/features/collaboration/sharing/useSnapshotShare.ts` — adapter 패턴으로 리팩토링
- `v10/src/features/chrome/viewer/useViewerSession.ts` — live vs snapshot 분기
- `v10/src/app/view/[shareId]/page.tsx` — live session 지원 추가
- `v10/src/core/types/snapshot.ts` — `LiveSessionMeta` 타입 추가

Out of scope:
- 뷰어 → host 반향 (양방향은 Phase 5.3)
- 레이어 단위 부분 공유 (Phase 5.4)
- AI 승인 파이프라인 (Phase 5.5)
- 댓글/주석
- 실명 인증/OAuth

---

## 브로드캐스트 데이터 모델 (CRDT-ready)

```typescript
// Host → Viewer 브로드캐스트 envelope
type BroadcastEnvelope = {
  op_id: string;          // 연산 고유 ID (UUID)
  actor_id: string;       // host session ID (익명)
  canvas_id: string;      // shareId
  base_version: number;   // 이 연산이 적용된 베이스 버전
  timestamp: number;      // Unix ms
  payload:
    | { type: "snapshot"; canvas: PersistedCanvasV2 }
    | { type: "step_change"; step: number }
    | { type: "viewport_sync"; viewport: SharedViewportState }
    | { type: "session_end" };
};
```

---

## Access Control (Phase 5.2 MVP)

```
공개 세션: /view/{shareId}        → 누구나 접근
비공개 세션: /view/{shareId}?t={token} → token 검증
token: HMAC-SHA256(shareId + secret, 24h TTL)
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: YES (한정)
  - Upstash Redis client (`@upstash/redis`) 1개
  - WebSocket transport는 내장 WebSocket API 사용 (`ws://` or `wss://`)
- Boundary rules:
  - `features/sharing/adapters/` → core + features만 import. app 금지.
  - `app/api/share/` → Next.js API route. Upstash Redis만 사용 (in-memory/file storage 금지).
  - Upstash env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
  - Phase 5.1 localStorage fallback 제거 금지.
- Compatibility:
  - `SnapshotAdapterInterface`는 Phase 5.3에서 bidirectional transport로 확장 가능.
  - `BroadcastEnvelope`의 payload union은 Phase 5.3에서 proposal 타입 추가.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W5-phase5
- Depends on tasks: [task_285]
- Enables tasks: [task_287 Phase 5.3]
- Parallel group: G5-sharing (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 13 (9 create + 4 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (features → app API route)
- Parallelizable sub-units: 2 (adapters 그룹 / transport 그룹 — 실질 1 에이전트 효율적)
- Estimated single-agent duration: ~60min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: NO (task_285 선행 필수)
- Rationale: transport 추상화 + API route + adapter 패턴. 컨텍스트 일관성을 위해 단일 에이전트.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_286 only
- Assigned roles:
  - Implementer-A: 12개 파일 순차 작성
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 12개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_285 완료 시
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
- [x] Structure changes: `node scripts/gen_ai_read_me_map.mjs` 실행
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md`: Phase 5.2 live broadcast + server persistence 기록
  - adapter 패턴 레이어 규칙 명시

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: host 세션 시작 → 브로드캐스트 transport 연결
- [ ] AC-2: host 캔버스 변경(아이템 추가/삭제/수정) → 뷰어에 1초 이내 반영
- [ ] AC-3: host step 변경 → 뷰어 step 동기화
- [ ] AC-4: `POST /api/share` → shareId + 스냅샷 저장 성공 (Upstash Redis)
- [ ] AC-5: `GET /api/share/${shareId}` → 저장된 스냅샷 반환 (Upstash Redis)
- [ ] AC-6: 다른 디바이스 브라우저에서 `/view/${shareId}` 접속 → 스냅샷 로드 성공
- [ ] AC-7: 비공개 세션 접근 시 token 없으면 403 응답
- [ ] AC-8: Phase 5.1 localStorage fallback 여전히 동작 (서버 연결 실패 시 graceful)
- [ ] AC-9: `npm run lint` 통과
- [ ] AC-10: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: Host → Viewer 실시간 동기화
   - 두 브라우저 탭: 탭 A = host 에디터, 탭 B = `/view/${shareId}`
   - host에서 아이템 추가 → 뷰어에서 1초 이내 아이템 출현 확인
   - Covers: AC-1, AC-2

2) Step: Cross-device 공유
   - host에서 URL 공유 → 다른 기기 브라우저에서 접속 → 스냅샷 로드 확인
   - Covers: AC-6

3) Step: Upstash 저장 확인
   - Upstash 콘솔/REST 조회로 `share:${shareId}` key 존재 + TTL 설정 확인
   - Covers: AC-4, AC-5

4) Step: 비공개 세션 접근 거부
   - token 없이 비공개 shareId URL 접속 → 403 or 에러 페이지 확인
   - Covers: AC-7

5) Step: Offline fallback
   - 서버 endpoint 비활성화 → Share 버튼 클릭 → localStorage 저장 확인
   - Covers: AC-8

6) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-9, AC-10

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Upstash 네트워크 지연/일시 장애 시 공유 API 응답 지연
  - 잘못된 TTL 설정 시 스냅샷 조기 만료 위험
  - WebSocket 연결 끊김 → auto-reconnect 로직 필요 (`LiveBroadcastTransport`)
- Roll-back: `git revert <commit>` 한 줄 + API route 삭제

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_285 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/collaboration/sharing/adapters/SnapshotAdapterInterface.ts`
- `v10/src/features/collaboration/sharing/adapters/LocalSnapshotAdapter.ts`
- `v10/src/features/collaboration/sharing/adapters/UpstashSnapshotAdapter.ts`
- `v10/src/features/collaboration/sharing/adapters/ServerSnapshotAdapter.ts`
- `v10/src/features/collaboration/sharing/transport/LiveBroadcastTransport.ts`
- `v10/src/features/collaboration/sharing/useHostSession.ts`
- `v10/src/features/chrome/viewer/useViewerLiveSession.ts`
- `v10/src/app/api/share/route.ts`
- `v10/src/app/api/share/[shareId]/route.ts`
- `v10/src/features/collaboration/sharing/useSnapshotShare.ts`
- `v10/src/features/chrome/viewer/useViewerSession.ts`
- `v10/src/app/view/[shareId]/page.tsx`
- `v10/src/core/types/snapshot.ts`
- `codex_tasks/task_286_phase5_2_live_oneshot_broadcast.md`

## Gate Results (Codex fills)

- Lint: PASS (`cd v10 && npm run lint`)
- Build: PASS (`cd v10 && npm run build`)
- Script checks: PASS (`bash scripts/check_layer_rules.sh`)

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- Upstash Redis adapter (`UpstashSnapshotAdapter`) + server adapter wrapper(`ServerSnapshotAdapter`)를 추가했고, API route가 동일 adapter를 사용하도록 연결함.
- 로컬 fallback(`LocalSnapshotAdapter`)은 유지하여 서버 실패 시 기존 localStorage 경로가 계속 동작하도록 보장함.
- Live transport는 WebSocket 추상화(`LiveBroadcastTransport`)로 분리했고 host/viewer live session 훅을 추가함.
