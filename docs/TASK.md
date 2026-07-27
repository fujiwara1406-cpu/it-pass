# 今やること

> **完成:** コア（CRUD＋クイズ）＋ AI生成 ＋ 公開URL  
> 仕様: `docs/APP_SPEC.md`  
> URL: https://fujiwara1406-cpu.github.io/it-pass/

---

## 完了済み

- [x] 登録 / 編集 / 削除 / 一覧
- [x] クイズ・スコア
- [x] AI生成タブ（プロンプトコピー / JSON一括登録 / 自動生成ボタン）
- [x] Netlify Function 実装（任意・要 `OPENAI_API_KEY`）
- [x] GitHub Pages 公開
- [x] Supabase 不通時は localStorage に自動切替（サンプル5問）

---

## 任意（あとででOK）

1. 新しい Supabase プロジェクトを作り、`app/js/config.js` に Legacy anon キーを入れる
2. Netlify にルートを接続して AI 自動生成を有効化（`OPENAI_API_KEY`）
