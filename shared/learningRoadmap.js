// CodeBridge 学習ロードマップ（章定義）
// 将来: XP / レベル / バッジ / 修了証 / おすすめ問題 は roadmapManager の extensions で拡張

/**
 * @typedef {object} LearningChapter
 * @property {string} id
 * @property {number} chapterNumber
 * @property {string} title
 * @property {string} description
 * @property {string[]} topics
 * @property {number} estimatedMinutes
 * @property {string[]} sampleIds
 */

/** @type {LearningChapter[]} */
export const LEARNING_ROADMAP = [
    {
        id: "chapter1",
        chapterNumber: 1,
        title: "表示",
        description: "画面へ文字や数字を表示する基本を学びます。",
        topics: ["表示"],
        estimatedMinutes: 10,
        sampleIds: ["hello"],
    },
    {
        id: "chapter2",
        chapterNumber: 2,
        title: "入力",
        description: "キーボードから値を読み込み、プログラムで使う方法を学びます。",
        topics: ["入力", "整数", "表示"],
        estimatedMinutes: 15,
        sampleIds: ["input-echo"],
    },
    {
        id: "chapter3",
        chapterNumber: 3,
        title: "計算",
        description: "数値の計算や比較を使ったプログラムを作ります。",
        topics: ["整数", "小数", "表示", "入力", "計算"],
        estimatedMinutes: 30,
        sampleIds: ["sum-average", "max-value", "bmi", "quiz"],
    },
    {
        id: "chapter4",
        chapterNumber: 4,
        title: "条件分岐",
        description: "条件によって処理を分ける if 文の考え方を学びます。",
        topics: ["もし", "そうでなくもし", "そうでなければ"],
        estimatedMinutes: 20,
        sampleIds: ["even-odd", "grade"],
    },
    {
        id: "chapter5",
        chapterNumber: 5,
        title: "繰り返し",
        description: "for 文と while 文で同じ処理を繰り返す方法を学びます。",
        topics: ["繰り返し", "間"],
        estimatedMinutes: 40,
        sampleIds: [
            "for-one-to-ten",
            "for-reverse",
            "for-kuku",
            "for-triangle",
            "while-one-to-hundred",
            "while-until-zero",
        ],
    },
    {
        id: "chapter6",
        chapterNumber: 6,
        title: "配列",
        description: "複数のデータをまとめて扱う配列の使い方を学びます。",
        topics: ["配列", "繰り返し", "もし"],
        estimatedMinutes: 30,
        sampleIds: ["array-sum", "array-max", "array-min", "array-average"],
    },
    {
        id: "chapter7",
        chapterNumber: 7,
        title: "関数",
        description: "処理をまとめて再利用する関数の書き方を学びます。",
        topics: ["戻る", "もし", "入力"],
        estimatedMinutes: 25,
        sampleIds: ["func-add", "func-max"],
    },
    {
        id: "chapter8",
        chapterNumber: 8,
        title: "文字列",
        description: "文字列の入力・表示と文字数の数え方を学びます。",
        topics: ["文字列", "入力", "表示"],
        estimatedMinutes: 20,
        sampleIds: ["string-name", "string-strlen"],
    },
    {
        id: "chapter9",
        chapterNumber: 9,
        title: "乱数",
        description: "乱数を使ってゲームやおみくじのようなプログラムを作ります。",
        topics: ["乱数", "乱数初期化", "もし"],
        estimatedMinutes: 25,
        sampleIds: ["omikuji", "janken"],
    },
];

export function getChapterById(id) {
    return LEARNING_ROADMAP.find((ch) => ch.id === id) ?? null;
}

export function getChapterForSampleId(sampleId) {
    return LEARNING_ROADMAP.find((ch) => ch.sampleIds.includes(sampleId)) ?? null;
}
