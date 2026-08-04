# CodeBridge

日本語で C 言語を学ぶ、初学者向け学習 IDE。

**Version: `0.9.0-rc.1`**（U-22 / Public Release Candidate）  
**License: [MIT](LICENSE)**

---

## 目次

- [CodeBridge とは](#codebridge-とは)
- [特徴](#特徴)
- [画面紹介](#画面紹介)
- [使用技術](#使用技術)
- [セットアップ](#セットアップ)
- [ディレクトリ構成](#ディレクトリ構成)
- [開発背景](#開発背景)
- [今後の予定](#今後の予定)
- [品質確認](#品質確認)
- [GitHub 公開設定](#github-公開設定)
- [ライセンス](#ライセンス)

---

## CodeBridge とは

CodeBridge は、**日本語で C 言語を学ぶための初学者向け学習 IDE** です。

- 日本語でコードを書いて、C 言語として実行できる
- C 言語コードを日本語に変換して読める
- サンプル教材・練習問題・進捗・学習ロードマップで「何をどの順で学ぶか」が分かる

目的は、英語や記号への苦手意識で止まらず、**アルゴリズムの流れを理解しながら C 言語を学べる**ようにすることです。

CodeBridge は単なる翻訳ツールではなく、**正しく動くコードを書く力**を育てる学習環境として設計しています。参考コードは唯一の正解ではなく、書き方の一例として扱います。

---

## 特徴

| 機能 | 説明 |
|------|------|
| 日本語 → C 言語 変換 | 日本語で書いたコードをリアルタイムで C 言語に変換 |
| C 言語 → 日本語 変換 | 既存の C コードを日本語表記で読み解く |
| C 言語として実行 | ブラウザから gcc でコンパイル・実行（要 gcc） |
| 実行時入力 | `scanf` / `入力()` に対応した標準入力 |
| Bottom Panel | 実行結果と入力をタブで整理 |
| 日本語エラー表示 | コンパイル・実行エラーを初学者向けに説明 |
| Monaco エディタ | 構文ハイライト・括弧補完（ローカルバンドル・オフライン可） |
| 命令辞書 | 使える日本語命令の一覧と意味 |
| 学習モード | アルゴリズムの流れをステップで確認 |
| 練習モード | 見ながら練習 / 見ないで挑戦、テストケース採点 |
| 参考コードとの比較 | 学習用の差分表示（採点基準ではない） |
| 学習進捗 | クリア状況を localStorage に記録 |
| 学習ロードマップ | 9 章構成の学習コース |
| サンプル教材 24 件 | 表示から乱数まで段階的に学べる題材 |

### 使用例

**日本語コード：**

```
表示("こんにちは");
```

**C 言語変換結果：**

```c
printf("こんにちは\n");
```

---

## 画面紹介

> 画像の撮り方は **[docs/images/README.md](docs/images/README.md)** を参照してください。  
> 撮影後、下の HTML コメントを外すと README 上に表示されます。フォルダ: **[docs/images/](docs/images/)**

### ホーム画面

<!-- ![CodeBridge ホーム画面](docs/images/home.png) -->
`docs/images/home.png` — 学習進捗・次に学ぶ・ロードマップ

### IDE 画面（日本語 → C 言語）

<!-- ![IDE 日本語モード](docs/images/editor-jp-to-c.png) -->
`docs/images/editor-jp-to-c.png` — 日本語コード・変換結果・実行パネル

### 練習モード

<!-- ![練習モード](docs/images/practice-mode.png) -->
`docs/images/practice-mode.png` — 問題・ヒント・実行・提出・採点

### 参考コードとの比較

<!-- ![コード比較](docs/images/code-compare.png) -->
`docs/images/code-compare.png` — 参考コードとの差分（学習用）

### 学習ロードマップ

<!-- ![ロードマップ](docs/images/learning-roadmap.png) -->
`docs/images/learning-roadmap.png` — 章一覧と進捗

### デモ GIF（任意）

<!-- ![操作デモ](docs/images/demo.gif) -->
`docs/images/demo.gif` — 変換 → 実行 → 練習の流れ

---

## 使用技術

| 分野 | 技術 |
|------|------|
| フロントエンド | React、Vite、Monaco Editor（ローカルバンドル） |
| バックエンド | Node.js、Express |
| 実行環境 | gcc |
| データ保存 | localStorage（クラウド / Firebase は未使用） |
| 公開・管理 | GitHub |

---

## セットアップ

### 必要な環境

- [Node.js](https://nodejs.org/)（推奨: LTS）
- [gcc](https://gcc.gnu.org/)（プログラムの実行に必要。変換・学習機能は gcc なしでも利用可能）

### 1. インストール

```bash
npm install
npm install --prefix frontend
```

### 2. 開発サーバー起動

```bash
npm run dev
```

ブラウザで **http://localhost:5173** を開きます。

`npm run dev` は **React フロントエンド（Vite・ポート 5173）** と **Express 実行サーバー（ポート 3000）** を同時に起動します。

### 3. 基本的な操作

1. ホームからサンプルを選ぶか、「新規作成」で空のエディタを開く
2. 日本語でコードを書く（または C 言語モードで読み解く）
3. 「実行」で結果を Bottom Panel に表示
4. サンプルでは「練習」で問題に挑戦し、進捗が記録される

個別起動：

```bash
npm run dev:server   # 実行サーバーのみ
npm run dev:client   # フロントエンドのみ
```

### 本番ビルド

```bash
npm run build
npm start
```

http://localhost:3000 で配信されます。

---

## ディレクトリ構成

```
CodeBridge/
  frontend/          React + Vite（UI）
  shared/            変換エンジン・サンプル・ロードマップ
  server.js          Express + gcc 実行 API
  scripts/           開発・検証スクリプト
  docs/              デモ・QA・提出チェック・画像ガイド
  LICENSE            MIT License
  README.md
```

サンプル追加は [docs/sample-template.md](docs/sample-template.md) を参照してください。

関連ドキュメント：

| ドキュメント | 内容 |
|--------------|------|
| [docs/demo.md](docs/demo.md) | 約 5 分の発表デモ手順 |
| [docs/manual-qa-guide.md](docs/manual-qa-guide.md) | 手動 QA |
| [docs/known-limitations.md](docs/known-limitations.md) | 既知の制限 |
| [docs/release-checklist.md](docs/release-checklist.md) | GitHub リリース準備 |

---

## 開発背景

C 言語を初めて学ぶ人には、次のようなつまずきがよくあります。

- 英単語や記号で止まってしまう
- 授業や AI が生成したコードの意味が分からない
- アルゴリズムより先に構文で挫折する
- 「何から学べばよいか」が分からない

CodeBridge は、これらの課題に対して **日本語という身近な言葉** でコードを書き、読み、実行し、間違いを直す体験を提供します。U-22 プログラミング・コンテスト作品およびポートフォリオとしても公開できるよう設計しています。

---

## 今後の予定

- より多くの C 言語構文への対応
- 学習履歴の強化・苦手分析
- おすすめ問題の提案
- スクリーンショット・デモ GIF の README 掲載
- （将来）クラウド進捗同期などの検討

---

## 品質確認

```bash
npm test          # テスト一式
npm run check     # テスト + 構文 + ビルド
npm run final:check
```

| 検証 | 内容 |
|------|------|
| 変換テスト | 日本語 ↔ C 言語の変換 |
| 回帰テスト | 主要機能・全サンプル変換・UI 存在確認 |
| 実行テスト | 実行 API の基本動作 |
| コード比較テスト | 参考コードとの差分表示 |
| ロードマップ検証 | 章定義・sampleId の整合性 |
| サンプル検証 | 全 24 件のコンパイル・実行・期待出力 |
| Monaco オフライン検査 | CDN URL 非依存の静的確認 |

既知の制限は [docs/known-limitations.md](docs/known-limitations.md) を参照してください。

---

## GitHub 公開設定

リポジトリ設定にそのまま貼り付けられる候補です。

### Description（候補）

```
日本語でC言語を学ぶ初学者向け学習IDE。双方向変換・gcc実行・練習採点・学習ロードマップ対応。
```

### Topics（候補）

```
education
c-language
japanese
learning
ide
react
vite
monaco-editor
programming-education
express
u-22
mit-license
```

### Release 案（`v0.9.0-rc.1`）

**タイトル:** `CodeBridge 0.9.0-rc.1 — U-22 Release Candidate`

**本文案:**

```markdown
## Summary
- 日本語 ↔ C 言語の双方向変換と gcc 実行
- 練習モード（見ながら練習 / 見ないで挑戦、テストケース採点）
- 参考コードとの比較（学習用）
- 学習ロードマップ・進捗（localStorage）
- Monaco エディタ（オフライン可）

## Setup
1. `npm install` / `npm install --prefix frontend`
2. `npm run dev` → http://localhost:5173
3. 実行には gcc が必要です

## Notes
- 進捗はブラウザの localStorage に保存されます
- 既知の制限: docs/known-limitations.md
- デモ手順: docs/demo.md
```

詳細手順は [docs/release-checklist.md](docs/release-checklist.md) を参照してください。

---

## ライセンス

[MIT License](LICENSE)
