# GitHub リリース準備チェックリスト

U-22 / GitHub 公開前の手順です。**Commit・Push・タグ作成は自動では行いません。** 各自で実行してください。

推奨バージョン例: **`0.9.0-rc.1`** / タグ **`v0.9.0-rc.1`**

---

## チェックリスト

- [ ] `npm run final:check` が成功した（Failed: 0）
- [ ] オフライン確認を行った（[offline-test.md](offline-test.md)）
- [ ] 代表 4 サンプルを確認した（[final-demo-check.md](final-demo-check.md)）
- [ ] スクリーンショットを `docs/images/` に配置した（[images/README.md](images/README.md)）
- [ ] README の説明・リンク・バージョン・LICENSE を確認した
- [ ] 秘密情報（`.env` 等）が Git に含まれていないことを確認した
- [ ] GitHub リポジトリの Description / Topics を設定した（下記候補）
- [ ] GitHub へ Commit した
- [ ] GitHub へ Push した
- [ ] Release Candidate タグを作成した
- [ ] デモ動画（または [demo.md](demo.md) の流れ）を確認した
- [ ] 発表資料を確認した

---

## GitHub 設定候補（README と同内容）

### Description

```
日本語でC言語を学ぶ初学者向け学習IDE。双方向変換・gcc実行・練習採点・学習ロードマップ対応。
```

### Topics

`education` `c-language` `japanese` `learning` `ide` `react` `vite` `monaco-editor` `programming-education` `express` `u-22` `mit-license`

### Release タイトル案

`CodeBridge 0.9.0-rc.1 — U-22 Release Candidate`

---

## タグ作成例（手動）

```powershell
# 作業ツリーがクリーンなことを確認してから
git tag -a v0.9.0-rc.1 -m "CodeBridge 0.9.0-rc.1 (U-22 Release Candidate)"
git push origin v0.9.0-rc.1
```

GitHub Releases で同タグから Draft Release を作成し、変更要点・オフライン注意・デモ手順リンクを載せると分かりやすいです。

---

## Commit 前の確認

```powershell
npm run final:check
git status
```

未追跡ファイルは `final:check` では **Warning** になります。秘密情報（`.env` 等）を含めないでください。

---

## 関連ドキュメント

- [demo.md](demo.md) — 約 5 分デモ
- [offline-test.md](offline-test.md) — Offline 実機
- [final-demo-check.md](final-demo-check.md) — 代表 4 件
- [public-release-readiness-report.md](public-release-readiness-report.md) — 公開前品質レポート
