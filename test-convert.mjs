// CodeBridge 変換テスト — node test-convert.mjs

import CodeBridgeJp2c from "./shared/jp2c.js";
import CodeBridgeC2jp from "./shared/c2jp.js";
import { CODEBRIDGE_SAMPLES } from "./shared/samples.js";

const { convertJapaneseToC } = CodeBridgeJp2c;
const { convertCToJapanese } = CodeBridgeC2jp;

const jp2cTests = [
    {
        name: '表示("文字列")',
        source: '表示("こんにちは");',
        expectInBody: ['printf("こんにちは\\n");'],
    },
    {
        name: "表示(整数変数)",
        source: "整数 x;\n表示(x);",
        expectInBody: ['printf("%d\\n", x);'],
        expectNotInBody: ["printf(x)"],
    },
    {
        name: "表示(小数変数)",
        source: "小数 y;\n表示(y);",
        expectInBody: ['printf("%.2f\\n", y);'],
    },
    {
        name: "入力(整数)",
        source: "整数 n;\n入力(n);",
        expectInBody: ["int n;", 'scanf("%d", &n);'],
    },
    {
        name: "入力(小数)",
        source: "小数 y;\n入力(y);",
        expectInBody: ['scanf("%lf", &y);'],
    },
    {
        name: "入力(文字)",
        source: "文字 c;\n入力(c);",
        expectInBody: ['scanf(" %c", &c);'],
    },
    {
        name: "もし",
        source: 'もし(xが1と等しい){ 表示("OK"); }',
        expectInBody: ["if(x == 1)"],
    },
    {
        name: "そうでなくもし",
        source: "そうでなくもし(xが2と等しい){ }",
        expectInBody: ["else if(x == 2)"],
    },
    {
        name: "そうでなければ",
        source: "そうでなければ{ }",
        expectInBody: ["else"],
    },
    {
        name: "かつ",
        source: "もし(aが1と等しい かつ bが2と等しい){ }",
        expectInBody: ["&&"],
    },
    {
        name: "または",
        source: "もし(aが1と等しい または bが2と等しい){ }",
        expectInBody: ["||"],
    },
    {
        name: "乱数()",
        source: "整数 r = 乱数() % 3;",
        expectInBody: ["rand() % 3"],
        expectInProgram: ["#include <stdlib.h>"],
    },
    {
        name: "乱数初期化()",
        source: "乱数初期化();",
        expectInBody: ["srand((unsigned int)time(NULL));"],
        expectInProgram: ["#include <time.h>"],
    },
    {
        name: "続けて表示は改行なし",
        source: '続けて表示("あなたの手: ");\n表示("チョキ");',
        expectInBody: ['printf("あなたの手: ");', 'printf("チョキ\\n");'],
        expectNotInBody: ['printf("あなたの手: \\n");'],
    },
    {
        name: '表示("入力案内")は改行あり',
        source: '表示("身長(cm)を入力");',
        expectInBody: ['printf("身長(cm)を入力\\n");'],
        expectNotInBody: ['printf("身長(cm)を入力");'],
    },
];

const c2jpTests = [
    {
        name: "printf 改行なし → 続けて表示",
        source: 'printf("あなたの手: ");',
        expectInBody: ['続けて表示("あなたの手: ");'],
    },
    {
        name: "printf 改行あり → 表示",
        source: 'printf("身長(cm)を入力\\n");',
        expectInBody: ['表示("身長(cm)を入力");'],
    },
    {
        name: "printf → 表示",
        source: 'printf("こんにちは\\n");',
        expectInBody: ['表示("こんにちは");'],
    },
    {
        name: "int → 整数",
        source: "int player;",
        expectInBody: ["整数 player;"],
    },
    {
        name: "double → 小数",
        source: "double height;",
        expectInBody: ["小数 height;"],
    },
    {
        name: "char → 文字",
        source: "char c;",
        expectInBody: ["文字 c;"],
    },
    {
        name: "scanf → 入力",
        source: 'scanf("%d", &player);',
        expectInBody: ["入力(player);"],
    },
    {
        name: "if / else if / else",
        source: "if(player == CPU){\n}else if(player == 1){\n}else{",
        expectInBody: ["もし(playerがCPUと等しい)", "そうでなくもし", "そうでなければ"],
    },
    {
        name: "rand → 乱数",
        source: "int CPU = rand() % 3;",
        expectInBody: ["乱数() % 3"],
    },
    {
        name: "srand → 乱数初期化",
        source: "srand((unsigned int)time(NULL));",
        expectInBody: ["乱数初期化();"],
    },
    {
        name: "return 0 は本体表示から除外",
        source: `int main(void) {
    printf("こんにちは\\n");
    return 0;
}`,
        expectInBody: ['表示("こんにちは");'],
        expectNotInBody: ["戻る", "return 0", "int main"],
    },
    {
        name: "#include が誤変換されない",
        source: `#include <stdio.h>

int main(void) {
    int score;
    scanf("%d", &score);

    if(score >= 60){
        printf("合格");
    }

    return 0;
}`,
        expectInBody: ["整数 score;", "入力(score);", "もし(scoreが60以上)", '表示("合格")'],
        expectNotInBody: [
            "#include",
            "stdio",
            "より小さい.h",
            "int main",
            "戻る",
            "return 0",
        ],
    },
    {
        name: "if(score < 60) → scoreが60より小さい",
        source: `#include <stdio.h>

int main(void) {
    if(score < 60){
        printf("不合格");
    }
    return 0;
}`,
        expectInBody: ["もし(scoreが60より小さい)", '表示("不合格")'],
        expectNotInBody: ["#include", "より小さい.h", "int main", "return 0"],
    },
];

