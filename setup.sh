#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/prototype"

REQUIRED_NODE_MAJOR=22
REQUIRED_PNPM_VERSION="$(node -p "require('./package.json').packageManager.split('@')[1]" 2>/dev/null || true)"

info() { printf '\033[36m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[31m✗\033[0m %s\n' "$1" >&2; exit 1; }

info "Node.js を確認"
command -v node >/dev/null || fail "Node.js が見つかりません（v${REQUIRED_NODE_MAJOR} 以上が必要）"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge "$REQUIRED_NODE_MAJOR" ] || fail "Node.js v${REQUIRED_NODE_MAJOR} 以上が必要です（現在: $(node -v)）"
echo "    $(node -v)"

info "pnpm を確認"
if ! command -v pnpm >/dev/null; then
  command -v corepack >/dev/null || fail "pnpm も corepack も見つかりません"
  corepack enable
  corepack prepare "pnpm@${REQUIRED_PNPM_VERSION}" --activate
fi
echo "    pnpm $(pnpm -v)"

info "依存関係をインストール"
pnpm install

info "環境変数ファイルを用意"
for example in apps/*/.env.example; do
  [ -e "$example" ] || continue
  target="$(dirname "$example")/.env.local"
  if [ -e "$target" ]; then
    echo "    skip: ${target}（既に存在）"
  else
    cp "$example" "$target"
    echo "    created: ${target}"
  fi
done

info "型チェックとテスト"
pnpm check-types
pnpm test

cat <<'MSG'

セットアップ完了。

  cd prototype && pnpm dev
    web:        http://localhost:3000/profile
    api-server: http://localhost:3001

ポートが埋まっている場合は apps/web/.env.local の URL と起動ポートを合わせて変更する:
  PORT=3101 pnpm --filter @repo/api-server dev
  pnpm --filter @repo/web exec next dev -p 3100
MSG
