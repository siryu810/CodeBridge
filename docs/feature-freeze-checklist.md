# CodeBridge Feature Freeze Checklist

自動確認済みは `[x]`、画面・ブラウザ操作が必要なものは `[ ]` のままです。  
手動手順: [manual-qa-guide.md](manual-qa-guide.md) / 既知の制限: [known-limitations.md](known-limitations.md)

最終更新: `npm run freeze:check` Failed: 0 / Warnings: 3 / Manual checks: 92（ブラウザ手動確認は未実施）

---

## IDE基本機能

- [x] 日本語 → C言語変換
  - 自動確認: test-convert.mjs / test-regression.mjs
- [x] C言語 → 日本語変換
  - 自動確認: test-convert.mjs / test-regression.mjs
- [x] Cコード実行
  - 自動確認: validate-samples.mjs（runPrograms）/ test-run.mjs
- [x] 標準入力
  - 自動確認: validate-samples.mjs（stdinExamples 付き実行）
- [x] コンパイルエラー表示
  - 自動確認: test-run.mjs（空コード → compile_error + messageJa）
- [ ] 実行時エラー表示
  - 手動確認が必要（UIパネル表示）
- [x] 日本語エラー案内
  - 自動確認: test-run.mjs（messageJa 検証）
- [ ] Monaco Editor表示
  - 手動確認が必要
- [ ] 日本語コードの構文ハイライト
  - 手動確認が必要（言語登録は test-monaco-lang.mjs）
- [ ] C言語コードの構文ハイライト
  - 手動確認が必要
- [ ] 括弧自動補完
  - 手動確認が必要（editorAssist 単体は test-editor-assist.mjs）
- [ ] 自動インデント
  - 手動確認が必要
- [ ] Undo / Redo
  - 手動確認が必要
- [ ] エディタ内検索
  - 手動確認が必要
- [ ] エラーマーカー表示
  - 手動確認が必要

## 学習機能

- [ ] サンプル24件が表示される
  - 手動確認が必要（件数スキーマは validate-samples）
- [x] サンプル24件が実行できる
  - 自動確認: validate-samples.mjs 24/24 Passed
- [ ] 学習モードが開く
  - 手動確認が必要
- [ ] 練習問題が表示される
  - 手動確認が必要
- [ ] ヒントが表示される
  - 手動確認が必要
- [x] 日本語回答を判定できる
  - 自動確認: test-practice.mjs
- [x] C言語回答を判定できる
  - 自動確認: test-practice.mjs
- [ ] 模範解答を表示できる
  - 手動確認が必要（解答取得ロジックは test-practice.mjs）
- [ ] コード比較が表示される
  - 手動確認が必要
- [x] 差分表示が壊れていない
  - 自動確認: test-code-diff.mjs
- [ ] 初心者向け解説が表示される
  - 手動確認が必要
- [ ] 学習進捗が保存される
  - 手動確認が必要（localStorage 実装あり）
- [ ] ページ再読込後も進捗が残る
  - 手動確認が必要
- [ ] カテゴリ進捗が反映される
  - 手動確認が必要（章進捗計算は test-roadmap.mjs）
- [ ] ロードマップが表示される
  - 手動確認が必要
- [x] 章の解放条件が動作する
  - 自動確認: test-roadmap.mjs
- [ ] 次に学ぶ項目が表示される
  - 手動確認が必要
- [ ] 続きから学習できる
  - 手動確認が必要

## UI・操作性

- [ ] ホーム画面が崩れていない
  - 手動確認が必要
- [ ] IDE画面が崩れていない
  - 手動確認が必要
- [ ] 練習画面が崩れていない
  - 手動確認が必要
- [ ] プレビュー表示・非表示が動く
  - 手動確認が必要
- [ ] エディタとプレビューのリサイズが動く
  - 手動確認が必要
- [ ] コンソールが見切れない
  - 手動確認が必要
- [ ] 長いコードでもスクロールできる
  - 手動確認が必要
- [ ] 小さい画面でも主要操作が可能
  - 手動確認が必要
- [ ] ボタンの文字が見切れない
  - 手動確認が必要
- [ ] 押せないボタンがない
  - 手動確認が必要
- [ ] 白画面にならない
  - 手動確認が必要
- [ ] Error Boundaryのフォールバックが表示される
  - 手動確認が必要（境界クラス存在は test-monaco-offline.mjs）
- [ ] textareaフォールバックが利用できる
  - 手動確認が必要

## オフライン・起動

- [x] npm install が成功する
  - 自動確認: 依存インストール済み環境で check / freeze:check 実行可
- [ ] npm run dev が成功する
  - 手動確認が必要（開発サーバー起動・ブラウザ表示）
- [x] npm run build が成功する
  - 自動確認: npm run build / npm run check
- [x] npm start 相当の起動が成功する
  - 自動確認: server.js + GET /health（freeze 時に起動確認）
- [x] /health が200を返す
  - 自動確認: Express GET /health → 200
- [x] Monacoがローカル資産から読み込まれる
  - 自動確認: test-monaco-offline.mjs（loader.config / worker ローカル）
- [x] CDN依存検査が通る
  - 自動確認: test-monaco-offline.mjs
- [ ] DevTools Offlineで再読込できる
  - 手動確認が必要
- [ ] OfflineでもMonacoが表示される
  - 手動確認が必要
- [ ] Offlineでも変換機能が動く
  - 手動確認が必要