let passed = 0;
let failed = 0;

function assertContains(text, snippet, label) {
    if (!text.includes(snippet)) {
        throw new Error(`${label}: "${snippet}" が含まれません\n---\n${text}\n---`);
    }
}

function assertNotContains(text, snippet, label) {
    if (text.includes(snippet)) {
        throw new Error(`${label}: "${snippet}" が含まれてはいけません`);
    }
}

function runSuite(title, tests, runOne) {
    console.log(`=== ${title} ===\n`);
    for (const test of tests) {
        try {
            runOne(test);
            console.log(`✓ ${test.name}`);
            passed++;
        } catch (err) {
            console.error(`✗ ${test.name}`);
            console.error(`  ${err.message}`);
            failed++;
        }
    }
    console.log("");
}

runSuite("日本語 → C 変換テスト", jp2cTests, (test) => {
    const result = convertJapaneseToC(test.source);
    for (const text of test.expectInBody ?? []) assertContains(result.body, text, test.name);
    for (const text of test.expectInProgram ?? []) assertContains(result.program, text, test.name);
    for (const text of test.expectNotInBody ?? []) assertNotContains(result.body, text, test.name);
    if (result.warnings.length > 0) {
        throw new Error(`警告: ${result.warnings.map((w) => w.messageJa).join(", ")}`);
    }
});

runSuite("C言語 → 日本語 変換テスト", c2jpTests, (test) => {
    const result = convertCToJapanese(test.source);
    for (const text of test.expectInBody ?? []) assertContains(result.body, text, test.name);
    for (const text of test.expectNotInBody ?? []) assertNotContains(result.body, text, test.name);
    if (result.warnings.length > 0) {
        throw new Error(`警告: ${result.warnings.map((w) => w.messageJa).join(", ")}`);
    }
});

console.log("=== 変換エンジン安全化 ===\n");
try {
    const broken = convertJapaneseToC(null);
    if (!Array.isArray(broken.warnings) || typeof broken.program !== "string") {
        throw new Error("null 入力で不正な戻り値");
    }
    console.log("✓ 日本語変換は例外で落ちない");
    passed++;
} catch (err) {
    console.error("✗ 日本語変換は例外で落ちない");
    console.error(`  ${err.message}`);
    failed++;
}

try {
    const brokenC = convertCToJapanese(null);
    if (!Array.isArray(brokenC.warnings) || typeof brokenC.program !== "string") {
        throw new Error("null 入力で不正な戻り値");
    }
    console.log("✓ C→日本語変換は例外で落ちない");
    passed++;
} catch (err) {
    console.error("✗ C→日本語変換は例外で落ちない");
    console.error(`  ${err.message}`);
    failed++;
}
console.log("");

console.log("=== サンプル一括変換 ===\n");
for (const sample of CODEBRIDGE_SAMPLES) {
    try {
        const jp = sample.jpCode ?? sample.code;
        const result = convertJapaneseToC(jp);
        if (!result.program || !result.program.includes("int main")) {
            throw new Error("main を含む C プログラムが生成されません");
        }
        if (result.warnings.length > 0) {
            throw new Error(result.warnings.map((w) => w.messageJa).join("; "));
        }
        if (/printf\s*\(\s*[^"%'][^,)]*\s*\)/.test(result.body)) {
            throw new Error("不正な printf が残っています");
        }
        if (/scanf\s*\(\s*[^"%'][^,)]*\s*\)/.test(result.body)) {
            throw new Error("不正な scanf が残っています");
        }
        if (result.body.includes("rand()") && !result.program.includes("#include <stdlib.h>")) {
            throw new Error("rand() 使用時に stdlib.h がありません");
        }
        if (
            result.body.includes("srand((unsigned int)time(NULL))") &&
            !result.program.includes("#include <time.h>")
        ) {
            throw new Error("乱数初期化() 使用時に time.h がありません");
        }
        if (sample.id === "janken") {
            if (!result.body.includes("srand((unsigned int)time(NULL))")) {
                throw new Error("じゃんけんに乱数初期化がありません");
            }
            if (!result.body.includes("rand() % 3")) {
                throw new Error("じゃんけんに乱数() % 3 がありません");
            }
        }
        const expectedC = sample.cCode?.trim();
        if (expectedC && expectedC !== result.program.trim()) {
            throw new Error("cCode が jpCode の変換結果と一致しません");
        }
        console.log(`✓ サンプル: ${sample.title}`);
        passed++;
    } catch (err) {
        console.error(`✗ サンプル: ${sample.title}`);
        console.error(`  ${err.message}`);
        failed++;
    }
}

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
