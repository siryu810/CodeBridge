# Bottom Panel Simplification Report

下部パネルの役割を整理し、右サイド「エラー」との重複を解消した記録です。

---

## 変更内容

| 項目 | 内容 |
|------|------|
| タブ構成 | `Terminal \| Problems \| Input` → **`実行結果 \| 入力`** |
| 名称 | Terminal → **実行結果**、Input → **入力** |
| 役割分離 | 下部＝実行（結果・入力）／右サイド＝編集・学習・エラー |
| 成功時 | 下部「実行結果」を更新し、そのタブを表示 |
| エラー時 | 下部にもログを残しつつ、**右サイド「エラー」を自動で開く** |
| 入力待ち | 下部「入力」タブへフォーカス（従来どおり） |

---

## 削除したもの

- **Problems タブ**（UI・バッジ・クリック行ジャンプ導線）
- 下部パネルからの Problems 一覧表示
- タブ名「Terminal」「Input」の英名表示

※ `buildProblemEntries` は整形ライブラリに残置（将来用）。UI からは未使用。

---

## 維持したもの

- ドラッグによる高さ変更（80px〜約80%、通常約28%）
- 折りたたみ / 最大化 / 閉じる（実行で再表示）
- 高さ・開閉・タブの localStorage 保持
- 実行結果のクリア
- 入力の保存 / クリア
- stdout 表示（入力 `>` と出力の色分け、終了コード・実行時間）
- ステータス表示（実行中 / 入力待ち / 接続済み / エラー）
- Monaco エラーマーカー
- 右サイド: 練習 / 学習 / 対応表 / エラー

---

## 変更ファイル

- `frontend/src/components/IdeBottomPanel.jsx`
- `frontend/src/components/EditorView.jsx`
- `frontend/src/hooks/useBottomPanel.js`
- `frontend/src/lib/terminalFormat.js`（メッセージ文言）
- `test-regression.mjs`
- `docs/bottom-panel-simplification.md`（本レポート）
