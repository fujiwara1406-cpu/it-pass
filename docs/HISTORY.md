# 作業履歴

ITパスポート 一問一答クイズの判断・作業・変更を時系列で記録します。

---

## 2026-07-27（公開完了：GitHub Pages + ローカル保存）

- Supabase プロジェクト不通（NXDOMAIN）のため、localStorage フォールバックを追加
- サンプル5問を初回自動投入
- GitHub Pages で `app/` を公開
- 公開URL: https://fujiwara1406-cpu.github.io/it-pass/

---

## 2026-07-27（コア＋AI 完成モード着手）

- AI生成タブ追加（プロンプトコピー / JSON一括登録 / 自動生成ボタン）
- `netlify.toml` と `netlify/functions/generate-questions.js` を追加
- `scripts/generate_questions.py` / `scripts/prepare_drop.sh` を追加
- `data/ai_questions_sample.json` を追加
- Publishable キー利用時の警告を画面に表示
- TASK / APP_SPEC / DEPLOY / README を完成モードに更新
- Drop 用 zip: `scripts/prepare_drop.sh` → `dist/app-drop.zip`
- 残（手元）: Legacy anon キー差し替え、Netlify 本番公開、`OPENAI_API_KEY`、公開URL記入

---

## 2026-07-22（`.cursor` の見本を追加）

- `.cursor/skills/demo-yougo-memo/` … 「用語メモして」で LEARNING に1行足す見本スキル
- `.cursor/rules/demo-みえる.mdc` … 返事の先頭に印が付く見本（破壊なし）
- `.cursor/hooks/` … チャット開始で `はじまりログ.txt` に1行足す見本
- 説明: `.cursor/はじまりログ.txt` 冒頭
- （学習用）`week1-html-only.mdc` も継続

---

## 2026-07-22（学習方針の組み直し）

- `docs/STUDY_PLAN.md` を「内側積み上げ」から **外側からAIで殴る** に変更
- **第1周:** Cursor → Git → HTML → 公開（この間 CSS / JS は使わない・知らせない）
- **第2周:** データベース
- `docs/CODING.md` / `LEARNING.md` も同ノリに合わせて更新

---

## 2026-07-22（フォルダ統合）

- `itpass-quiz` を **`it-pass`** にリネーム
- 旧 `ポートフォリオ作成/` を削除（中身はスタブのみ、本番コードは it-pass に統合済み）

---

## 2026-07-21（ドキュメント整理）

- ドキュメントをアプリ開発用に整理（不要ファイル削除）

---

## 2026-07-21（AI問題生成 + 操作UI改善）

### 追加

- **AI生成タブ** … 過去問・キーワードを参考にオリジナル問題を作成・一括登録
- `scripts/generate_questions.py` … ローカル用バッチ生成
- `netlify/functions/generate-questions.js` … Netlify 公開時の自動生成
- クイズ: 選択肢を十字レイアウト（↑←↓→ = A/B/C/D）
- PC: 十字キー / スマホ: スワイプで回答

---

## 2026-07-21（アプリ作成再開）

- 本体は実装済み。DB接続（APIキー・権限）の修正が残っていた
- 次: TASK-09a 接続確認 → TASK-09b ネット公開

---

## 2026-07-16（クイズ操作: スワイプ + キーボード）

- キー `W/A/S/D` と矢印キーで四択回答
- スワイプ（↑←↓→）で四択回答
- 回答後は `Enter` / スペースで次の問題へ

---

## 2026-07-16（スマホ対応）

- タップ領域 48px 以上、入力 16px（iOS ズーム防止）
- safe-area 対応、長文折り返し

---

## 2026-07-14（デプロイ手順）

- `docs/DEPLOY.md` を `app/` 向けに更新
- 公開方法: Netlify Drop

---

## 2026-07-14（アプリ改善）

- 問題編集（Update）で CRUD 完成
- クイズ: 連続同題回避、正答率、スコアリセット
- 読み込み中・編集モードの UI 改善

---

## 2026-07-14（アプリ本体完成）

- HTML / CSS / JavaScript + Supabase 連携
- 一覧・登録・削除・クイズ・スコア
- `app/js/config.js` に API 情報（Git 除外）
- RLS 用 SQL: `data/supabase_rls.sql`

---

## 2026-07-12（アプリ確定）

- **ITパスポート 一問一答クイズ** に決定
- DB: Supabase（PostgreSQL）
- 仕様: `docs/APP_SPEC.md`
- TASK-01: テーブル作成 + サンプル5問投入

---

## 2026-07-12（方針決定）

- ポートフォリオサイトは作らず、**小さな動く Web アプリ1点** に集中
- 技術: HTML / CSS / JavaScript + Supabase
- コードは `app/` に配置

---

<!-- 以降、作業のたびに上に追記（新しい日付を上に） -->
