# Batch Dispatch Plan — 2026-02-18

Status: ARCHIVE / HISTORICAL SNAPSHOT
Note: This plan was executed and is retained for traceability only.
Analyst: Claude Code
Executor: Codex CLI

Replaces: batch_dispatch_plan_2026_02_17.md
Changes from previous plan:
- task_273 SUPERSEDED → 분할: task_276 (확장 레이어) + task_277 (셸 레이어)
- task_275 재작성: 틀린 globalStep/viewport 주장 제거, 실제 문제(useLocalStore 데드 스테이트)로 교체
- task_275 scope 5파일 → 1파일로 축소 (구현 위험 대폭 감소)
- 파일 크기 오류 수정 (useSyncStore 375줄, useUIStoreBridge 251줄)
- task_277 Wave 2 DYNAMIC 슬롯 재활용 추가
- Wave 1 병렬 실행 조건 명시 (맥스 오케스트레이션 모드 필요)

---

## 1. Input: PENDING Task Pool

| Task ID | Title | Mode | Batch-eligible | Touched Files (W) | Est. Duration |
|---------|-------|------|----------------|---------------------|---------------|
| task_269 | CSS dead-code prune | MANUAL | NO (chain) | globals.css | ~20min |
| task_270 | Neon/Swatch 통합 | MANUAL | NO (chain) | globals.css, tailwind.config, src/** | ~30min |
| task_271 | Feature CSS 분리 | MANUAL | NO (chain) | globals.css, features/**, AI_READ_ME | ~45min |
| task_274 | 명령 파일 분할 | DELEGATED (single-agent) | YES | registerCoreCommands.ts, commands.*.ts (신규) | ~45min |
| task_275 | useLocalStore 데드 스테이트 제거 | DELEGATED (single-agent) | YES | useLocalStore.ts (1개) | ~15min |
| task_276 | Error Boundary — 확장 레이어 | DELEGATED (single-agent) | YES | ErrorBoundary.tsx(신규), ExtensionSlot, ExtensionRuntimeBootstrap | ~20min |
| task_277 | Error Boundary — 셸 레이어 | DELEGATED (single-agent) | YES | AppLayout, WindowHost | ~15min |

**전제**: task_266, 268 COMPLETED. task_267, 273 SUPERSEDED.

**파일 크기 사실 확인** (직접 Read, 2026-02-18):
- useSyncStore.ts: 375줄 (이전 플랜의 "10,527줄"은 오류)
- useUIStoreBridge.ts: 251줄 (이전 플랜의 "9,840줄"은 오류)
- useLocalStore.ts: 60줄

---

## 2. File Conflict Matrix

```
                              | 269 | 270 | 271 | 274 | 275 | 276 | 277 |
globals.css                   |  W  |  W  |  W  |     |     |     |     |  ← 269→270→271 순차 강제
tailwind.config.ts            |     |  W  |     |     |     |     |     |
features/**/*.css (신규)      |     |     |  W  |     |     |     |     |
AI_READ_ME.md                 |     |     |  W  |     |     |     |  W  |  ← 비충돌 (271/277 순차 강제는 globals.css 때문)
registerCoreCommands.ts       |     |     |     |  W  |     |     |     |
commands.*.ts (신규)          |     |     |     | new |     |     |     |
useLocalStore.ts              |     |     |     |     |  W  |     |     |
ui/components/ErrorBoundary   |     |     |     |     |     | new |     |
ExtensionSlot.tsx             |     |     |     |     |     |  W  |     |
ExtensionRuntimeBootstrap.tsx |     |     |     |     |     |  W  |     |
AppLayout.tsx                 |     |     |     |     |     |     |  W  |
WindowHost.tsx                |     |     |     |     |     |     |  W  |
```

**충돌 요약**:
- 269↔270↔271: globals.css 공유 → **순차 강제**
- 276↔277: AppLayout/WindowHost에서 ErrorBoundary import → 277은 276 이후 (의존성)
- 274, 275, 276은 서로 **충돌 없음** → Wave 1 병렬 가능
- {269,270,271}↔{274,275,276,277}: **충돌 없음** → 크로스 병렬 가능

**AI_READ_ME.md 참고**: task_271(W)과 task_277(W)가 같은 파일에 쓰기. 그러나 271과 277은 서로 다른 Wave에 있고 globals.css 체인(271)이 크리티컬 패스라 자연히 분리됨. 동시 실행 방지 필요.

---

## 3. Dependency DAG

```
                    ┌─── task_274 (명령 분할) ──────────── 독립
                    │
                    ├─── task_275 (데드 스테이트) ──────── 독립
                    │
[시작] ─────────────┼─── task_276 (EB 확장 레이어) ──────→ task_277 (EB 셸 레이어) ── 독립
                    │
                    └─── task_269 (dead-code) ──→ task_270 (neon/swatch) ──→ task_271 (CSS 분리)
                              globals.css 체인
