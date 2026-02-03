#!/usr/bin/env bash
set -euo pipefail

MSG="$*"

# 한글 트리거 분기
wait_for_idle() {
  local socket="$1"
  local target="$2"
  local idle_secs=5
  local max_secs=120
  local interval=1
  local last_hash=""
  local idle_for=0
  local elapsed=0

  while (( elapsed < max_secs )); do
    local snap
    snap=$(tmux -S "$socket" capture-pane -p -J -t "$target" -S -120)
    local hash
    hash=$(printf "%s" "$snap" | md5sum | awk '{print $1}')

    if [[ "$hash" == "$last_hash" ]]; then
      idle_for=$((idle_for + interval))
      if (( idle_for >= idle_secs )); then
        return 0
      fi
    else
      idle_for=0
      last_hash="$hash"
    fi

    sleep "$interval"
    elapsed=$((elapsed + interval))
  done
  return 1
}

if [[ "$MSG" == 제미나이:* ]]; then
  PROMPT="${MSG#제미나이:}"
  SOCKET_DIR="${OPENCLAW_TMUX_SOCKET_DIR:-${CLAWDBOT_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/openclaw-tmux-sockets}}"
  SOCKET="$SOCKET_DIR/openclaw.sock"
  tmux -S "$SOCKET" send-keys -t gemini:0.0 C-u
  tmux -S "$SOCKET" send-keys -t gemini:0.0 -l -- "$PROMPT"
  tmux -S "$SOCKET" send-keys -t gemini:0.0 Enter
  wait_for_idle "$SOCKET" "gemini:0.0" || true
  tmux -S "$SOCKET" capture-pane -p -J -t gemini:0.0 -S -300 | tail -n 200

elif [[ "$MSG" == 코덱스:* ]]; then
  PROMPT="${MSG#코덱스:}"
  SOCKET_DIR="${OPENCLAW_TMUX_SOCKET_DIR:-${CLAWDBOT_TMUX_SOCKET_DIR:-${TMPDIR:-/tmp}/openclaw-tmux-sockets}}"
  SOCKET="$SOCKET_DIR/openclaw.sock"
  tmux -S "$SOCKET" send-keys -t codex:0.0 C-u
  tmux -S "$SOCKET" send-keys -t codex:0.0 -l -- "$PROMPT"
  tmux -S "$SOCKET" send-keys -t codex:0.0 Enter
  wait_for_idle "$SOCKET" "codex:0.0" || true
  tmux -S "$SOCKET" capture-pane -p -J -t codex:0.0 -S -300 | tail -n 200

else
  echo "실행 트리거를 인식하지 못했습니다."
  echo "사용 가능한 트리거:"
  echo "- 제미나이:"
  echo "- 코덱스:"
  exit 0
fi
