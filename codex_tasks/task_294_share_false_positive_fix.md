# Task 294: 공유 성공 거짓 양성 수정 (서버 저장 실패 무시 문제)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- useSnapshotShare.ts:239-246:
    void Promise.resolve(
      serverAdapter.saveSnapshot({ snapshot, meta })
    ).catch(() => {
      // local fallback remains the source of truth when server persistence fails.
    });
  → 서버 저장 실패를 완전히 무시. createSnapshotShare는 localResult.ok 기준으로만 ok: true 반환.
- useSnapshotShare.ts:248-252: ok:true 반환 시 이미 링크 복사 완료로 처리됨
- ShareButton.tsx:91-115: createSnapshotShare 동기 호출 → result.ok면 "Copied" 상태로 전환
- ShareButton.tsx:144-148: "Copied" 상태에서 bg-emerald-500/15 텍스트 표시 (서버 실패 여부 미반영)
- UpstashSnapshotAdapter: UPSTASH_REDIS_REST_URL 미설정 시 즉시 ok:false 반환
  → 환경변수 없으면 서버 저장 항상 실패 → 현재는 무조건 무시됨
```

---

## Goal (Base Required)

- What to change:
  - `useSnapshotShare.ts` — `createSnapshotShare`를 async로 변경, 서버 저장 결과를 반환값에 포함
  - `ShareButton.tsx` — 서버 저장 실패 시 "Link copied (local only)" 경고 표시
- What must NOT change:
  - 로컬 저장 성공 시 링크 자체는 생성됨 (로컬에서 열기는 가능)
  - UpstashSnapshotAdapter 내부 로직 변경 없음
  - 공유 링크 URL 생성/복사 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/collaboration/sharing/useSnapshotShare.ts` — async createSnapshotShare, 반환 타입에 serverSaved: boolean 추가
- `v10/src/features/collaboration/sharing/ShareButton.tsx` — serverSaved:false 시 "(local only)" 경고 표시

Out of scope:
- 서버 저장 재시도 로직
- 오프라인 감지 및 자동 동기화
- 링크 복사를 서버 저장 완료까지 차단 (UX 퇴보 우려, 별도 결정 필요)

---

## 변경 설계

```
[ useSnapshotShare.ts ]
CreateSnapshotShareResult ok:true 케이스에 serverSaved: boolean 추가:
  | { ok: true; snapshot; meta; serverSaved: boolean }

createSnapshotShare를 async로 변경:
  const serverResult = await serverAdapter.saveSnapshot({ snapshot, meta }).catch(() => ({ ok: false }));
  return { ok: true, snapshot: localResult.snapshot, meta: localResult.meta, serverSaved: serverResult.ok };

[ ShareButton.tsx ]
handleShare를 이미 async임 — result.serverSaved 여부에 따라 feedback 메시지 분기:
  serverSaved: true  → "Copied"
  serverSaved: false → "Copied (local only — may not open on other devices)"
  상태: "copied" / "copied_local_only" / "error" 로 구분
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - useSnapshotShare → features/sharing 레이어 (변경 없음)
  - ShareButton → features/sharing 레이어 (변경 없음)
- Compatibility:
  - NEXT_PUBLIC_SHARE_LIVE_WS_URL 미설정 환경에서도 정상 동작 (로컬 only 경로)
  - UpstashSnapshotAdapter.ts 수정 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P0
- Depends on tasks: [task_285 (useSnapshotShare 원본)]
- Enables tasks: [없음]
- Parallel group: G-hotfix-B (task_294 단독, ShareButton 파일 task_301과 공유 주의)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: `ShareButton.tsx` (task_301 하드코딩 제거와 공유)
- Cross-module dependency: NO (features/sharing 내부)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~20min
- Recommended mode: DELEGATED (single-agent)
- Batch-eligible: NO (ShareButton.tsx task_301과 충돌 — task_294 먼저 실행 후 task_301)
- Rationale: 2파일, 단순한 async 변환 + 상태 분기. 단독 실행 권장.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_294 only
- File ownership lock plan: 2개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: 즉시 실행 가능 (task_293 AppLayout 수정과 파일 충돌 없음)
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
  - `v10/AI_READ_ME.md`: 공유 흐름 서버 저장 실패 처리 정책 명시

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Upstash 미설정 환경에서 공유 → "Copied (local only — may not open on other devices)" 표시
- [ ] AC-2: Upstash 정상 환경에서 공유 → "Copied" 표시 (기존과 동일)
- [ ] AC-3: 서버 저장 실패해도 링크는 복사됨 (로컬에서 열 수 있음)
- [ ] AC-4: `npm run lint` 통과
- [ ] AC-5: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 서버 미설정 환경에서 공유
   - UPSTASH_REDIS_REST_URL 미설정 상태로 공유 클릭
   - "Copied (local only)" 경고 메시지 확인
   - Covers: AC-1, AC-3

2) Step: 정상 환경에서 공유
   - Upstash 설정 완료 상태에서 공유 → "Copied" 표시 확인 (경고 없음)
   - Covers: AC-2

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - createSnapshotShare async 변환 시 ShareButton handleShare 체인 타입 오류 가능
    → ShareButton이 이미 async handleShare이므로 await createSnapshotShare() 추가만 필요
  - 서버 저장 대기 시간 동안 UI 블로킹 가능 (Upstash 응답 평균 50~200ms)
    → 로딩 상태("Sharing...") 표시 권장
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> task_301(테마 하드코딩)보다 먼저 실행 (ShareButton.tsx 파일 충돌).

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/collaboration/sharing/useSnapshotShare.ts`
- `v10/src/features/collaboration/sharing/ShareButton.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- 서버 저장 실패 시 `Copied (local only — may not open on other devices)` 상태 분기 적용 확인.
- 로컬 링크 복사 경로는 유지되고 false-positive 성공 표시는 제거됨.
