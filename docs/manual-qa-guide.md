# CodeBridge 手動 QA ガイド

Feature Freeze / U-22 提出前の**手動確認**用です。自動テスト（`npm run check` 等）では保証できない画面・操作を確認します。

チェックリスト本体: [feature-freeze-checklist.md](feature-freeze-checklist.md)

---

## 実行環境（記録欄）

確認時に記入してください。

| 項目 | 記入例 |
|------|--------|
| OS | Windows 11 / macOS / … |
| ブラウザ | Chrome 13x / Edge / … |
| Node.js | `node -v` の結果 |
| 画面サイズ | 1920×1080 / 1280×720 / … |
| ネットワーク状態 | Online / DevTools Offline |

---

## 確認手順

1. `npm install` および `npm install --prefix frontend`
2. `npm run freeze:check`（自動項目の現状を把握）
3. `npm run dev` で開発起動、または `npm run build` → `npm start`
4. ブラウザで http://localhost:5173（dev）または http://localhost:3000（本番）を開く
5. [feature-freeze-checklist.md](feature-freeze-checklist.md) を上から確認し、手動項目を埋める
6. Offline 確認は [offline-test.md](offline-test.md)
7. 代表 4 サンプルは [final-demo-check.md](final-demo-check.md) と併用可
8. 問題があれば下記の不具合記録形式で残す

### おすすめ確認順

1. ホーム → 進捗・ロードマップ・次に学ぶ
2. 「はじめての表示」→ 変換・実行・練習
3. 「入力と表示」→ 標準入力
4. 「偶数・奇数判定」→ 分岐・練習（日本語／C）
5. 「じゃんけん」→ 総合
6. DevTools Offline → 再読込 → Monaco 表示

---

## 不具合記録形式

```text
- 項目:
- 再現手順:
- 期待結果:
- 実際の結果:
- 発生頻度:
- スクリーンショット:
- 重要度:
  - Critical
  - Major
  - Minor
  - Cosmetic
```

---

## 判定基準

### Critical

起動不可、白画面、データ破損、主要機能が全く使えない。

### Major

変換・実行・練習・進捗など、提出デモの主要機能の不具合。

### Minor

一部サンプルのみ、説明文、軽微な操作不具合。

### Cosmetic

余白・文字サイズ・色・整列など見た目のみ。

---

## QA UI について

一般ユーザー向けの QA モード（画面ボタン等）は追加していません。  
既存 UI への影響を避けるため、本ガイドとチェックリストで手動確認します。
