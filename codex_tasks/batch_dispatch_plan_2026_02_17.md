# Batch Dispatch Plan — 2026-02-17

Status: DRAFT
Analyst: Claude Code
Executor: Codex CLI

---

## 1. Input: PENDING Task Pool

| Task ID | Title | Mode | Batch-eligible | Touched Files (W) | Est. Duration |
|---------|-------|------|----------------|---------------------|---------------|
| task_269 | CSS dead-code prune | MANUAL | NO (chain) | globals.css | ~20min |
| task_270 | Neon/Swatch 통합 | MANUAL | NO (chain) | globals.css, tailwind.config, src/** | ~30min |
| task_271 | Feature CSS 분리 | MANUAL | NO (chain) | globals.css, features/**, AI_READ_ME | ~45min |
| task_273 | Error Boundary 구축 | MANUAL | YES | ui/ErrorBoundary(new), ExtensionSlot, ExtensionRuntimeBootstrap, AppLayout, WindowHost | ~30min |
| task_274 | 명령 파일 분할 | MANUAL | YES | registerCoreCommands, commands.*(new) | ~45min |
| task_275 | Store 상태 중복 해소 | MANUAL | YES | useSyncStore, useLocalStore, useViewportStore, useChromeStore, useUIStoreBridge | ~40min |

**전제**: task_266, 268 COMPLETED. task_267 SUPERSEDED.

---

## 2. File Conflict Matrix

```
                              | 269 | 270 | 271 | 273 | 274 | 275 |
globals.css                   |  W  |  W  |  W  |     |     |     |  ← 269→270→271 순차 강제
tailwind.config.ts            |     |  W  |     |     |     |     |
features/**/*.css (신규)      |     |     |  W  |     |     |     |
AI_READ_ME.md                 |     |     |  W  |     |     |     |
ui/components/ErrorBoundary   |     |     |     | new |     |     |
ExtensionSlot.tsx             |     |     |     |  W  |     |     |
ExtensionRuntimeBootstrap.tsx |     |     |     |  W  |     |     |
AppLayout.tsx                 |     |     |     |  W  |     |     |
WindowHost.tsx                |     |     |     |  W  |     |     |
registerCoreCommands.ts       |     |     |     |     |  W  |     |
commands.*.ts (신규)          |     |     |     |     | new |     |
useSyncStore.ts               |     |     |     |     |     |  W  |
useLocalStore.ts              |     |     |     |     |     |  W  |
useViewportStore.ts           |     |     |     |     |     |  W  |
useChromeStore.ts             |     |     |     |     |     |  W  |
useUIStoreBridge.ts           |     |     |     |     |     |  W  |
```

**충돌 요약**:
- 269↔270↔271: globals.css 공유 → **순차 강제** (이미 DAG에 반영됨)
- 273↔274↔275: **충돌 없음** → 병렬 가능
- {269,270,271}↔{273,274,275}: **충돌 없음** → 크로스 병렬 가능

---

## 3. Dependency DAG

```
                    ┌─── task_273 (ErrorBoundary) ──────── 독립
                    │
[시작] ─────────────┼─── task_274 (명령 분할) ──────────── 독립
                    │
                    ├─── task_275 (상태 중복) ──────────── 독립
                    │
                    └─── task_269 (dead-code) ──→ task_270 (neon/swatch) ──→ task_271 (CSS 분리)
                              globals.css 체인
