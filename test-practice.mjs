// CodeBridge 練習モード（日本語 / C 両対応）テスト — node test-practice.mjs

import { evaluatePractice } from "./frontend/src/lib/practice.js";
import {
    detectPracticeLanguage,
    findMissingCommands,
    getAnswerCodeForLanguage,
} from "./frontend/src/lib/practiceLanguage.js";
import { comparePracticeCode } from "./frontend/src/lib/codeDiff.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (err) {
        console.error(`✗ ${name}`);
        console.error(`  ${err.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const helloPractice = {
    prompt: "Hello",
    hints: [],
    expectedCommands: ["表示"],
    expectedOutputIncludes: ["こんにちは"],
};

const sampleHello = {
    id: "hello",
    jpCode: '表示("こんにちは");',
    cCode: `#include <stdio.h>\nint main(void) {\n    printf("こんにちは\\n");\n    return 0;\n}`,
    practice: helloPractice,
};

console.log("=== 練習モード二言語テスト ===\n");

test("回答言語の自動判定（日本語）", () => {
    assert(detectPracticeLanguage('表示("こんにちは");') === "japanese", "japanese");
    assert(detectPracticeLanguage("整数 x;\nもし(xが0と等しい){}") === "japanese", "もし");
});

test("回答言語の自動判定（C言語）", () => {
    assert(detectPracticeLanguage('printf("hello\\n");') === "c", "printf");
    assert(detectPracticeLanguage("#include <stdio.h>\nint main(){}") === "c", "include");
});

test("回答言語の自動判定（unknown）", () => {
    assert(detectPracticeLanguage("x = 1;") === "unknown", "unknown");
    assert(detectPracticeLanguage("") === "unknown", "empty");
});

test("日本語コードで正解", () => {
    const result = evaluatePractice({
        code: '表示("こんにちは");',
        practice: helloPractice,
        language: "japanese",
        runResult: { status: "success", output: "こんにちは\n" },
    });
    assert(result.level === "success", "success");
    assert(result.language === "japanese", "lang");
    assert(result.message.includes("日本語コードで正解"), result.message);
});

test("C言語コードで正解", () => {
    const result = evaluatePractice({
        code: 'printf("こんにちは\\n");',
        practice: helloPractice,
        language: "c",
        runResult: { status: "success", output: "こんにちは\n" },
    });
    assert(result.level === "success", "success");
    assert(result.language === "c", "lang");
    assert(result.message.includes("C言語コードで正解"), result.message);
    assert(findMissingCommands(["表示"], 'printf("x");', "c").length === 0, "printf maps 表示");
});

test("日本語コードの実行失敗", () => {
    const result = evaluatePractice({
        code: '表示("こんにちは");',
        practice: helloPractice,
        language: "japanese",
        runResult: { status: "compile_error", output: "" },
    });
    assert(result.level === "run", "run level");
    assert(!result.runnable, "not runnable");
});

test("C言語コードのコンパイル失敗", () => {
    const result = evaluatePractice({
        code: "printf(",
        practice: helloPractice,
        language: "c",
        runResult: { status: "compile_error", output: "" },
    });
    assert(result.level === "run", "run");
    assert(result.message.includes("C言語"), result.message);
});

test("出力不一致", () => {
    const result = evaluatePractice({
        code: '表示("hello");',
        practice: helloPractice,
        language: "japanese",
        runResult: { status: "success", output: "hello\n" },
    });
    assert(result.level === "output", "output");
    assert(!result.outputOk, "outputOk false");
});

test("出力は正しいが命令不足 → 別の書き方", () => {
    const result = evaluatePractice({
        code: "puts(\"こんにちは\");",
        practice: helloPractice,
        language: "c",
        runResult: { status: "success", output: "こんにちは\n" },
    });
    assert(result.level === "success", "still success");
    assert(result.alternateStyle === true, "alternateStyle");
    assert(result.message.includes("別の書き方"), result.message);
});

test("日本語回答は jpCode と比較", () => {
    const result = comparePracticeCode('表示("こんにちは");', sampleHello, "japanese");
    assert(result.language === "japanese", "lang");
    assert(result.answerCode.includes("表示"), "jp answer");
    assert(result.isExactMatch, "match");
});

test("C言語回答は cCode と比較", () => {
    const user = sampleHello.cCode;
    const result = comparePracticeCode(user, sampleHello, "c");
    assert(result.language === "c", "lang");
    assert(result.answerCode.includes("printf"), "c answer");
    assert(result.isExactMatch, "match");
});

test("getAnswerCodeForLanguage", () => {
    assert(getAnswerCodeForLanguage(sampleHello, "japanese").includes("表示"), "jp");
    assert(getAnswerCodeForLanguage(sampleHello, "c").includes("printf"), "c");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
