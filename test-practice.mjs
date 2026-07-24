// CodeBridge 練習モード（テストケース採点）テスト — node test-practice.mjs

import {
    evaluatePractice,
    gradePracticeSubmission,
    resolvePracticeTestCases,
    explainPracticeRunError,
} from "./frontend/src/lib/practice.js";
import { matchExpectedOutput, normalizeDigits } from "./frontend/src/lib/outputMatch.js";
import {
    detectPracticeLanguage,
    findMissingCommands,
    getAnswerCodeForLanguage,
} from "./frontend/src/lib/practiceLanguage.js";
import { comparePracticeCode, compareCodeLines } from "./frontend/src/lib/codeDiff.js";
import { CODEBRIDGE_SAMPLES } from "./shared/samples.js";

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
    outputPolicy: "flexible",
    testCases: [
        {
            label: "基本",
            stdin: "",
            expectedOutput: { includes: ["こんにちは"] },
        },
    ],
};

const sampleHello = {
    id: "hello",
    jpCode: '表示("こんにちは");',
    cCode: `#include <stdio.h>\nint main(void) {\n    printf("こんにちは\\n");\n    return 0;\n}`,
    practice: helloPractice,
    stdinExamples: [{ stdin: "", expectStatus: "success" }],
};

console.log("=== 練習モード二言語・採点テスト ===\n");

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

test("日本語コードで正解（単一実行評価）", () => {
    const result = evaluatePractice({
        code: '表示("こんにちは");',
        practice: helloPractice,
        language: "japanese",
        runResult: { status: "success", output: "こんにちは\n" },
    });
    assert(result.level === "success", "success");
    assert(result.language === "japanese", "lang");
    assert(result.message.includes("正しく動作"), result.message);
});

test("C言語コードで正解（単一実行評価）", () => {
    const result = evaluatePractice({
        code: 'printf("こんにちは\\n");',
        practice: helloPractice,
        language: "c",
        runResult: { status: "success", output: "こんにちは\n" },
    });
    assert(result.level === "success", "success");
    assert(result.language === "c", "lang");
    assert(findMissingCommands(["表示"], 'printf("x");', "c").length === 0, "printf maps 表示");
});

test("コンパイル失敗の説明が日本語", () => {
    const msg = explainPracticeRunError("compile_error", "japanese");
    assert(msg.includes("コンパイルエラー"), msg);
    assert(msg.includes("よくある原因"), msg);
});

test("出力不一致（単一実行）", () => {
    const result = evaluatePractice({
        code: '表示("hello");',
        practice: helloPractice,
        language: "japanese",
        runResult: { status: "success", output: "hello\n" },
    });
    assert(result.level === "output", "output");
    assert(!result.outputOk, "outputOk false");
});

test("flexible は全角数字を許容", () => {
    const match = matchExpectedOutput("３つ目\n", { includes: ["3つ目"] }, "flexible");
    assert(match.ok, "flexible should accept fullwidth digits");
    assert(normalizeDigits("３") === "3", "normalize");
});

test("strict は全角数字を許容しない", () => {
    const match = matchExpectedOutput("３つ目\n", { includes: ["3つ目"] }, "strict");
    assert(!match.ok, "strict should reject fullwidth");
});

test("提出採点 9件中7件 → 78点", () => {
    const practice = {
        ...helloPractice,
        testCases: Array.from({ length: 9 }, (_, i) => ({
            label: `ケース${i + 1}`,
            stdin: "",
            expectedOutput: { includes: ["OK"] },
        })),
    };
    const caseResults = practice.testCases.map((testCase, i) => ({
        testCase,
        status: "success",
        output: i < 7 ? "OK\n" : "NG\n",
    }));
    const grade = gradePracticeSubmission({
        code: '表示("OK");',
        sample: { ...sampleHello, practice },
        practice,
        language: "japanese",
        caseResults,
    });
    assert(grade.passedCount === 7, `passed ${grade.passedCount}`);
    assert(grade.totalCount === 9, "total 9");
    assert(grade.score === 78, `score ${grade.score}`);
    assert(!grade.cleared, "not cleared");
});

test("提出採点 全合格で100点", () => {
    const cases = resolvePracticeTestCases(sampleHello);
    const caseResults = cases.map((testCase) => ({
        testCase,
        status: "success",
        output: "こんにちは\n",
    }));
    const grade = gradePracticeSubmission({
        code: '表示("こんにちは");',
        sample: sampleHello,
        practice: helloPractice,
        language: "japanese",
        caseResults,
    });
    assert(grade.score === 100, `score ${grade.score}`);
    assert(grade.cleared, "cleared");
    assert(grade.compileOk && grade.runOk && grade.outputOk, "checks");
    assert(grade.requirementsOk, "requirements");
});

test("必須要件不足でもテスト全通ならクリア（別の書き方）", () => {
    const grade = gradePracticeSubmission({
        code: 'puts("こんにちは");',
        sample: sampleHello,
        practice: helloPractice,
        language: "c",
        caseResults: [
            {
                testCase: helloPractice.testCases[0],
                status: "success",
                output: "こんにちは\n",
            },
        ],
    });
    assert(grade.cleared, "cleared by tests");
    assert(grade.alternateStyle, "alternate");
    assert(!grade.requirementsOk, "requirements soft fail");
});

test("空行の違いでは差分にならない", () => {
    const user = '表示("A");\n\n整数 x = 1;';
    const answer = '表示("A");\n整数 x = 1;';
    const result = compareCodeLines(user, answer);
    assert(result.isExactMatch, "blank lines ignored");
});

test("インデントの違いでは差分にならない", () => {
    const user = 'もし(xが0と等しい){\n表示("A");\n}';
    const answer = 'もし(xが0と等しい){\n    表示("A");\n}';
    const result = compareCodeLines(user, answer);
    assert(result.isExactMatch, "indent ignored");
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

test("全サンプルにテストケースを解決できる", () => {
    for (const sample of CODEBRIDGE_SAMPLES) {
        if (!sample.practice) continue;
        const cases = resolvePracticeTestCases(sample);
        assert(cases.length > 0, `${sample.id} has cases`);
        for (const tc of cases) {
            assert(typeof tc.stdin === "string", `${sample.id} stdin`);
            assert(tc.expectedOutput, `${sample.id} expected`);
        }
    }
});

test("じゃんけんは複数テストケース", () => {
    const janken = CODEBRIDGE_SAMPLES.find((s) => s.id === "janken");
    assert(janken?.practice, "janken practice");
    const cases = resolvePracticeTestCases(janken);
    assert(cases.length >= 9, `janken cases ${cases.length}`);
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
