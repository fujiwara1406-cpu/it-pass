# 今やること（完成モード：今日・明日）

> **ゴール:** コア（CRUD＋クイズ）＋ AI生成 が動く公開URL  
> 仕様: `docs/APP_SPEC.md`

---

## 今日（Day 1）

### TASK-D1a: Supabase 接続を直す

1. Supabase → Settings → API Keys → **Legacy anon**（`eyJ...`）をコピー
2. `app/js/config.js` の `SUPABASE_ANON_KEY` を差し替え（Git に上げない）
3. 必要なら SQL Editor で `data/supabase_fix.sql` を実行
4. `cd app && python3 -m http.server 8000` → http://localhost:8000 で登録・一覧・クイズを確認

**状態:** ⬜ キー差し替えは手元作業（Publishable キーのときは画面に警告が出る）

---

### TASK-D1b: AIタブ（手動ルート）

- [x] 「AI生成」タブ追加
- [x] プロンプトコピー
- [x] JSON 一括登録

**状態:** ✅ 実装済み

---

## 明日（Day 2）

### TASK-D2a: 自動生成 Function

- [x] `netlify.toml`
- [x] `netlify/functions/generate-questions.js`
- [x] フロントから呼び出し（失敗時は手動フォールバック）

**状態:** ✅ 実装済み（本番では `OPENAI_API_KEY` が必要）

---

### TASK-D2b: 本番公開

1. `scripts/prepare_drop.sh` で zip 作成済み（`dist/app-drop.zip`）
2. [Netlify Drop](https://app.netlify.com/drop) にドロップ（フロント公開）
3. Functions 付きはリポジトリルートを Netlify に接続 + `OPENAI_API_KEY`
4. 公開URLを README / APP_SPEC に記入
5. チェック: 登録・編集・削除 / クイズ / AI手動 / AI自動 / スマホスワイプ

詳細: `docs/DEPLOY.md`

**状態:** 🟨 公開パッケージ準備済み（アカウントでのドロップ／接続は手元）

---

## 第1周学習タスク（完成後に戻す場合）

以前の HTML 公開学習用タスクは、アプリ完成後に再開してよい。
