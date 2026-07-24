// Terminal 整形テスト — node test-terminal-format.mjs

import {
    splitConsoleIntoLines,
    buildRunTerminalLines,
    buildProblemEntries,
    stripAnsi,
} from "./frontend/src/lib/terminalFormat.js";

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

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

console.log("=== Terminal 整形テスト ===\n");

test("入力行と出力行を区別する", () => {
    const lines = splitConsoleIntoLines("1つ目\n> 10\n合計:10\n");
    assert(lines[0].kind === "output" && lines[0].text === "1つ目", "output");
    assert(lines[1].kind === "input" && lines[1].text.startsWith(">"), "input");
    assert(lines[2].kind === "output", "output2");
});

test("ANSI を除去する", () => {
    assert(stripAnsi("\u001b[31merr\u001b[0m") === "err", "strip");
});

test("実行セッションに終了コードと時間を付ける", () => {
    const lines = buildRunTerminalLines({
        consoleText: "hello\n> 1\n",
        status: "success",
        exitCode: 0,
        elapsedMs: 12,
    });
    assert(lines.some((l) => l.text.includes("終了コード: 0")), "exit");
    assert(lines.some((l) => l.text.includes("実行時間:")), "time");
    assert(lines.some((l) => l.kind === "input"), "input kind");
});

test("Problems エントリを作る", () => {
    const items = buildProblemEntries(
        [{ line: 3, messageJa: "expected ';'" }],
        [{ line: 3, message: "expected ';'", severity: "error" }],
        "compile_error",
        "compile failed"
    );
    assert(items.length >= 1, "has items");
    assert(items[0].line === 3, "line");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
