# Task 303: scan_guardrails.sh 가드레일 스캔 스크립트 추가

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-19

---

## 사전 감사 기록

```
[ VERIFIED ]
- scripts/scan_guardrails.sh: Glob 결과 없음 — 파일 없음 확인
- scripts/check_layer_rules.sh: 존재 (기존 레이어 규칙 체크)
- 기존 가드레일 스크립트 부재로 다음이 자동 감지되지 않음:
  1. 하드코딩 색상 (task_295 재발 방지)
  2. 브라우저 클라이언트에서 LLM API 직접 호출 (보안)
  3. pointer-events 미설정 오버레이 (task_295 재발 방지)
  4. `"use client"` 파일에서 직접 OpenAI/Anthropic fetch 호출
```

---

## Goal (Base Required)

- What to change:
  - `scripts/scan_guardrails.sh` (신규) — 가드레일 스캔 스크립트
- What must NOT change:
  - `scripts/check_layer_rules.sh` 변경 없음

---

## Scope (Base Required)

Touched files/directories (create):
- `scripts/scan_guardrails.sh` — 가드레일 스캔 스크립트

Out of scope:
- CI 파이프라인 통합 (별도 태스크)
- 자동 수정 기능 (감지만)

---

## 스크립트 설계

```bash
#!/usr/bin/env bash
# scan_guardrails.sh
# 코드베이스에서 알려진 가드레일 위반 패턴을 스캔합니다.
# 사용법: bash scripts/scan_guardrails.sh [--strict]

set -euo pipefail

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
fi

FAIL=0
WARN=0
ROOT="v10/src"

echo "=== SY Math Slate 가드레일 스캔 ==="
echo ""

if ! command -v rg >/dev/null 2>&1; then
  echo "[FAIL] ripgrep(rg) is required but not installed."
  exit 1
fi

# 1. 하드코딩 Tailwind 색상 (UI 크롬 파일에서)
echo "[1] 하드코딩 Tailwind 색상 검사 (emerald/rose/green/red 직접 사용)..."
HARDCODE=$(rg -n \
  -e "bg-emerald|text-emerald|bg-rose|text-rose|bg-green-[0-9]|text-green-[0-9]|bg-red-[0-9]|text-red-[0-9]" \
  "$ROOT/features" "$ROOT/core" -g '*.ts' -g '*.tsx' || true)
if [ -n "$HARDCODE" ]; then
  echo "  [WARN] 하드코딩 Tailwind 색상 발견:"
  echo "$HARDCODE" | head -20
  WARN=$((WARN+1))
else
  echo "  [PASS] 하드코딩 색상 없음"
fi
echo ""

# 2. 브라우저 클라이언트에서 LLM API 직접 호출
echo "[2] 클라이언트 컴포넌트에서 LLM API 직접 호출 검사..."
CLIENT_LLM=""
while IFS= read -r file; do
  if rg -n -q \
    -e "api\\.openai\\.com" \
    -e "anthropic\\.com/v1" \
    -e "api\\.groq\\.com" \
    -e "generativelanguage\\.googleapis\\.com" \
    "$file"; then
    CLIENT_LLM+="${file}"$'\n'
  fi
done < <(rg -l '"use client"' "$ROOT" -g '*.ts' -g '*.tsx' || true)
if [ -n "$CLIENT_LLM" ]; then
  echo "  [FAIL] 클라이언트에서 LLM API 직접 호출 발견:"
  printf "%s" "$CLIENT_LLM"
  FAIL=1
else
  echo "  [PASS] 클라이언트 LLM 직접 호출 없음"
fi
echo ""

# 3. z-index 오버레이에 pointer-events-none 미설정
echo "[3] absolute/inset-0 오버레이에 pointer-events-none 누락 검사..."
OVERLAY_MISSING=""
while IFS= read -r line; do
  # line format: path:line:matched_text
  file=$(printf "%s" "$line" | cut -d: -f1)
  text=$(printf "%s" "$line" | cut -d: -f3-)
  if [[ "$text" != *"pointer-events-none"* ]]; then
    OVERLAY_MISSING+="${line}"$'\n'
  fi
done < <(rg -n "absolute inset-0" "$ROOT" -g '*.tsx' || true)
if [ -n "$OVERLAY_MISSING" ]; then
  echo "  [WARN] pointer-events-none 미설정 오버레이 의심 파일:"
  printf "%s" "$OVERLAY_MISSING"
  WARN=$((WARN+1))
else
  echo "  [PASS] 오버레이 pointer-events 설정 확인됨"
fi
echo ""

# 4. NEXT_PUBLIC_ 접두사로 비밀 키 노출 위험
echo "[4] NEXT_PUBLIC_ API 키 노출 위험 검사..."
PUBLIC_SECRETS=$(rg -n \
  -e "NEXT_PUBLIC_.*KEY" \
  -e "NEXT_PUBLIC_.*SECRET" \
  -e "NEXT_PUBLIC_.*TOKEN" \
  "$ROOT" . -g '*.ts' -g '*.tsx' -g '.env*' -g '!.next' -g '!node_modules' || true)
if [ -n "$PUBLIC_SECRETS" ]; then
  echo "  [FAIL] NEXT_PUBLIC_ 접두사 비밀 키 발견:"
  echo "$PUBLIC_SECRETS" | head -10
  FAIL=1
else
  echo "  [PASS] NEXT_PUBLIC_ 비밀 키 없음"
fi
echo ""

echo "=== 스캔 완료 ==="
if [ "$STRICT" -eq 1 ] && [ "$WARN" -gt 0 ]; then
  echo "결과: FAIL (strict 모드: WARN 항목을 실패로 처리)"
  exit 1
fi

if [ "$FAIL" -eq 1 ]; then
  echo "결과: FAIL (위 FAIL 항목 수정 필요)"
  exit 1
else
  echo "결과: PASS (WARN 항목은 검토 권장)"
  exit 0
fi
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (bash + grep만 사용)
- Boundary rules: 스크립트 레이어 (root/scripts/)
- Compatibility:
  - bash 5.x, macOS/Linux 호환
  - `rg`(ripgrep) 사용 전제. 없으면 실패로 종료하고 설치 안내 출력

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-hotfix-P2
- Depends on tasks: [없음 — 독립]
- Enables tasks: [CI 파이프라인 통합 시 사용 가능]
- Parallel group: G-hotfix-P2 (단독)
- Max parallel slots: 1
- Verification stage: `mid` (스크립트 파일만)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 1
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~15min
- Recommended mode: DELEGATED
- Batch-eligible: YES (독립 스크립트)
- Rationale: 스크립트 신규 생성. 기존 코드 수정 없음. 완전 독립.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_303 only
- File ownership lock plan: scan_guardrails.sh 단독
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
  - `v10/AI_READ_ME.md` 또는 `AGENTS.md`: 가드레일 스캔 스크립트 사용법 명시
  - `bash scripts/scan_guardrails.sh` — 정기 실행 권장

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `bash scripts/scan_guardrails.sh` 실행 → 스캔 결과 출력됨
- [ ] AC-2: LLM 직접 호출 없는 현재 코드베이스에서 [2] PASS 출력
- [ ] AC-3: `NEXT_PUBLIC_OPENAI_API_KEY` 등 위험 패턴 주입 시 [4] FAIL 출력
- [ ] AC-4: 기본 모드(`--strict` 없음)에서 WARN만 있을 경우 종료 코드 0 반환
- [ ] AC-5: strict 모드(`--strict`)에서 WARN 존재 시 종료 코드 1 반환
- [ ] AC-6: FAIL 항목 존재 시 종료 코드 1 반환

---

## Manual Verification Steps (Base Required)

1) Step: 스크립트 실행
   - Command: `bash scripts/scan_guardrails.sh`
   - 스캔 결과 출력 확인
   - Covers: AC-1

2) Step: PASS 항목 확인
   - 현재 코드베이스에서 [2] 클라이언트 LLM 호출 PASS 확인
   - Covers: AC-2

3) Step: FAIL 감지 확인
   - 임시로 client 파일에 "api.openai.com" 문자열 추가 → 스캔 FAIL 확인 → 제거
   - Covers: AC-3, AC-6

4) Step: strict 모드 확인
   - WARN만 남는 상황에서 `bash scripts/scan_guardrails.sh --strict` 실행 → 종료 코드 1 확인
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - line-based 검사 특성상 일부 오탐/미탐 가능
    → FAIL 항목은 좁은 패턴(클라이언트 LLM 호출/공개 키)만 사용, 나머지는 WARN으로 유지
  - 오탐(false positive) 가능 — WARN 수준으로만 표시 (exit code 0)
- Roll-back: `git revert <commit>` 한 줄 (스크립트 파일 삭제)

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/scan_guardrails.sh`

## Gate Results (Codex fills)

- Lint: N/A
- Build: N/A
- Script checks: PASS (`bash scripts/scan_guardrails.sh`, `bash scripts/scan_guardrails.sh --strict`)

Manual verification notes:
- 스크립트가 WARN/FAIL을 분리 출력하고 `--strict`에서 WARN도 실패로 처리함을 확인.
- `NEXT_PUBLIC_ROLE_TRUST_TOKEN`, `NEXT_PUBLIC_MCP_CAPABILITY_TOKEN`은 allowlist WARN으로 처리되고, 비허용 `NEXT_PUBLIC_*KEY|SECRET|TOKEN`은 FAIL로 유지됨.
