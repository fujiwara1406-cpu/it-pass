# ネット公開の手順

**推奨:** リポジトリルート（`netlify.toml` がある場所）を Netlify にデプロイする。  
AI 自動生成（Functions）まで使うため。

---

## ゴール

- ブラウザから誰でも見られる URL を取得する
- （任意）AI 自動生成が動く

---

## 方法A: Functions 付きデプロイ（推奨・コア＋AI）

GitHub 連携、または Netlify CLI。

### GitHub 連携

1. [Netlify](https://app.netlify.com/) で **Add new site → Import an existing project**
2. このリポジトリ `it-pass` を選ぶ
3. Build settings は `netlify.toml` をそのまま使う  
   - Publish directory: `app`  
   - Functions directory: `netlify/functions`
4. Site settings → Environment variables に `OPENAI_API_KEY` を追加
5. Deploy 後の URL を README / APP_SPEC に記入

### Netlify CLI

```bash
# 初回のみ
npm install -g netlify-cli
netlify login
netlify init   # または既存サイトにリンク

# 本番公開
netlify deploy --prod
```

環境変数:

```bash
netlify env:set OPENAI_API_KEY "sk-..."
```

> `app/js/config.js` は Git 除外のため、Netlify に載せるには次のいずれかが必要です。  
> - デプロイ前にローカルの `app/js/config.js` を含めて `netlify deploy --prod`（CLI はローカルファイルを使う）  
> - または Netlify のビルドで config を生成する（発展）

---

## 方法B: Netlify Drop（フロントのみ・いちばん簡単）

GitHub も CLI も不要。フォルダをドラッグするだけ。  
**AI 自動生成ボタンは動きません**（手動のプロンプトコピー → JSON 一括登録は可）。

### 手順

1. [https://app.netlify.com/drop](https://app.netlify.com/drop) を開く
2. Finder で `app` フォルダを開く
3. **`app` フォルダごと** ブラウザの Drop エリアにドラッグ＆ドロップ
4. 数秒で URL が発行される（例: `https://random-name.netlify.app`）
5. その URL をブラウザで開いて動作確認

---

## 方法C: Vercel（フロントのみ）

```bash
cd app
npx vercel
```

Functions（AI自動生成）は Netlify 側の構成を想定しています。

---

## 公開前チェックリスト

- [ ] `app/js/config.js` が存在する（Supabase 接続用・Legacy anon `eyJ...`）
- [ ] ローカルで `http://localhost:8000` が動く
- [ ] Supabase で権限 SQL を実行済み（データが読めないとき）
- [ ] 登録・編集・削除・クイズが動く
- [ ] AI タブで JSON 一括登録ができる
- [ ] （Functions デプロイ時）`OPENAI_API_KEY` を設定済み

---

## 公開後にデータが読めないとき

### 1. API キーを確認

Supabase → **Settings → API Keys** → **Legacy anon** タブ

`eyJ...` で始まる **anon** キーを `app/js/config.js` に入れて、**再デプロイ**

### 2. RLS を確認

Supabase の **SQL Editor** で `data/supabase_fix.sql` を実行

---

## 更新したとき

1. ファイルを直す
2. Netlify で再デプロイ（Git push または `netlify deploy --prod`、Drop なら再ドロップ）
3. `docs/HISTORY.md` に更新内容を1行メモ
4. `README.md` の公開URLを更新

---

## GitHub について

- Functions 付き公開では便利
- `config.js` は GitHub に上げない（`.gitignore` 済み）
