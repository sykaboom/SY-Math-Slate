#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

registry_file="codex_tasks/workflow/feature_flag_registry.env"
if [[ ! -f "$registry_file" ]]; then
  echo "[check_v10_feature_flag_registry] FAIL: missing registry file: $registry_file"
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

rg -o --no-filename 'NEXT_PUBLIC_[A-Z0-9_]+' v10/src | sort -u > "$tmp_dir/used_flags.txt"
grep -E '^NEXT_PUBLIC_[A-Z0-9_]+=' "$registry_file" | cut -d= -f1 | sort -u > "$tmp_dir/registered_flags.txt"

comm -23 "$tmp_dir/used_flags.txt" "$tmp_dir/registered_flags.txt" > "$tmp_dir/unregistered.txt"
comm -13 "$tmp_dir/used_flags.txt" "$tmp_dir/registered_flags.txt" > "$tmp_dir/unused.txt"

used_count="$(wc -l < "$tmp_dir/used_flags.txt")"
registered_count="$(wc -l < "$tmp_dir/registered_flags.txt")"

printf '[check_v10_feature_flag_registry] used=%s registered=%s\n' "$used_count" "$registered_count"

if [[ -s "$tmp_dir/unregistered.txt" ]]; then
  echo "[check_v10_feature_flag_registry] FAIL: unregistered flags found"
  cat "$tmp_dir/unregistered.txt"
  exit 1
fi

if [[ -s "$tmp_dir/unused.txt" ]]; then
  echo "[check_v10_feature_flag_registry] WARN: registry contains unused flags"
  cat "$tmp_dir/unused.txt"
fi

echo "[check_v10_feature_flag_registry] PASS"
