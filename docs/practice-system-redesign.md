# Practice System Redesign Report

CodeBridge の練習問題を「模範解答の再現」から「正しく動くプログラムを書く学習」へ再設計した記録です。

---

## 変更した採点方式

| 以前 | 現在 |
|------|------|
| 「実行して答え合わせ」で実行＝採点＝挑戦回数 | **実行**と**提出**を分離 |
| 単一実行＋`expectedOutputIncludes` | **テストケース方式**（複数入力・期待出力） |
| 命令不足でも成功扱い（別の書き方） | テスト全通で得点。命令は**必須要件表示**（満点判定はテスト中心） |
| 差分＝暗黙の正解圧力 | 差分は**学習用のみ**（採点外） |

### 採点順位

1. コンパイル成功  
2. 実行成功  
3. 期待する出力（各テストケース）  
4. 問題ごとの必須要件（学習目標の命令 — UI 表示）  
5. 模範解答との違い（学習用・採点しない）

### 得点

`score = round(passed / total * 100)`  

例: 7 / 9 Passed → **78点** / 9 / 9 → **100点**（クリア）

挑戦回数は**提出回数のみ**加算。実行は何度でも無料。

---

## 変更した UI

- ボタン: `▶ 実行` / `提出して採点`
- 実行: コンパイル・実行・入力・エラー確認のみ
- 提出後: 採点結果パネル（点数・Passed 数・コンパイル/実行/期待出力/必須要件）
- 「答えを見る」→「おすすめの書き方を見る」
- 「模範解答と比較」→「模範解答との違い」
- 比較モーダル上部に学習用の説明文を追加
- 提出記録: 提出回数・最高得点

---

## 追加したデータ構造

### `practice.outputPolicy`

- `flexible`（既定）… 全角数字を半角に正規化して比較  
- `strict` … 問題文で半角指定などがある場合  
- `exact` … 全文一致（末尾改行等は正規化）

### `practice.testCases[]`

```js
{
  label: "偶数(4)",
  stdin: "4",
  expectedOutput: { includes: ["偶数"], oneOf?: [...] }
}
```

未指定時は `stdinExamples`（success）と `expectedOutput` / `expectedOutputIncludes` から自動生成。

### 進捗 `bestScore`

`codebridge-progress-v1` の各サンプルに `bestScore`（0–100）を追加（後方互換）。

---

## 変更ファイル

| ファイル | 内容 |
|----------|------|
| `frontend/src/lib/practice.js` | テストケース解決・提出採点・日本語エラー説明 |
| `frontend/src/lib/outputMatch.js` | 出力ポリシー比較（新規） |
| `frontend/src/lib/codeDiff.js` | 空行・空白無視の LCS 比較 |
| `frontend/src/lib/progress.js` | 提出時のみ加算 + bestScore |
| `frontend/src/hooks/useLearningProgress.js` | score 引数対応 |
| `frontend/src/components/PracticePanel.jsx` | 実行/提出 UI・採点結果 |
| `frontend/src/components/CodeDiffViewer.jsx` | 見出し・学習用注記 |
| `frontend/src/App.css` | 採点パネル・提出ボタン样式 |
| `shared/samplePractice.js` | testCases / outputPolicy |
| `shared/sampleManager.js` | practice スキーマ拡張 |
| `shared/samples.js` | even-odd など読みやすい空行 |
| `test-practice.mjs` / `test-code-diff.mjs` / `test-regression.mjs` | 新仕様テスト |
| `docs/practice-system-redesign.md` | 本レポート |
| `docs/demo.md` | 文言更新 |

---

## 互換性

- 日本語 / C 回答、ヒント、解説、進捗、ロードマップは維持
- `expectedOutputIncludes` / `evaluatePractice` は後方互換のため残存
- 既存の localStorage 進捗は読み込み可能（`bestScore` 欠落時は 0）
- クリア条件: **提出で 100点**（全テストケース合格）

---

## 既知の制限

- 乱数問題（じゃんけん・おみくじ）は CPU 手が固定できないため、構造・ラベル中心のテストケース
- `flexible` は数字の全角半角を揃えるが、文言の言い換えまでは許容しない
- 比較の空白正規化は行単位のため、文字列リテラル内スペースも潰して同一視することがある
- 提出時はテストケース数だけ `/run` を呼ぶため、件数が多いと待ち時間が増える
- Windows 環境で日本語 stdin の実行検証が稀に揺れる場合がある（gcc/コンソール）

---

## 今後拡張できるポイント

1. 乱数問題向けに `srand` 固定シードや「手を2入力」する採点専用モード  
2. テストケースの重み付け・部分点の詳細表示  
3. 提出履歴（各回の点数）の永続化  
4. 期待出力の正規表現 / 数値誤差許容  
5. 必須要件を「ボーナス」と「必須ゲート」に分離  

---

## 設計方針（再掲）

CodeBridge は初心者向け学習アプリです。  
**同じ結果なら書き方は人によって違ってよい**ことを採点の中心に置き、  
模範解答は「唯一の正解」ではなく「おすすめの書き方」として扱います。
