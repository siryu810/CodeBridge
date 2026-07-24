# Terminal UX Report

CodeBridge の実行コンソールを、細い固定コンソールから **IDE Bottom Panel** へ刷新した記録です。

本物の OS ターミナルをブラウザに埋め込んだのではなく、VS Code / Cursor に近い **学習用 IDE 実行パネル** として実装しています。

---

## 変更した UI

| 以前 | 現在 |
|------|------|
| 高さ固定・最大 ~180px の細いコンソール | ドラッグで高さ変更できる Bottom Panel |
| コンソールと入力が縦に押しつぶされる | **Terminal / Problems / Input** タブで分離 |
| エラーは主に右サイドパネル | Problems タブ（クリックで該当行へ） |
| 結果と入力の区別が弱い | Terminal で `> 入力` と出力を色分け |

パネル操作: **クリア / 折りたたみ / 最大化 / 閉じる**  
閉じても「実行」で自動再表示。高さ・開閉・タブは localStorage に保持。

---

## 追加機能

1. **リサイズ** … 最小 80px / 通常 ~28% / 最大 ~80%
2. **Terminal** … 自動スクロール、選択・コピー可、カーソル風表示、ステータス（実行中 / 入力待ち / 接続済み / エラー）
3. **終了コード・実行時間** … クライアント計測で表示
4. **Input** … 複数行・保存・クリア（Terminal と非混在）
5. **Problems** … Error / Warning / Info、行番号クリックで Monaco ジャンプ
6. **実行フロー** … パネル展開 → Terminal → 実行 → 入力待ちなら Input フォーカス → 結果表示

---

## 変更ファイル

| ファイル | 内容 |
|----------|------|
| `frontend/src/components/IdeBottomPanel.jsx` | Bottom Panel UI（新規） |
| `frontend/src/hooks/useBottomPanel.js` | 高さ・状態の永続化（新規） |
| `frontend/src/lib/terminalFormat.js` | 入出力色分け・Problems 整形（新規） |
| `frontend/src/components/EditorView.jsx` | 実行フロー連携 |
| `frontend/src/components/CodeBridgeMonaco.jsx` | `revealLine` API |
| `frontend/src/components/JapaneseEditor.jsx` | editorApiRef 受け渡し |
| `frontend/src/App.css` | Bottom Panel / Terminal スタイル |
| `test-terminal-format.mjs` | 整形ユニットテスト |
| `test-regression.mjs` / `package.json` | 回帰・test スイート更新 |
| `docs/terminal-ux-report.md` | 本レポート |

---

## 互換性

- `POST /run`（gcc・Express・stdin/stdout/stderr）は変更なし
- `runCodeOnServer` / `parseRunResponse` の契約を維持
- Monaco マーカー・変換警告・練習パネルは従来どおり
- 右サイドの「日本語エラー」レールは残置（詳細テキスト用）
- 旧 `RuntimeInput` / `RunResultPanel` は削除済み（IdeBottomPanel に統合）

---

## 残課題

- Logs タブは UI 枠のみ未実装（Terminal に統合）
- 本格 ANSI エミュレータ（xterm.js）は未導入（簡易 strip + セマンティック色）
- 対話型（実行中に逐次入力）ではなく、実行前 stdin 一括渡し
- 最大化時のアニメーションはなし

---

## 今後追加できる Terminal 機能

1. xterm.js によるリッチ表示
2. 実行中ストリーミング出力
3. コマンド履歴・再実行
4. Terminal / Problems の分割ビュー
5. 出力のダウンロード / 共有
6. テーマ切替（明るい Terminal）

---

## 設計方針

発表デモでも結果がしっかり見え、初心者が「入力」と「出力」を取り違えないことを最優先しました。
