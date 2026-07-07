# CodeBridge サンプル作成テンプレート

新しいサンプルを `shared/samples.js` に追加するときは、このテンプレートに沿って記入し、最後に `npm run check` を実行してください。

## サンプル名

（例: BMI計算）

## 目的

（例: 小数と計算式・条件分岐を学ぶ）

## カテゴリ・難易度

| 項目 | 値 |
|---|---|
| category | 基本 / 条件分岐 / 繰り返し / 配列 / 関数 / 乱数 / 計算 / 文字列 |
| difficulty | 1（易）〜 5（難） |

## 学習する命令（commands）

```js
commands: ["表示", "入力", "もし"],
```

## 日本語コード（jpCode）

```text
表示("...");
整数 x;
入力(x);
```

## Cコード（cCode）

`jpCode` を変換した結果と一致する実行可能な C プログラムを用意します。

## 入力例（stdinExamples）

```js
stdinExamples: [
    { label: "入力なし", stdin: "", expectStatus: "input_required" },
    { label: "標準例", stdin: "42", expectStatus: "success" },
],
```

## 期待出力（expectedOutput）

```js
expectedOutput: {
    includes: ["42"],           // すべて含まれること
    oneOf: [],                  // いずれか1つ（乱数系）
},
```

乱数で結果が変わる場合:

```js
expectedOutput: { includes: [], oneOf: ["大吉", "中吉", "小吉", "凶"] },
```

ケースごとに違う場合は `stdinExamples[].expectedOutput` を指定できます。

## shared/samples.js への追加形式

```js
{
    id: "my-sample",
    title: "サンプル名",
    description: "一行説明",
    category: "基本",
    difficulty: 1,
    tags: ["入門"],
    commands: ["表示"],
    jpCode: `...`,
    cCode: `#include <stdio.h>\n...`,
    stdinExamples: [
        { label: "...", stdin: "", expectStatus: "success" },
    ],
    expectedOutput: { includes: ["..."] },
    learningGoals: ["..."],
    algorithmSteps: ["..."],
},
```

## 確認チェックリスト

- [ ] `shared/samples.js` に追加した
- [ ] `node scripts/sync-legacy-samples.mjs` を実行した
- [ ] **`npm run check` が通る**
- [ ] **Sample Report の Warnings が 0**
- [ ] **Failed が 0**

通らないサンプルはコミットしないでください。
