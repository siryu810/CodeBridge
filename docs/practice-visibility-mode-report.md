# Practice Visibility Mode Report

## 追加したモード

練習パネル上部に切り替えを追加しました。

| モード ID | UI ラベル | 初期値 |
|-----------|-----------|--------|
| `guided` | 見ながら練習 | はい（問題切替時も） |
| `blind` | 見ないで挑戦 | — |

## 変更した UI

- 練習モード上部の「見ながら練習 / 見ないで挑戦」トグル
- 「答え」「模範解答」表現をやめ、「参考コード」「参考コードとの違い」へ統一
- 「見ないで挑戦」時のみ「参考コードを見る / 隠す」を表示
- 比較モーダルのタイトル・説明文を学習用の比較に合わせて更新

## 「参考コード」の仕様

- 「見ないで挑戦」中のみトグル表示
- 押すと表示、もう一度で非表示
- 回答欄のコードは上書きしない（別パネルに表示）
- 挑戦回数・提出回数は増やさない
- `recordReferenceViewed(sampleId)` で `meta.extensions.referenceViews` に学習ログを保存可能（将来拡張用）

## 比較画面の変更

- タイトル: 「参考コードとの違い」
- 説明: 「正しく動けば書き方は人それぞれです。この比較は参考コードとの違いを学ぶためのものです。」
- 採点には使わない（従来どおり学習用）

## レイアウト変更

- 「見ないで挑戦」で C 言語変換パネルを非表示（`hidePreview`）し、エディタ領域を拡大
- 同モードではメインのサンプルコードをマスクし、答えが常時見えないようにした
- 「見ながら練習」に戻すと変換パネルを再表示し、マスクを解除
- 既存の IDE レイアウト（Bottom Panel / 右サイドパネル）は維持

## 状態保持

- モードは問題を切り替えるまで保持（回答コード・実行結果・入力もモード切替では消えない）
- 新しい問題では「見ながら練習」にリセット
- リロード後の保持は未実装（任意要件）

## 変更ファイル

- `frontend/src/components/PracticePanel.jsx`
- `frontend/src/components/EditorView.jsx`
- `frontend/src/components/CodeDiffViewer.jsx`
- `frontend/src/lib/practice.js`
- `frontend/src/lib/practiceLanguage.js`
- `frontend/src/lib/codeDiff.js`
- `frontend/src/lib/progress.js`（`recordReferenceViewed`）
- `frontend/src/App.css`
- `shared/samplePractice.js`
- `test-regression.mjs`
- `docs/practice-visibility-mode-report.md`

## テスト結果

`node test-regression.mjs` — **32 成功 / 0 失敗**

確認項目（実装・回帰テスト上）:

1. 見ながら練習 — 変換パネル表示・サンプル可視（デフォルト）
2. 見ないで挑戦 — 変換パネル非表示 + サンプルマスク
3. 「参考コードを見る」で表示・非表示切替（挑戦回数に含めない）
4. モード切替で回答コードは消えない（`activeSample.id` 変更時のみリセット）
5. 実行結果・入力はモード切替で保持
6. 提出・採点は両モード共通ハンドラ
7. 「参考コードとの比較」は提出後も利用可能
8. 新規作成は練習パネル非表示のため影響なし

## 既知の制限

- リロード後にモードは復元されない（常に見ながら練習から開始）
- 「見ないで挑戦」中でもツールバーから変換結果を手動表示できる
- 参考コード閲覧ログは保存のみで、UI 上の進捗表示にはまだ使っていない
- 新規作成画面には練習パネルが無いため影響なし
