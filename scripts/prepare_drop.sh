#!/bin/zsh
# Netlify Drop 用に app/ を zip する
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/dist"
rm -f "$ROOT/dist/app-drop.zip"
(cd "$ROOT/app" && zip -r "$ROOT/dist/app-drop.zip" . -x '*.DS_Store' -x 'html-basics.html')
echo "作成: $ROOT/dist/app-drop.zip"
echo "次: https://app.netlify.com/drop にこの zip（または app フォルダ）をドロップ"