- [ ] Express起動中ならOfflineでもC実行できる
  - 手動確認が必要

## 品質・提出準備

- [x] npm run check が成功する
  - 自動確認: npm run check
- [x] npm run final:check が成功する
  - 自動確認: npm run final:check
- [x] Failedが0件
  - 自動確認: check / final:check / freeze:check
- [x] サンプル24/24 Passed
  - 自動確認: validate-samples.mjs
- [x] ロードマップ検証成功
  - 自動確認: test-roadmap.mjs
- [x] READMEリンク検証成功
  - 自動確認: final:check README リンク確認
- [x] docsリンク検証成功
  - 自動確認: final:check docs ファイル存在確認
- [x] READMEの起動手順が正しい
  - 自動確認: README に npm install / npm run dev / npm start 記載
- [x] バージョン表示が正しい
  - 自動確認: package.json / frontend / App.jsx / README = 0.9.0-rc.1
- [x] 既知の制限がREADMEまたはdocsに記載されている
  - 自動確認: docs/known-limitations.md + README リンク
- [x] Gitの変更内容を確認した
  - 自動確認: git status（freeze:check Warning 表示）
- [x] 未追跡ファイルを確認した
  - 自動確認: git status --porcelain（freeze:check）
- [x] スクリーンショット配置状況を確認した
  - 自動確認: docs/images は README + .gitkeep のみ（実PNG未配置＝既知制限）

## 代表デモ

対象：

1. はじめての表示
2. 入力と表示
3. 偶数・奇数判定
4. じゃんけん

各サンプルについて（いずれもブラウザ手動確認）:

### 1. はじめての表示

- [ ] サンプルを開ける
  - 手動確認が必要
- [ ] 日本語 → C言語変換
  - 手動確認が必要（変換エンジン自体は自動確認済み）
- [ ] C言語 → 日本語変換
  - 手動確認が必要
- [ ] 実行成功
  - 手動確認が必要（エンジン実行は validate-samples）
- [ ] 標準入力成功
  - 手動確認が必要（該当時）
- [ ] 期待出力一致
  - 手動確認が必要（エンジンは validate-samples）
- [ ] 練習モードを開ける
  - 手動確認が必要
- [ ] 日本語回答で正解
  - 手動確認が必要
- [ ] C言語回答で正解
  - 手動確認が必要
- [ ] 模範解答表示
  - 手動確認が必要
- [ ] コード比較表示
  - 手動確認が必要
- [ ] 進捗反映
  - 手動確認が必要
- [ ] ロードマップ反映
  - 手動確認が必要

### 2. 入力と表示

- [ ] サンプルを開ける
  - 手動確認が必要
- [ ] 日本語 → C言語変換
  - 手動確認が必要
- [ ] C言語 → 日本語変換
  - 手動確認が必要
- [ ] 実行成功
  - 手動確認が必要
- [ ] 標準入力成功
  - 手動確認が必要
- [ ] 期待出力一致
  - 手動確認が必要
- [ ] 練習モードを開ける
  - 手動確認が必要
- [ ] 日本語回答で正解
  - 手動確認が必要
- [ ] C言語回答で正解
  - 手動確認が必要
- [ ] 模範解答表示
  - 手動確認が必要
- [ ] コード比較表示
  - 手動確認が必要
- [ ] 進捗反映
  - 手動確認が必要
- [ ] ロードマップ反映
  - 手動確認が必要

### 3. 偶数・奇数判定

- [ ] サンプルを開ける
  - 手動確認が必要
- [ ] 日本語 → C言語変換
  - 手動確認が必要
- [ ] C言語 → 日本語変換
  - 手動確認が必要
- [ ] 実行成功
  - 手動確認が必要
- [ ] 標準入力成功
  - 手動確認が必要
- [ ] 期待出力一致
  - 手動確認が必要
- [ ] 練習モードを開ける
  - 手動確認が必要
- [ ] 日本語回答で正解
  - 手動確認が必要
- [ ] C言語回答で正解
  - 手動確認が必要
- [ ] 模範解答表示
  - 手動確認が必要
- [ ] コード比較表示
  - 手動確認が必要
- [ ] 進捗反映
  - 手動確認が必要
- [ ] ロードマップ反映
  - 手動確認が必要

### 4. じゃんけん

- [ ] サンプルを開ける
  - 手動確認が必要
- [ ] 日本語 → C言語変換
  - 手動確認が必要
- [ ] C言語 → 日本語変換
  - 手動確認が必要
- [ ] 実行成功
  - 手動確認が必要
- [ ] 標準入力成功
  - 手動確認が必要
- [ ] 期待出力一致
  - 手動確認が必要
- [ ] 練習モードを開ける
  - 手動確認が必要
- [ ] 日本語回答で正解
  - 手動確認が必要
- [ ] C言語回答で正解
  - 手動確認が必要
- [ ] 模範解答表示
  - 手動確認が必要
- [ ] コード比較表示
  - 手動確認が必要
- [ ] 進捗反映
  - 手動確認が必要
- [ ] ロードマップ反映
  - 手動確認が必要

---

## 集計メモ（自動更新の目安）

| 区分 | 備考 |
|------|------|
| 自動確認済み | IDE・変換・実行・練習判定・品質スクリプト系 |
| 手動未確認 | UI・ハイライト・Offline DevTools・代表4デモ全項目 |
| Feature Freeze | 手動の Critical/Major と代表デモ・Offline 完了後に判定 |
