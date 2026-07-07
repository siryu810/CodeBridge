# CodeBridge

日本語でプログラミングの考え方を学び、C言語へ橋渡しする学習IDE。

## 構成

```
CodeBridge/
  frontend/          React + Vite（UI）
  shared/            変換エンジン・サンプルデータ・SampleManager
  server.js          Express + gcc 実行 API
  js/                レガシー Vanilla JS（移行中）
  scripts/           検証・開発スクリプト
  docs/              サンプル作成テンプレート等
```

## 開発（React 版）

ターミナルを2つ開きます。

```powershell
# 1. バックエンド（ポート 3000）
npm run dev:server

# 2. フロントエンド（ポート 5173、/run は 3000 にプロキシ）
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

## 本番ビルド

```powershell
npm run build
npm start
```

http://localhost:3000 で React ビルドが配信されます。

## テスト

```powershell
npm test
```

変換テスト・回帰テスト・実行テスト・**サンプル検証**をまとめて実行します。

```powershell
npm run check
```

変換・回帰・実行・サンプル検証・ビルドまで一括で確認します。最後に **Sample Report** が表示されます。

## サンプルの追加

サンプルは `shared/samples.js` に定義し、`shared/sampleManager.js` が一覧・検索・検証を担当します。

### 追加手順

1. **`shared/samples.js` にサンプルを追加**（[docs/sample-template.md](docs/sample-template.md) を参照）
2. **`npm run check` を実行**
3. **Sample Report で Warnings が 0、Failed が 0 であることを確認**
4. **Commit**

```powershell
node scripts/sync-legacy-samples.mjs   # レガシー UI 用
npm run check
```

**通らないサンプルは追加・コミットしないでください。**

### 自動検証（SampleManager）

`scripts/validate-samples.mjs` が次を検証します。

- 必須フィールド（`category` / `difficulty` / `commands` / `expectedOutput` など）
- `id` 重複・空フィールド
- `jpCode` → C 変換と `cCode` の比較（不一致は Warning）
- `入力(...)` の数と `stdinExamples` の整合
- gcc コンパイル・実行・期待出力

単体実行:

```powershell
npm run validate-samples
```

### サンプル構造

```js
{
    id, title, description,
    category,      // 基本 / 条件分岐 / 乱数 / 計算 など
    difficulty,    // 1〜5
    tags,
    commands,      // ["表示", "入力", "もし"]
    jpCode, cCode,
    stdinExamples,
    expectedOutput, // { includes: [...], oneOf: [...] }
    learningGoals,
    algorithmSteps,
}
```

## API

- `POST /run` — C コードのコンパイル・実行
- `GET /health` — サーバー・gcc 状態
