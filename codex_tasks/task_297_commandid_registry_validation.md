# Task 297: commandId 레지스트리 검증 + 드롭다운 (Mod Studio 진단 false confidence)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- moduleDiagnostics.ts — getModuleDiagnostics()가 체크하는 항목:
    1. empty-id (활성 모듈 id가 비어있는지)
    2. duplicate-id (활성 모듈 id 중복)
    3. duplicate-order (order 값 중복 경고)
  → commandId 유효성 검사 없음. 빈 문자열도 통과. 존재하지 않는 commandId도 통과.
  → 결과: "no conflicts" 표시 후 publish 시 런타임 실패

- commandBus.ts — listAppCommands()/getAppCommandById() 존재:
    - listAppCommands(): AppCommandMetadata[] (id 기준 정렬)
    - getAppCommandById(id): AppCommand | null
  → 모듈 `action.commandId`의 실제 SSOT는 toolRegistry가 아니라 commandBus

- ModuleStudioSection.tsx — commandId 입력 방식:
    <input type="text" placeholder="command id" value={seed.action.commandId} ... />
  → 자유 텍스트 입력. 유효한 commandId 목록 없음.

- ModuleStudioSection.tsx createModuleSeed() 기본값:
    action: { commandId: "nextStep", payload: {} }
  → "nextStep"이 실제 등록된 commandId인지 검증되지 않음

- pluginLoader.ts는 manifest action.commandId 검증 시
    getAppCommandById(entry.action.commandId)를 사용함 (unknown-command-id)
  → module diagnostics도 동일 기준으로 맞춰야 false confidence 제거 가능
```

---

## Goal (Base Required)

- What to change:
  - `moduleDiagnostics.ts` — commandId 유효성 검증 추가
    (commandBus가 비어있으면 경고 수준, 등록된 commandId와 불일치 시 에러)
  - `ModuleStudioSection.tsx` — commandId 입력을 `<select>` 드롭다운으로 교체
    (`listAppCommands()`로 목록 구성, command 목록 비어있으면 텍스트 입력 fallback)
- What must NOT change:
  - registry.ts / toolRegistry 변경 없음
  - commandBus 등록 로직 변경 없음 (read-only 소비만)
  - getModuleDiagnostics 시그니처 변경 없음 (인자 추가만 허용)
  - 기존 empty-id / duplicate-id / duplicate-order 진단 로직 변경 없음

---

## Scope (Base Required)

Touched files/directories (write):
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts` — commandId 검증 추가
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx` — commandId select 드롭다운

Out of scope:
- registry.ts 변경
- 자동완성 UI (autocomplete 라이브러리)
- payload 필드 검증 (commandId만 대상)

---

## 변경 설계

```typescript
// moduleDiagnostics.ts
// getModuleDiagnostics 시그니처 변경:
export const getModuleDiagnostics = (
  modules: ModuleDraft[],
  knownCommandIds?: Set<string>  // optional: command bus 미사용 시 검증 스킵
): ModuleDiagnostic[] => {
  // ... 기존 로직 ...
  enabled.forEach((module) => {
    // ... 기존 empty-id, duplicate-id 체크 ...

    // commandId 검증 추가
    const cmdId = module.action.commandId.trim();
    if (cmdId.length === 0) {
      diagnostics.push({ level: "error", code: "empty-command-id", message: "commandId is empty." });
    } else if (knownCommandIds && knownCommandIds.size > 0 && !knownCommandIds.has(cmdId)) {
      diagnostics.push({
        level: "error",
        code: "unknown-command-id",
        message: `commandId '${cmdId}' is not registered in command bus.`,
      });
    } else if (knownCommandIds && knownCommandIds.size === 0) {
      diagnostics.push({
        level: "warning",
        code: "command-catalog-empty",
        message: "command catalog is empty. commandId cannot be validated.",
      });
    }
  });
  return diagnostics;
};

