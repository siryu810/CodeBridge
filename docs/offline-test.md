# オフライン実機確認手順

発表会場やネット制限のある PC で、CodeBridge の Monaco Editor が **CDN なし** で動くことを確認する手順です。

---

## ネット接続とローカルサーバーの違い

| 種類 | 意味 | オフライン確認での扱い |
|------|------|------------------------|
| **インターネット接続** | jsDelivr 等の外部 CDN | Offline にして **不要** であることを確認 |
| **ローカル実行サーバー** (`npm start` / Express) | `localhost:3000` の自前サーバー | **起動したまま**（C コード実行・API に必要） |

- Monaco・UI 資産は `npm run build` の成果物に含まれます。インターネット Offline でも表示できます。
- **C コードのコンパイル実行**は、ローカルの Express + gcc が動いていれば、ネット Offline でも可能です。
- Express を止めた状態では変換・編集はできますが、「実行」は失敗します（仕様です）。

---

## 手順（本番ビルド）

### 1. 依存関係のインストール

```powershell
npm install
npm install --prefix frontend
```

（すでにインストール済みなら省略可）

### 2. 本番ビルド

```powershell
npm run build
```

### 3. 本番サーバー起動

```powershell
npm start
```

### 4. ブラウザで開く

**http://localhost:3000**

### 5–6. DevTools で Offline

1. Chrome の DevTools を開く（F12）
2. **Network** タブを開く
3. **Offline** にチェックを入れる

### 7. ページを再読み込み

`Ctrl+R` または再読み込みボタン

### 8. 確認チェックリスト

- [ ] Monaco Editor が表示される（「読み込み中…」のまま固まらない）
- [ ] 日本語コードの色分けが動く（サンプル「はじめての表示」など）
- [ ] C言語コードの色分けが動く（モードを「C言語 → 日本語」に切替）
- [ ] 括弧補完が動く（`(` で `)` が付く等）
- [ ] Undo / Redo が動く（`Ctrl+Z` / `Ctrl+Y`）
- [ ] 検索が動く（`Ctrl+F`）
- [ ] 変換結果が表示される（右側パネル）
- [ ] 練習モードが開く（サンプル選択後、右側「練習」）
- [ ] ページが白画面にならない

任意（ローカルサーバー起動中）:

- [ ] Offline のまま「実行」でコンソールに結果が出る（gcc が使える環境）

---

## 開発サーバーでの確認（任意）

```powershell
npm run dev
```

http://localhost:5173 を開き、同様に DevTools → Network → Offline → 再読み込み。

Vite 開発時も Monaco はローカルバンドル構成です。外部 CDN への失敗がないことを Network タブで確認してください。

---

## 失敗したとき

| 症状 | 確認 |
|------|------|
| エディタがずっと Loading | `npm run build` の成否、`frontend/dist` の有無 |
| 白画面 | コンソールエラー、`npm run final:check` |
| 実行だけ失敗 | Express が起動しているか、gcc が PATH にあるか（ネット Offline とは無関係） |
| フォールバック textarea が出る | Monaco 初期化失敗。再ビルド・再読み込み |

詳細は [release-checklist.md](release-checklist.md) も参照してください。
