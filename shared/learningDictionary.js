// CodeBridge 学習用命令辞書（AI 不使用・静的データ）

const LEARNING_DICTIONARY = [
    {
        id: "print",
        dictKey: "PRINTF",
        jp: "表示",
        c: "printf",
        short: "文字や数値を画面に出す命令",
        beginner:
            "プログラムの結果を人に見せたいときに使います。メッセージを出したり、計算結果を表示したりできます。",
        useCases: ["挨拶文の表示", "入力のお願い", "計算結果の表示", "ゲームの状況説明"],
        examples: [
            { jp: '表示("こんにちは");', c: 'printf("こんにちは\\n");' },
            { jp: "表示(score);", c: 'printf("%d\\n", score);' },
        ],
    },
    {
        id: "scanf",
        dictKey: "SCANF",
        jp: "入力",
        c: "scanf",
        short: "キーボードから値を読み込む命令",
        beginner:
            "ユーザーがキーボードで入れた値をプログラムに取り込みたいときに使います。実行時入力欄の値が渡されます。",
        useCases: ["点数の入力", "年齢の入力", "クイズの答え入力", "じゃんけんの手の入力"],
        examples: [
            { jp: "入力(score);", c: 'scanf("%d", &score);' },
            { jp: "入力(height);", c: 'scanf("%lf", &height);' },
        ],
    },
    {
        id: "int",
        dictKey: "INT",
        jp: "整数",
        c: "int",
        short: "整数を入れるための型",
        beginner:
            "小数ではない数字を保存したいときに使います。点数、回数、年齢、個数など、ぴったりの数を扱う場面で使います。",
        useCases: ["80点、3回、20歳、5個のような値", "カウンタ", "じゃんけんの手（0/1/2）"],
        examples: [{ jp: "整数 score = 80;", c: "int score = 80;" }],
    },
    {
        id: "double",
        dictKey: "DOUBLE",
        jp: "小数",
        c: "double",
        short: "小数を入れるための型",
        beginner:
            "小数点以下がある数値を扱いたいときに使います。身長・体重・BMI のように、割り算の結果などを正確に保存できます。",
        useCases: ["身長・体重", "BMI などの計算結果", "平均点（小数あり）"],
        examples: [{ jp: "小数 bmi = 22.5;", c: "double bmi = 22.5;" }],
    },
    {
        id: "char",
        dictKey: "CHAR",
        jp: "文字",
        c: "char",
        short: "1文字を入れるための型",
        beginner: "アルファベット1文字や記号1つを保存したいときに使います。",
        useCases: ["Y/N の選択", "記号1文字の判定"],
        examples: [{ jp: "文字 c;", c: "char c;" }],
    },
    {
        id: "if",
        dictKey: "IF",
        jp: "もし",
        c: "if",
        short: "条件が真のときだけ処理を実行する",
        beginner:
            "「もし〜なら」のように、条件によって処理を分けたいときに使います。成績判定やゲームの勝敗などに欠かせません。",
        useCases: ["60点以上なら合格", "じゃんけんの勝ち判定", "BMI の区分け"],
        examples: [{ jp: "もし(scoreが60以上){", c: "if(score >= 60){" }],
    },
    {
        id: "else_if",
        dictKey: "ELSE_IF",
        jp: "そうでなくもし",
        c: "else if",
        short: "別の条件で分岐を追加する",
        beginner:
            "最初の条件に当てはまらなかったとき、別の条件を試したい場合に使います。成績の A/B/C 判定のように段階的な判定に向いています。",
        useCases: ["成績の複数段階判定", "おみくじの複数結果", "じゃんけんの勝ちパターン"],
        examples: [{ jp: "そうでなくもし(scoreが70以上){", c: "} else if(score >= 70){" }],
    },
    {
        id: "else",
        dictKey: "ELSE",
        jp: "そうでなければ",
        c: "else",
        short: "どの条件にも当てはまらないときの処理",
        beginner:
            "これまでの条件がすべて当てはまらなかったときに実行する処理を書きます。「それ以外はこうする」という最後の受け皿です。",
        useCases: ["不合格の表示", "負けの表示", "その他の場合"],
        examples: [{ jp: "そうでなければ{", c: "} else {" }],
    },
    {
        id: "for",
        dictKey: "FOR",
        jp: "繰り返し",
        c: "for",
        short: "決めた回数や条件で繰り返す",
        beginner: "同じ処理を何度も実行したいときに使います。例：10回繰り返す、1から100まで処理する。",
        useCases: ["指定回数のループ", "配列の要素を順に処理"],
        examples: [{ jp: "繰り返し(iが0から10未満){", c: "for(int i = 0; i < 10; i++){" }],
    },
    {
        id: "while",
        dictKey: "WHILE",
        jp: "間",
        c: "while",
        short: "条件が真の間、繰り返す",
        beginner: "終わるタイミングがはっきりしない繰り返しに使います。条件が満たされるまで続けます。",
        useCases: ["入力が正しくなるまで聞き直す", "ゲームが終わるまで続ける"],
        examples: [{ jp: "間(xが0より大きい){", c: "while(x > 0){" }],
    },
    {
        id: "return",
        dictKey: "RETURN",
        jp: "戻る",
        c: "return",
        short: "関数から値を返して終了する",
        beginner: "関数の計算結果を呼び出し元に返したいとき、またはプログラムを終了させたいときに使います。",
        useCases: ["関数の結果を返す", "main 関数の終了"],
        examples: [{ jp: "戻る 0;", c: "return 0;" }],
    },
    {
        id: "rand",
        dictKey: "RAND",
        jp: "乱数",
        c: "rand",
        short: "ランダムな整数を得る",
        beginner:
            "毎回ちがう結果が欲しいときに使います。じゃんけんの CPU の手やおみくじの結果など、くじ引きのような処理に向いています。",
        useCases: ["じゃんけんの CPU", "おみくじ", "ダイス・くじ引き"],
        examples: [{ jp: "整数 CPU = 乱数() % 3;", c: "int CPU = rand() % 3;" }],
    },
    {
        id: "srand_init",
        dictKey: "SRAND_INIT",
        jp: "乱数初期化",
        c: "srand",
        short: "乱数の種を初期化して、毎回ちがう結果にする",
        beginner:
            "乱数() だけだと、プログラムを実行するたびに同じ並びになることがあります。乱数初期化() を最初に呼ぶと、実行のたびに違う乱数になりやすくなります。",
        useCases: ["じゃんけん・おみくじの開始時", "ゲーム開始時の1回だけ"],
        examples: [
            { jp: "乱数初期化();", c: "srand((unsigned int)time(NULL));" },
        ],
    },
    {
        id: "eq_equal",
        dictKeys: ["EQ_PHRASE_TO", "EQ_PHRASE_GA", "EQ"],
        jp: "と等しい / が等しい",
        c: "==",
        short: "左右の値が同じかどうかを調べる",
        beginner: "2つの値がぴったり同じかを判定するときに使います。じゃんけんの「あいこ」判定などに使います。",
        useCases: ["あいこ判定", "正解かどうか", "特定の値かどうか"],
        examples: [{ jp: "playerがCPUと等しい", c: "player == CPU" }],
    },
    {
        id: "ne_equal",
        dictKeys: ["NE_PHRASE_TO", "NE_PHRASE_GA", "NE"],
        jp: "と等しくない",
        c: "!=",
        short: "左右の値が違うかどうかを調べる",
        beginner: "2つの値が異なるときに真になる条件です。",
        useCases: ["値が違うときの処理", "エラー値の除外"],
        examples: [{ jp: "xが0と等しくない", c: "x != 0" }],
    },
    {
        id: "ge",
        dictKeys: ["GE_PHRASE", "GE"],
        jp: "以上",
        c: ">=",
        short: "左の値が右以上かどうか",
        beginner: "「60点以上」「18歳以上」のように、基準以上かを調べるときに使います。",
        useCases: ["合格ライン", "年齢制限", "成績判定"],
        examples: [{ jp: "scoreが60以上", c: "score >= 60" }],
    },
    {
        id: "le",
        dictKeys: ["LE_PHRASE", "LE"],
        jp: "以下",
        c: "<=",
        short: "左の値が右以下かどうか",
        beginner: "上限を調べるときに使います。",
        useCases: ["範囲の上限チェック"],
        examples: [{ jp: "ageが20以下", c: "age <= 20" }],
    },
    {
        id: "gt",
        dictKeys: ["GT_PHRASE", "GT"],
        jp: "より大きい",
        c: ">",
        short: "左の値が右より大きいかどうか",
        beginner: "「A より B が大きい」と比較するときに使います。",
        useCases: ["大小比較", "範囲外チェック"],
        examples: [{ jp: "xが0より大きい", c: "x > 0" }],
    },
    {
        id: "lt",
        dictKeys: ["LT_PHRASE", "LT"],
        jp: "より小さい",
        c: "<",
        short: "左の値が右より小さいかどうか",
        beginner: "「BMI が 18.5 より小さい」のように、基準より小さいかを調べるときに使います。",
        useCases: ["低体重判定", "閾値未満の判定"],
        examples: [{ jp: "bmiが18.5より小さい", c: "bmi < 18.5" }],
    },
    {
        id: "and",
        dictKey: "AND",
        jp: "かつ",
        c: "&&",
        short: "両方の条件が真のときだけ真",
        beginner: "2つ以上の条件をすべて満たす必要があるときに使います。",
        useCases: ["じゃんけんの勝ち条件（複数パターンの組み合わせ）", "範囲の両端チェック"],
        examples: [{ jp: "aが1と等しい かつ bが2と等しい", c: "a == 1 && b == 2" }],
    },
    {
        id: "or",
        dictKey: "OR",
        jp: "または",
        c: "||",
        short: "どちらか一方でも真なら真",
        beginner: "複数の条件のうち、どれか1つでも当てはまればよいときに使います。",
        useCases: ["複数の勝ちパターン", "複数の許可条件"],
        examples: [{ jp: "aが1と等しい または bが2と等しい", c: "a == 1 || b == 2" }],
    },
];

const byId = new Map();
const byDictKey = new Map();

for (const entry of LEARNING_DICTIONARY) {
    byId.set(entry.id, entry);
    const keys = entry.dictKeys ?? (entry.dictKey ? [entry.dictKey] : []);
    for (const key of keys) {
        byDictKey.set(key, entry);
    }
}

const DISPLAY_ORDER = [
    "print",
    "scanf",
    "int",
    "double",
    "char",
    "if",
    "else_if",
    "else",
    "eq_equal",
    "ne_equal",
    "ge",
    "le",
    "gt",
    "lt",
    "and",
    "or",
    "rand",
    "srand_init",
    "for",
    "while",
    "return",
];

function getLearningEntryById(id) {
    return byId.get(id) ?? null;
}

function getLearningEntryByDictKey(dictKey) {
    return byDictKey.get(dictKey) ?? null;
}

function sortLearningEntries(entries) {
    return [...entries].sort((a, b) => {
        const ia = DISPLAY_ORDER.indexOf(a.id);
        const ib = DISPLAY_ORDER.indexOf(b.id);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
}

export {
    LEARNING_DICTIONARY,
    getLearningEntryById,
    getLearningEntryByDictKey,
    sortLearningEntries,
};
