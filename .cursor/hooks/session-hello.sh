#!/bin/bash
# 見本hooks: チャット開始時にログへ1行追記するだけ（何も壊さない）

LOG=".cursor/はじまりログ.txt"
NOW="$(date '+%Y-%m-%d %H:%M:%S')"

{
  echo "[$NOW] チャットが始まりました"
  echo "  → これは hooks の見本です。記録を足しただけで、他のファイルは触っていません。"
  echo ""
} >> "$LOG"

# AIにも短いメモを渡す（画面のログとは別ルート）
python3 -c 'import json; print(json.dumps({"additional_context": "【見本hooks】チャット開始を .cursor/はじまりログ.txt に記録しました。破壊的な処理はしていません。"}, ensure_ascii=False))'
