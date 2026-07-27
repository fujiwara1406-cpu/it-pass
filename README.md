# ITパスポート 一問一答クイズ

ITパスポートの勉強用 Web アプリ。問題を登録してクイズ形式で繰り返し解けます。AI で問題案も作れます。

| 項目 | 内容 |
|------|------|
| 技術 | HTML / CSS / JavaScript / Supabase / Netlify Functions |
| コード | `app/` |
| 仕様 | `docs/APP_SPEC.md` |
| 今やること | `docs/TASK.md` |

---

## フォルダ構成

```
it-pass/
├── app/                 … アプリ本体（HTML / CSS / JS）
├── data/                … CSVサンプル、Supabase用SQL
├── docs/                … 仕様・手順・履歴
├── netlify/functions/   … AI問題生成 API
├── scripts/             … ローカル補助スクリプト
└── netlify.toml         … Netlify 設定
```

---

## ローカル起動

```bash
cd app
python3 -m http.server 8000
```

→ http://localhost:8000

事前に `app/js/config.example.js` を `config.js` にコピーし、Supabase の **Legacy anon** キー（`eyJ...`）を入れてください。

---

## 面接デモ（約1分）

1. **登録** … 問題を1問追加する  
2. **AI生成** … キーワード入力 →（自動生成 or プロンプトコピー）→ 一括登録  
3. **クイズ** … 解いてスコアが動くことを見せる  

---

## 公開URL

https://fujiwara1406-cpu.github.io/it-pass/

- 公開先: GitHub Pages（`app/`）
- DB不通時はブラウザのローカル保存に自動切替（サンプル問題つき）
- AI自動生成（Netlify Functions）は任意。手動のプロンプトコピーは公開版でも可

Functions 付きは `docs/DEPLOY.md` の方法A。
