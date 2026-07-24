// 各サンプルの練習モード定義 — shared/samples.js にマージされます
//
// 採点は testCases（なければ stdinExamples から自動生成）で行います。
// expectedOutputIncludes は後方互換・フォールバック用です。
// 参考コードとの差分は採点に使いません。

/**
 * @typedef {object} PracticeTestCaseDef
 * @property {string} [id]
 * @property {string} [label]
 * @property {string} stdin
 * @property {{ includes?: string[], oneOf?: string[] }} expectedOutput
 */

/**
 * @typedef {object} PracticeDef
 * @property {string} prompt
 * @property {string[]} hints
 * @property {string[]} expectedCommands
 * @property {string[]} expectedOutputIncludes
 * @property {"flexible"|"strict"|"exact"} [outputPolicy]
 * @property {PracticeTestCaseDef[]} [testCases]
 */

/** @type {Record<string, PracticeDef>} */
export const SAMPLE_PRACTICE = {
    hello: {
        prompt: "「Hello, CodeBridge!」と表示してください。",
        hints: ["表示命令を使います。", '表示("Hello, CodeBridge!"); の形で書きます。'],
        expectedCommands: ["表示"],
        expectedOutputIncludes: ["Hello, CodeBridge!"],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "基本表示",
                stdin: "",
                expectedOutput: { includes: ["Hello, CodeBridge!"] },
            },
        ],
    },
    "input-echo": {
        prompt: "数字を1つ入力して、その数字を表示してください。",
        hints: ["整数型の変数を宣言します。", "入力(変数); で読み込みます。", "表示(変数); で出力します。"],
        expectedCommands: ["表示", "入力", "整数"],
        expectedOutputIncludes: ["42"],
        outputPolicy: "flexible",
        testCases: [
            { label: "42を入力", stdin: "42", expectedOutput: { includes: ["42"] } },
            { label: "7を入力", stdin: "7", expectedOutput: { includes: ["7"] } },
            { label: "0を入力", stdin: "0", expectedOutput: { includes: ["0"] } },
        ],
    },
    janken: {
        prompt:
            "0/1/2を入力して、CPUとじゃんけんをするプログラムを作ってください。出力には「じゃんけん」と「結果:」を含めてください。",
        hints: [
            "乱数初期化() を最初に呼びます。",
            "乱数() % 3 で CPU の手を決めます。",
            "もし / そうでなくもし で勝敗を分岐します。",
        ],
        expectedCommands: ["表示", "入力", "整数", "乱数", "もし"],
        expectedOutputIncludes: ["じゃんけん", "結果:"],
        outputPolicy: "flexible",
        // CPU は乱数のため、勝敗文言は oneOf。手の入力ごとに構造を確認する。
        testCases: [
            {
                label: "グー(0)",
                stdin: "0",
                expectedOutput: {
                    includes: ["じゃんけん", "結果:"],
                    oneOf: ["勝ち", "負け", "あいこ"],
                },
            },
            {
                label: "チョキ(1)",
                stdin: "1",
                expectedOutput: {
                    includes: ["じゃんけん", "結果:"],
                    oneOf: ["勝ち", "負け", "あいこ"],
                },
            },
            {
                label: "パー(2)",
                stdin: "2",
                expectedOutput: {
                    includes: ["じゃんけん", "結果:"],
                    oneOf: ["勝ち", "負け", "あいこ"],
                },
            },
            {
                label: "再入力 グー",
                stdin: "0",
                expectedOutput: {
                    includes: ["じゃんけん", "あなたの手", "CPUの手"],
                    oneOf: ["グー", "チョキ", "パー"],
                },
            },
            {
                label: "再入力 チョキ",
                stdin: "1",
                expectedOutput: {
                    includes: ["じゃんけん", "結果:"],
                    oneOf: ["勝ち", "負け", "あいこ"],
                },
            },
            {
                label: "再入力 パー",
                stdin: "2",
                expectedOutput: {
                    includes: ["じゃんけん", "結果:"],
                    oneOf: ["勝ち", "負け", "あいこ"],
                },
            },
            {
                label: "手の表示確認(0)",
                stdin: "0",
                expectedOutput: { includes: ["あなたの手", "グー"] },
            },
            {
                label: "手の表示確認(1)",
                stdin: "1",
                expectedOutput: { includes: ["あなたの手", "チョキ"] },
            },
            {
                label: "手の表示確認(2)",
                stdin: "2",
                expectedOutput: { includes: ["あなたの手", "パー"] },
            },
        ],
    },
    bmi: {
        prompt: "身長と体重を入力してBMIを判定してください。",
        hints: [
            "小数型で身長・体重を入力します。",
            "BMI = 体重 ÷ (身長m)² を計算します。",
            "もし で低体重・普通・肥満を判定します。",
        ],
        expectedCommands: ["表示", "入力", "小数", "もし"],
        expectedOutputIncludes: ["BMI", "判定"],
        outputPolicy: "flexible",
    },
    grade: {
        prompt: "点数を入力して、A/B/C/不可の評価を表示してください。",
        hints: [
            "整数で点数を入力します。",
            "そうでなくもし で段階的に評価を分けます。",
            "90点以上なら A など条件を決めます。",
        ],
        expectedCommands: ["表示", "入力", "整数", "もし"],
        expectedOutputIncludes: ["評価"],
        outputPolicy: "flexible",
    },
    omikuji: {
        prompt: "乱数でおみくじ（大吉・中吉・小吉・凶）を表示してください。",
        hints: [
            "乱数初期化() を呼びます。",
            "乱数() % 4 で 0〜3 の結果を得ます。",
            "もし / そうでなくもし で結果を分岐します。",
        ],
        expectedCommands: ["乱数", "乱数初期化", "もし", "表示"],
        expectedOutputIncludes: [],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "おみくじ結果",
                stdin: "",
                expectedOutput: { oneOf: ["大吉", "中吉", "小吉", "凶"] },
            },
            {
                label: "再実行1",
                stdin: "",
                expectedOutput: { oneOf: ["大吉", "中吉", "小吉", "凶"] },
            },
            {
                label: "再実行2",
                stdin: "",
                expectedOutput: { oneOf: ["大吉", "中吉", "小吉", "凶"] },
            },
        ],
    },
    quiz: {
        prompt: "2つの数を入力し、足し算の答えが正しいか判定してください。",
        hints: [
            "3回 入力 して a, b, 答えを読みます。",
            "もし で答えが a + b と等しいか調べます。",
            "正解なら「正解!」、違えば「不正解」を表示します。",
        ],
        expectedCommands: ["表示", "入力", "整数", "もし"],
        expectedOutputIncludes: ["正解"],
        outputPolicy: "flexible",
    },
    "even-odd": {
        prompt: "整数を入力して、偶数か奇数かを表示してください。",
        hints: [
            "n % 2 が 0 かどうかで判定します。",
            "もし / そうでなければ で分岐します。",
            "「偶数」「奇数」を表示します。",
        ],
        expectedCommands: ["表示", "入力", "整数", "もし"],
        expectedOutputIncludes: ["偶数"],
        outputPolicy: "flexible",
        testCases: [
            { label: "偶数(4)", stdin: "4", expectedOutput: { includes: ["偶数"] } },
            { label: "奇数(7)", stdin: "7", expectedOutput: { includes: ["奇数"] } },
            { label: "偶数(0)", stdin: "0", expectedOutput: { includes: ["偶数"] } },
            { label: "奇数(1)", stdin: "1", expectedOutput: { includes: ["奇数"] } },
            { label: "偶数(100)", stdin: "100", expectedOutput: { includes: ["偶数"] } },
        ],
    },
    "max-value": {
        prompt: "3つの整数を入力して、最大値を表示してください。",
        hints: [
            "3回 入力 します。",
            "最初の値を max にして、あと2つと比較します。",
            "もし(bがmaxより大きい) で更新します。",
        ],
        expectedCommands: ["表示", "入力", "整数", "もし"],
        expectedOutputIncludes: ["9"],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "最大が末尾",
                stdin: "1\n5\n9",
                expectedOutput: { includes: ["9"] },
            },
            {
                label: "最大が先頭",
                stdin: "10\n2\n3",
                expectedOutput: { includes: ["10"] },
            },
            {
                label: "最大が中央",
                stdin: "1\n8\n4",
                expectedOutput: { includes: ["8"] },
            },
        ],
    },
    "sum-average": {
        prompt: "3つの整数を入力して、合計と平均を表示してください。",
        hints: [
            "3つの整数を入力します。",
            "合計は3つの足し算です。",
            "平均は合計 ÷ 3 を小数で表示します。",
        ],
        expectedCommands: ["表示", "入力", "整数"],
        expectedOutputIncludes: ["合計", "平均"],
        outputPolicy: "flexible",
    },
    "for-one-to-ten": {
        prompt: "1から10まで表示してください。",
        hints: [
            "繰り返しを使います。",
            "開始値は1、終了条件は i <= 10 です。",
            "表示(i); で値を出力します。",
        ],
        expectedCommands: ["繰り返し", "表示"],
        expectedOutputIncludes: ["1", "10"],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "1〜10",
                stdin: "",
                expectedOutput: { includes: ["1", "2", "5", "10"] },
            },
        ],
    },
    "array-sum": {
        prompt: "配列の要素を合計して表示してください。",
        hints: [
            "整数配列を宣言して初期値を入れます。",
            "繰り返し で各要素を足し込みます。",
            "合計を表示します。",
        ],
        expectedCommands: ["繰り返し", "表示", "整数"],
        expectedOutputIncludes: ["合計", "150"],
        outputPolicy: "flexible",
    },
    "for-kuku": {
        prompt: "九九（9×9）の表を表示してください。",
        hints: [
            "二重の繰り返しを使います。",
            "外側のループが行、内側が列です。",
            "i × j の結果を表示します。",
        ],
        expectedCommands: ["繰り返し", "表示"],
        expectedOutputIncludes: ["1 x 1 = 1", "9 x 9 = 81"],
        outputPolicy: "flexible",
    },
    "for-reverse": {
        prompt: "10から1まで逆順に表示してください。",
        hints: [
            "繰り返しで i = 10 から始めます。",
            "条件は i >= 1 です。",
            "i-- で1ずつ減らします。",
        ],
        expectedCommands: ["繰り返し", "表示"],
        expectedOutputIncludes: ["10", "1"],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "10→1",
                stdin: "",
                expectedOutput: { includes: ["10", "9", "1"] },
            },
        ],
    },
    "for-triangle": {
        prompt: "＊を使って三角形を表示してください。",
        hints: [
            "二重の繰り返しを使います。",
            "行の番号と同じ個数の＊を表示します。",
            '続けて表示("*"); と 表示(""); で改行します。',
        ],
        expectedCommands: ["繰り返し", "表示"],
        expectedOutputIncludes: ["*", "*****"],
        outputPolicy: "flexible",
    },
    "while-one-to-hundred": {
        prompt: "1から100まで表示してください（while文を使う）。",
        hints: [
            "間(...) で条件が真の間ループします。",
            "n を1から始めて、表示後に n = n + 1 します。",
            "条件は nが100以下 です。",
        ],
        expectedCommands: ["間", "表示"],
        expectedOutputIncludes: ["1", "100"],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "1と100",
                stdin: "",
                expectedOutput: { includes: ["1", "50", "100"] },
            },
        ],
    },
    "while-until-zero": {
        prompt: "0が入力されるまで数字を入力し、0以外を表示してください。",
        hints: [
            "間(nが0と等しくない) でループします。",
            "ループ内で 入力 と 表示 を繰り返します。",
            "0を入力したらループを抜けます。",
        ],
        expectedCommands: ["間", "入力", "表示"],
        expectedOutputIncludes: ["5"],
        outputPolicy: "flexible",
    },
    "array-max": {
        prompt: "配列の最大値を求めて表示してください。",
        hints: [
            "配列の先頭を最大値の初期値にします。",
            "繰り返し で2番目以降を調べます。",
            "もし(要素がmaxより大きい) で更新します。",
        ],
        expectedCommands: ["繰り返し", "もし", "表示"],
        expectedOutputIncludes: ["最大値", "9"],
        outputPolicy: "flexible",
    },
    "array-min": {
        prompt: "配列の最小値を求めて表示してください。",
        hints: [
            "配列の先頭を最小値の初期値にします。",
            "繰り返し で各要素を調べます。",
            "もし(要素がminより小さい) で更新します。",
        ],
        expectedCommands: ["繰り返し", "もし", "表示"],
        expectedOutputIncludes: ["最小値", "1"],
        outputPolicy: "flexible",
    },
    "array-average": {
        prompt: "配列の平均を求めて表示してください。",
        hints: [
            "繰り返し で全要素を足して合計を求めます。",
            "合計を要素数で割ります。",
            "小数型で平均を表示します。",
        ],
        expectedCommands: ["繰り返し", "表示"],
        expectedOutputIncludes: ["平均", "30.00"],
        outputPolicy: "flexible",
    },
    "func-add": {
        prompt: "2つの数を足す関数を作り、結果を表示してください。",
        hints: [
            "整数 add(整数 a, 整数 b) のような関数を定義します。",
            "戻る で a + b を返します。",
            "関数を呼び出して結果を表示します。",
        ],
        expectedCommands: ["戻る", "表示", "入力"],
        expectedOutputIncludes: ["合計", "7"],
        outputPolicy: "flexible",
    },
    "func-max": {
        prompt: "2つの数の大きい方を返す関数を作ってください。",
        hints: [
            "2つの整数を比較する関数を作ります。",
            "もし で大きい方を選び、戻る で返します。",
            "入力した2つの数で関数を呼び出します。",
        ],
        expectedCommands: ["戻る", "もし", "表示", "入力"],
        expectedOutputIncludes: ["最大", "9"],
        outputPolicy: "flexible",
    },
    "string-name": {
        prompt: "名前を入力して「こんにちは、○○」と表示してください。",
        hints: [
            "文字列 name[50]; で変数を宣言します。",
            "入力(name); で名前を読み込みます。",
            "続けて表示 と 表示 で挨拶を出力します。",
        ],
        expectedCommands: ["表示", "入力", "文字列"],
        expectedOutputIncludes: ["こんにちは"],
        outputPolicy: "flexible",
        testCases: [
            {
                label: "名前入力",
                stdin: "太郎",
                expectedOutput: { includes: ["こんにちは"] },
            },
            {
                label: "別の名前",
                stdin: "Hanako",
                expectedOutput: { includes: ["こんにちは", "Hanako"] },
            },
        ],
    },
    "string-strlen": {
        prompt: "文字列を入力して、文字数を表示してください。（半角数字で文字数を表示）",
        hints: [
            "文字列型の配列を宣言します。",
            "strlen(文字列) で文字数を数えます。",
            "整数変数に入れて表示します。",
        ],
        expectedCommands: ["表示", "入力", "文字列"],
        expectedOutputIncludes: ["文字数", "5"],
        // 問題文で半角数字指定 → strict
        outputPolicy: "strict",
        testCases: [
            {
                label: "hello",
                stdin: "hello",
                expectedOutput: { includes: ["文字数", "5"] },
            },
            {
                label: "ab",
                stdin: "ab",
                expectedOutput: { includes: ["文字数", "2"] },
            },
        ],
    },
};

/** @param {Array<{ id: string, practice?: object }>} samples */
export function attachPracticeToSamples(samples) {
    for (const sample of samples) {
        const practice = SAMPLE_PRACTICE[sample.id];
        if (practice) {
            sample.practice = {
                outputPolicy: "flexible",
                ...practice,
            };
        }
    }
}
