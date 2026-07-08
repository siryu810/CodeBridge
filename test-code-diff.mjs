// CodeBridge 日本語コード比較テスト — node test-code-diff.mjs

import { compareJapaneseCode } from "./frontend/src/lib/codeDiff.js";

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

console.log("=== 日本語コード比較テスト ===\n");

test("完全一致", () => {
    const user = '表示("こんにちは");\n整数 x = 1;';
    const answer = '表示("こんにちは");\n整数 x = 1;';
    const result = compareJapaneseCode(user, answer);
    assert(result.isExactMatch, "isExactMatch が true であること");
    assert(result.rows.every((r) => r.type === "same"), "すべて same であること");
});

test("セミコロン不足", () => {
    const user = '表示("こんにちは")';
    const answer = '表示("こんにちは");';
    const result = compareJapaneseCode(user, answer);
    assert(!result.isExactMatch, "完全一致ではないこと");
    const changed = result.rows.find((r) => r.type === "changed");
    assert(changed, "changed 行があること");
    assert(
        changed.message.includes(";") || changed.message.includes("不足"),
        "セミコロンに関するメッセージがあること"
    );
    assert(
        result.hints.some((h) => h.includes(";")),
        "ヒントにセミコロンが含まれること"
    );
});

test("行不足", () => {
    const user = '表示("こんにちは");';
    const answer = '表示("こんにちは");\n表示("さようなら");';
    const result = compareJapaneseCode(user, answer);
    assert(!result.isExactMatch, "完全一致ではないこと");
    const missing = result.rows.find((r) => r.type === "missing");
    assert(missing, "missing 行があること");
    assert(missing.answerLine.includes("さようなら"), "不足行が検出されること");
});

test("余分な行", () => {
    const user = '表示("こんにちは");\n表示("おまけ");';
    const answer = '表示("こんにちは");';
    const result = compareJapaneseCode(user, answer);
    assert(!result.isExactMatch, "完全一致ではないこと");
    const extra = result.rows.find((r) => r.type === "extra");
    assert(extra, "extra 行があること");
    assert(extra.userLine.includes("おまけ"), "余分な行が検出されること");
});

test("違う条件式", () => {
    const user = "もし(xが1と等しい){ 表示(\"A\"); }";
    const answer = "もし(xが2と等しい){ 表示(\"B\"); }";
    const result = compareJapaneseCode(user, answer);
    assert(!result.isExactMatch, "完全一致ではないこと");
    const changed = result.rows.find((r) => r.type === "changed");
    assert(changed, "changed 行があること");
    assert(changed.label === "違い", "ラベルが違いであること");
});

test("空の回答", () => {
    const user = "";
    const answer = '表示("こんにちは");\n整数 n;';
    const result = compareJapaneseCode(user, answer);
    assert(!result.isExactMatch, "完全一致ではないこと");
    assert(result.rows.length >= 2, "不足行が複数あること");
    assert(result.rows.every((r) => r.type === "missing"), "すべて missing であること");
    assert(result.hints.length > 0, "ヒントがあること");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