```

**크리티컬 패스**: 269→270→271 (합계 ~95min)
**독립 패스**: 273, 274, 275 (각 ~30~45min, 병렬 시 최대 ~45min)

---

## 4. Wave Plan

### Wave 1 (최대 병렬 — 4슬롯 동시)

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Executor-A | task_269 (dead-code prune) | globals.css | ~20min |
| Executor-B | task_273 (Error Boundary) | ui/ErrorBoundary, ExtensionSlot, Bootstrap, AppLayout, WindowHost | ~30min |
| Executor-C | task_274 (명령 분할) | registerCoreCommands, commands.*.ts | ~45min |
| Executor-D | task_275 (상태 중복) | useSyncStore, useLocalStore, useViewportStore, useChromeStore, useUIStoreBridge | ~40min |

- Reviewer 슬롯: 2 (완료순으로 검토)
- **Wave 1 예상 소요: ~45min** (가장 긴 task_274 기준)
- task_269 완료 시점 (~20min)에 즉시 Wave 2 진입 가능 (DYNAMIC 배정)

### Wave 2 (269 완료 후 즉시 — globals.css 해방)

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Executor-A (재활용) | task_270 (neon/swatch 통합) | globals.css, tailwind.config, src/** | ~30min |

- Wave 1의 273/274/275가 아직 실행 중이어도 270은 시작 가능
- **이것이 DYNAMIC 배정의 핵심**: 269 완료 → 슬롯 즉시 재활용 → 270 투입
- Wave 2 시작 시점: ~Wave 1 시작 후 20분

### Wave 3 (270 완료 후 — globals.css 해방)

| 슬롯 | 태스크 | 파일 잠금 | 예상 시간 |
|---|---|---|---|
| Executor-A (재활용) | task_271 (Feature CSS 분리) | globals.css, features/**, AI_READ_ME | ~45min |

- 270 완료 시점 예상: ~Wave 1 시작 후 50분
- Wave 3 시작 시점: ~Wave 1 시작 후 50분

---

## 5. Execution Mode Summary

- Total tasks: **6**
- MANUAL tasks: 6
- DELEGATED tasks: 0
- Batch waves: **3** (하지만 DYNAMIC 겹침으로 실질 2.5)
- Slot allocation mode: **DYNAMIC**
- Slot priority rule: **critical-path-first** (269→270→271 체인이 크리티컬 패스)

### 예상 타임라인

```
시간  0min     20min     30min     40min     45min     50min     80min     95min
      │        │         │         │         │         │         │         │
269   ████████ ✓         │         │         │         │         │         │
273   ████████████████████████████ ✓         │         │         │         │
274   ████████████████████████████████████████████████ ✓         │         │
275   ████████████████████████████████████████████ ✓   │         │         │
270            ██████████████████████████████████████████████████ ✓         │
271                                                    ██████████████████████████ ✓
      │        │         │         │         │         │         │         │
      Wave1 시작  269완→270시작  273완료     275완료   274완  270완→271시작   전체완료
```

**순차 실행 시**: 269+270+271+273+274+275 = ~210min
**이 배치 플랜 시**: ~95min
**효율 향상: ~55% 시간 절감**

---

## 6. Risk Notes

- **globals.css 체인(269→270→271)이 크리티컬 패스**:
  - 269가 지연되면 270, 271이 모두 밀림
  - 269는 가장 단순한 작업(dead-code 삭제)이라 지연 위험 낮음

- **task_275(상태 중복)가 가장 높은 구현 위험**:
  - store 파일이 대형 (useSyncStore 10,527줄, useUIStoreBridge 9,840줄)
  - 잘못된 SSOT 방향 설정 시 전체 앱 동작 이상 가능
  - 검토자가 275를 최우선으로 리뷰해야 함

- **task_273(Error Boundary)은 가장 안전**:
  - 기존 코드를 감싸기만 하는 작업
  - 정상 동작 시 투명 (에러 미발생 시 아무 변화 없음)

- **task_274(명령 분할)는 기능 동등성 검증 필수**:
  - 2,320줄 분할 후 80개 명령이 전부 등록되는지 확인

---

## 7. Codex 실행 지시 요약

```
1. 맥스모드 ON
2. Wave 1: task_269, 273, 274, 275 동시 실행 (4 executor + 2 reviewer)
3. task_269 완료 즉시 → task_270 투입 (DYNAMIC 슬롯 재활용)
4. task_270 완료 즉시 → task_271 투입 (DYNAMIC 슬롯 재활용)
5. 전체 완료 후 end 게이트: npm run lint + npm run build + 검증 스크립트
```

---

## 7. Approval

- [ ] User approved batch plan
- [ ] Codex acknowledged execution order
