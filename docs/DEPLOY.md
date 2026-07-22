# ネット公開の手順

**公開するフォルダ:** `app/`（この中に `index.html` がある）

---

## ゴール

- ブラウザから誰でも見られる URL を取得する

---

## 方法A: Netlify Drop（いちばん簡単）

GitHub も CLI も不要。フォルダをドラッグするだけ。

### 手順

1. [https://app.netlify.com/drop](https://app.netlify.com/drop) を開く
2. Finder で `app` フォルダを開く
3. **`app` フォルダごと** ブラウザの Drop エリアにドラッグ＆ドロップ
4. 数秒で URL が発行される（例: `https://random-name.netlify.app`）
5. その URL をブラウザで開いて動作確認

> **AI自動生成ボタン** を使う場合は、プロジェクト全体（`netlify.toml` がある `it-pass` フォルダ）を Netlify にデプロイし、環境変数 `OPENAI_API_KEY` を設定してください。Drop だけの公開でも「プロンプトをコピー → JSON 取り込み」は使えます。

---

## 方法B: Vercel

```bash
cd app
npx vercel
```

---

## 公開前チェックリスト

- [ ] `app/js/config.js` が存在する（Supabase 接続用）
- [ ] ローカルで `http://localhost:8000` が動く
- [ ] Supabase で権限 SQL を実行済み（データが読めないとき）
- [ ] 登録・編集・削除・クイズが動く

---

## 公開後にデータが読めないとき

### 1. API キーを確認

Supabase → **Settings → API Keys** → **Legacy anon** タブ

`eyJ...` で始まる **anon** キーを `app/js/config.js` に入れて、**再デプロイ**

### 2. RLS を確認

Supabase の **SQL Editor** で `data/supabase_fix.sql` の権限部分を実行

---

## 更新したとき

1. `app/` 内のファイルを直す
2. 再度 Netlify Drop で `app` フォルダをドロップ
3. `docs/HISTORY.md` に更新内容を1行メモ
4. `README.md` の公開URLを更新

---

## GitHub について

- 必須ではありません
- `config.js` は GitHub に上げない（`.gitignore` 済み）