// ModuleStudioSection.tsx
// knownCommandIds 계산 추가:
const knownCommands = listAppCommands();
const knownCommandIds = new Set(knownCommands.map((c) => c.id));
const diagnostics = useMemo(
  () => getModuleDiagnostics(modules, knownCommandIds),
  [modules, knownCommandIds]
);

// commandId 입력 변경:
{knownCommands.length > 0 ? (
  <select value={seed.action.commandId} onChange={...}>
    {knownCommands.map((command) => (
      <option key={command.id} value={command.id}>{command.id}</option>
    ))}
  </select>
) : (
  <input type="text" placeholder="command id (command catalog empty)" ... />
)}
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `moduleDiagnostics.ts` → features/mod-studio 레이어.
  - `ModuleStudioSection.tsx` → `@core/engine/commandBus` read-only import 허용.
  - `ModuleStudioSection.tsx` → features/mod-studio 레이어.
- Compatibility:
  - getModuleDiagnostics 기존 호출처(PublishStudioSection 등)에서 knownCommandIds 없이 호출 시
    → optional 파라미터이므로 기존 동작 유지 (commandId 검증 스킵)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P0
- Depends on tasks: [없음 — 독립]
- Enables tasks: [없음]
- Parallel group: G-hotfix-D (단독, mod-studio 파일만)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (features/mod-studio → core/extensions/registry)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~25min
- Recommended mode: DELEGATED
- Batch-eligible: YES (다른 P0 태스크와 파일 충돌 없음 — 병렬 실행 가능)
- Rationale: 독립 파일. task_293~296과 병렬 실행 가능.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_297 only
- File ownership lock plan: 2개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: 즉시 실행 가능
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
  - `v10/AI_READ_ME.md`: Mod Studio commandId 검증 정책 명시

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 존재하지 않는 commandId 입력 시 Diagnostics에 [unknown-command-id] 에러 표시
- [ ] AC-2: commandId가 빈 문자열이면 [empty-command-id] 에러 표시
- [ ] AC-3: command catalog 비어있으면 [command-catalog-empty] 경고 표시 (에러 아님)
- [ ] AC-4: command catalog에 항목 있으면 commandId 입력이 select 드롭다운으로 표시
- [ ] AC-5: command catalog 비어있으면 텍스트 입력 fallback 표시
- [ ] AC-6: 기존 empty-id / duplicate-id 진단 회귀 없음
- [ ] AC-7: `npm run lint` 통과
- [ ] AC-8: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: unknown commandId 진단
   - ModuleStudioSection에서 commandId "nonExistentCmd" 입력 → Upsert → Diagnostics 확인
   - [unknown-command-id] 에러 표시 확인
   - Covers: AC-1

2) Step: select 드롭다운
   - command catalog(listAppCommands)에 항목 있을 때 Module Manager 열기 → commandId가 select 드롭다운으로 표시
   - Covers: AC-4

3) Step: 기존 진단 회귀 없음
   - 중복 id 모듈 추가 → duplicate-id 에러 여전히 표시
   - Covers: AC-6

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-7, AC-8

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - command catalog가 bootstrap 이전에 비어 있을 수 있음
    → listAppCommands() 결과가 [] 이면 fallback 텍스트 입력 + warning 표시 (AC-3, AC-5)
  - commandBus와 mod-studio import 순환 위험
    → commandBus에서 mod-studio를 import하지 않는지 확인 (단방향 import 유지)
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> task_293~296과 병렬 실행 가능.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/mod-studio/modules/moduleDiagnostics.ts`
- `v10/src/features/platform/mod-studio/modules/ModuleStudioSection.tsx`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`scripts/check_layer_rules.sh`)

Manual verification notes:
- commandBus catalog(`listAppCommands`) 기준 commandId 검증이 추가됨.
- catalog 존재 시 드롭다운, 비어있을 때 텍스트 입력 fallback 동작 반영.
