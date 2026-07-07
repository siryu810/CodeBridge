# CodeBridge

日本語でプログラミングの考え方を学び、C言語へ橋渡しする学習IDE。

## 構成

```
CodeBridge/
  frontend/     React + Vite（UI）
  shared/       変換エンジン (jp2c.js)・サンプルデータ
  server.js     Express + gcc 実行 API
  js/           レガシー Vanilla JS（移行中）
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

## API

- `POST /run` — C コードのコンパイル・実行
- `GET /health` — サーバー・gcc 状態
