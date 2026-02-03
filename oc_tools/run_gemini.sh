#!/usr/bin/env bash
set -euo pipefail

cd /home/sykab/SY-Math-Slate
exec /home/sykab/.nvm/versions/node/v24.10.0/bin/gemini -m gemini-3-pro-preview "$@"
