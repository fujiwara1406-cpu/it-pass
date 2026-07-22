# ITパスポート 一問一答クイズ

ITパスポートの勉強用 Web アプリ。問題を登録してクイズ形式で繰り返し解けます。

| 項目 | 内容 |
|------|------|
| 技術 | HTML / CSS / JavaScript / Supabase |
| コード | `app/` |
| 仕様 | `docs/APP_SPEC.md` |
| 今やること | `docs/TASK.md` |

---

## フォルダ構成

```
it-pass/
├── app/    … アプリ本体（HTML / CSS / JS）
├── data/   … CSVサンプル、Supabase用SQL
└── docs/   … 仕様・手順・履歴
```

> **予定:** AI問題生成（`netlify/functions/`・`scripts/`）は未作成。着手時に追加します。

---

## ローカル起動

```bash
cd app
python3 -m http.server 8000
```

→ http://localhost:8000

---

## 公開URL

（未設定 → デプロイ後に README に記入）
