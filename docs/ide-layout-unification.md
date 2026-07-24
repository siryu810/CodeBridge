# IDE Layout Unification Report

CodeBridge は「どこでコードを書いても同じ IDE」を基本設計とします。  
新規作成・サンプル・練習・学習は、すべて同一の IDE 骨格を使います。

---

## 共通化したコンポーネント

| コンポーネント | 役割 |
|----------------|------|
| `IdeLayout` | IDE 全体骨格（ツールバー / ワークスペース / Bottom Panel / サイド） |
| `IdeWorkspaceSplit` | 日本語エディタ ↔ 変換プレビュー |
| `IdeBottomPanel` | 実行結果・入力（高さ変更 / 折りたたみ / 最大化） |
| `IdeSideRail` + `IdeSlidePanel` | 右サイド（練習・学習・対応表・エラー） |
| `EditorView` | 上記を組み立てる唯一のエディタ画面 |

**分岐してよいもの**

- エディタに載せるコード（新規テンプレ / サンプル）
- 右サイドの中身（練習はサンプル時のみ、など）

**分岐してはいけないもの**

- Bottom Panel の有無
- 実行結果・入力の UI
- 高さ変更・折りたたみ・最大化

---

## 変更ファイル

- `frontend/src/components/IdeLayout.jsx`（新規）
- `frontend/src/components/EditorView.jsx`（IdeLayout 利用・Bottom Panel 常時）
- `frontend/src/App.jsx`（EditorView に key を付与しモード切替を明確化）
- `frontend/src/App.css`（旧コンソール用スタイル削除）
- `test-regression.mjs`
- `docs/ide-layout-unification.md`（本レポート）

---

## 削除した旧 UI

| 削除ファイル | 内容 |
|--------------|------|
| `RunResultPanel.jsx` | 「③ コンソール」旧パネル |
| `RuntimeInput.jsx` | 下部埋め込みの旧実行時入力 |
| `JapaneseErrorPanel.jsx` | 未使用の旧エラーパネル |

（レガシー `top.html` は React IDE 外の旧資産として残置。開発は Vite `http://localhost:5173` を使用）

---

## 全画面で共通になった機能

- 実行結果 / 入力の Bottom Panel
- ドラッグによる高さ変更
- 折りたたみ / 最大化 / 閉じる（実行で再表示）
- stdout 表示（入力と出力の色分け）
- 入力の保存・クリア
- エディタ ↔ プレビュー分割
- 右サイドの学習・対応表・エラー
- ▶ 実行 → 同じ `/run` パイプライン

新規作成に入ったときも Bottom Panel を開いた状態で開始します。

---

## 補足

練習パネル内の「提出採点ログ」は練習専用の採点 UI であり、IDE Bottom Panel とは役割が異なります。  
メインの「▶ 実行」は常に共通 Bottom Panel を使います。