```

**크리티컬 패스**: 269→270→271 (합계 ~95min)
**보조 패스**: 276→277 (합계 ~35min)
**독립**: 274 (~45min), 275 (~15min)

---

## 4. Wave Plan

> **주의**: Wave 1 병렬 실행은 Codex **맥스 오케스트레이션 모드(Max Mode ON)** 필요.
> DELEGATED(single-agent) 태스크는 각 1 Implementer 슬롯만 사용하며 내부 병렬은 없음.

### Wave 1 (최대 병렬 — 4 executor + 2 reviewer)

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Implementer-A | task_269 (dead-code prune) | globals.css | ~20min |
| Implementer-B | task_274 (명령 분할) | registerCoreCommands, commands.*.ts | ~45min |
| Implementer-C | task_275 (데드 스테이트 제거) | useLocalStore.ts | ~15min |
| Implementer-D | task_276 (EB 확장 레이어) | ErrorBoundary(신규), ExtensionSlot, ExtensionRuntimeBootstrap | ~20min |
| Reviewer-1, Reviewer-2 | 완료순 검토 | — | — |

- **Wave 1 예상 소요: ~45min** (task_274 기준)
- task_275 완료 (~15min): 슬롯 즉시 해제, Reviewer 재할당
- task_269, task_276 완료 (~20min): 각 슬롯 즉시 해제 → Wave 2 진입

### Wave 2 (269, 276 완료 후 즉시 — DYNAMIC 슬롯 재활용)

269 완료 시 (예상 ~20min 시점):

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Implementer-A (재활용) | task_270 (neon/swatch 통합) | globals.css, tailwind.config | ~30min |

276 완료 시 (예상 ~20min 시점):

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Implementer-D (재활용) | task_277 (EB 셸 레이어) | AppLayout, WindowHost | ~15min |

- 269와 276이 거의 동시 완료 (~20min 시점)
- 두 슬롯 동시 재활용: task_270, task_277 병렬 실행

### Wave 3 (270 완료 후 — globals.css 해방)

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Implementer-A (재활용) | task_271 (Feature CSS 분리) | globals.css, features/**, AI_READ_ME | ~45min |

- 270 완료 시점 예상: ~50min (Wave 1 시작 기준)
- task_277은 ~35min에 완료 → AI_READ_ME.md 잠금 해제 (task_271 시작 시 이미 해제됨)

---

## 5. 예상 타임라인

```
시간  0min  15min  20min  35min  45min  50min  80min  95min
      │      │      │      │      │      │      │      │
275   ████████ ✓
274   ██████████████████████████████████████ ✓
276   ████████████████ ✓
269   ████████████████ ✓
                    │
277                 ████████████ ✓  (276 완료 후 시작)
270                 ██████████████████████████████ ✓  (269 완료 후 시작)
                                                │
271                                             ████████████████████████████ ✓
      │      │      │      │      │      │      │      │
      Wave1         269/276완 277완 274완 270완         전체완료
```

**순차 실행 시**: 269+270+271+274+275+276+277 = ~190min
**이 배치 플랜 시**: ~95min
**효율 향상: ~50% 시간 절감**

---

## 6. Execution Mode Summary

- Total tasks: **7**
- MANUAL tasks: 3 (`task_269~271`)
- DELEGATED tasks: 4 (`task_274~277`, single-agent lanes)
- Batch waves: **3** (DYNAMIC 겹침으로 실질 2.5)
- Slot allocation mode: **DYNAMIC** (완료 이벤트마다 슬롯 재계산)
- Slot priority rule: **critical-path-first** (269→270→271 체인이 크리티컬 패스)
- **맥스 오케스트레이션 모드 요구**: Wave 1에서 4 MANUAL 태스크 병렬 실행 필요

---

## 7. Risk Notes

- **globals.css 체인(269→270→271)이 크리티컬 패스**:
  - 269 지연 시 270, 271 모두 밀림
  - 269(dead-code 삭제)는 단순 작업이라 지연 위험 낮음

- **task_274(명령 분할)가 가장 긴 단일 태스크 (~45min)**:
  - 2,320줄 → 4파일 분할 후 80개 명령 전부 등록되는지 기능 동등성 검증 필수
  - 분할 후 import 경로가 registerCoreCommands.ts에서 올바르게 유지되는지 확인

- **task_275(데드 스테이트 제거)는 가장 안전 (~15min, 1파일)**:
  - 구현 전 grep으로 외부 호출자 0개 재확인 필수 (spec에 명시됨)
  - TypeScript strict build가 누락 참조를 자동 검출

- **task_276 → task_277 의존성**:
  - task_276이 ErrorBoundary.tsx를 생성해야 task_277이 import 가능
  - 277을 276보다 먼저 시작하지 않도록 슬롯 스케줄러 주의

- **AI_READ_ME.md 이중 쓰기 (task_271, task_277)**:
  - 두 태스크가 같은 파일에 쓰지만 다른 Wave에 배치됨
  - task_277은 ~35min에 완료 → task_271은 ~50min에 시작 → 충돌 없음

---

## 8. Codex 실행 지시 요약

```
1. 맥스 오케스트레이션 모드 ON
2. Wave 1: task_269, 274, 275, 276 동시 실행 (4 Implementer + 2 Reviewer)
3. task_269 완료 즉시 → task_270 투입 (DYNAMIC 슬롯 재활용)
4. task_276 완료 즉시 → task_277 투입 (DYNAMIC 슬롯 재활용, 276 이후만)
5. task_270 완료 즉시 → task_271 투입 (DYNAMIC 슬롯 재활용)
6. 전체 완료 후 end 게이트: cd v10 && npm run lint && npm run build
```

---

## 9. Approval

- [ ] User approved batch plan
- [ ] Codex acknowledged execution order
