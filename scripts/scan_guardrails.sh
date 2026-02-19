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
  WARN=$((WARN + 1))
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
  WARN=$((WARN + 1))
else
  echo "  [PASS] 오버레이 pointer-events 설정 확인됨"
fi
echo ""

# 4. NEXT_PUBLIC_ 접두사로 비밀 키 노출 위험
echo "[4] NEXT_PUBLIC_ API 키 노출 위험 검사..."
PUBLIC_SECRET_CANDIDATES=$(rg -n \
  -e "NEXT_PUBLIC_.*KEY" \
  -e "NEXT_PUBLIC_.*SECRET" \
  -e "NEXT_PUBLIC_.*TOKEN" \
  "$ROOT" -g '*.ts' -g '*.tsx' -g '.env*' -g '!.next' -g '!node_modules' || true)
PUBLIC_SECRETS=$(printf "%s\n" "$PUBLIC_SECRET_CANDIDATES" | rg -v \
  -e "NEXT_PUBLIC_ROLE_TRUST_TOKEN" \
  -e "NEXT_PUBLIC_MCP_CAPABILITY_TOKEN" || true)
if [ -n "$PUBLIC_SECRETS" ]; then
  echo "  [FAIL] NEXT_PUBLIC_ 접두사 비밀 키 발견:"
  echo "$PUBLIC_SECRETS" | head -10
  FAIL=1
elif [ -n "$PUBLIC_SECRET_CANDIDATES" ]; then
  echo "  [WARN] 허용된 공개 토큰만 발견됨 (allowlist):"
  echo "$PUBLIC_SECRET_CANDIDATES" | head -10
  WARN=$((WARN + 1))
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
