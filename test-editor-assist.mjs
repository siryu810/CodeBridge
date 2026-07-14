// CodeBridge エディタ補助テスト — node test-editor-assist.mjs

import {
    handleAutoPair,
    handleClosingSkip,
    handleSmartEnter,
    handleClosingBraceIndent,
    getLineIndent,
    getBracketMatchAtCursor,
    findMatchingBracket,
    handleEditorKeyDown,
    EDITOR_TAB,
} from "./frontend/src/lib/editorAssist.js";

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

console.log("=== エディタ補助テスト ===\n");

test("( → ()", () => {
    const r = handleAutoPair("", 0, 0, "(");
    assert(r.value === "()", `got ${r.value}`);
    assert(r.cursor === 1, "cursor in middle");
});

test("{ → {}", () => {
    const r = handleAutoPair("if", 2, 2, "{");
    assert(r.value === "if{}", `got ${r.value}`);
    assert(r.cursor === 3);
});

test('" → ""', () => {
    const r = handleAutoPair("表示(", 3, 3, '"');
    assert(r.value === "表示(\"\"", `got ${JSON.stringify(r.value)}`);
    assert(r.cursor === 4);
});

test("閉じ括弧の重複防止（スキップ）", () => {
    const r = handleClosingSkip("()", 1, 1, ")");
    assert(r.value === "()", "no insert");
    assert(r.cursor === 2, "move past");
});

test("既に閉じがあるとき開きのみ（重複閉じなし）", () => {
    // after = ")" already — shouldSkipPairInsert → open only
    const r = handleAutoPair("x)", 1, 1, "(");
    assert(r.value === "x()", `got ${r.value}`);
    assert(r.cursor === 2);
});

test("{ の後の Enter で改行＋インデント＋ }", () => {
    const src = "もし(x){";
    const r = handleSmartEnter(src, src.length, src.length);
    assert(r.value.includes("{\n" + EDITOR_TAB + "\n}"), `got ${JSON.stringify(r.value)}`);
    assert(r.cursor === src.length + 1 + EDITOR_TAB.length);
});

test("既に } がある場合は重複追加しない", () => {
    const src = "もし(x){";
    const full = src + "\n}";
    const r = handleSmartEnter(full, src.length, src.length);
    assert(!r.value.includes("}\n}"), `no duplicate: ${JSON.stringify(r.value)}`);
    assert(r.value.includes("{\n" + EDITOR_TAB), "indents");
});

test("通常 Enter でインデント継承", () => {
    const src = "    表示(x);";
    const r = handleSmartEnter(src, src.length, src.length);
    assert(r.value === src + "\n    ", `got ${JSON.stringify(r.value)}`);
});

test("getLineIndent", () => {
    assert(getLineIndent("    foo") === "    ");
    assert(getLineIndent("bar") === "");
});

test("対応括弧検出", () => {
    const text = "if(a){ return; }";
    const openIdx = text.indexOf("{");
    const closeIdx = text.lastIndexOf("}");
    assert(findMatchingBracket(text, openIdx, 1) === closeIdx, "find close");
    const match = getBracketMatchAtCursor(text, openIdx + 1);
    assert(match && match.open === openIdx && match.close === closeIdx, "cursor match");
});

test("() の対応括弧検出", () => {
    const text = "表示(x);";
    const open = text.indexOf("(");
    const close = text.indexOf(")");
    const match = getBracketMatchAtCursor(text, open);
    assert(match.open === open && match.close === close, "paren pair");
});

test("} でインデントを戻す", () => {
    const src = "if(x){\n" + EDITOR_TAB;
    const r = handleClosingBraceIndent(src, src.length, src.length);
    assert(r.value.endsWith("\n}"), `got ${JSON.stringify(r.value)}`);
});

test("handleEditorKeyDown が ( を処理する", () => {
    const evt = { key: "(", preventDefault() {} };
    const r = handleEditorKeyDown(evt, { value: "", selectionStart: 0, selectionEnd: 0 });
    assert(r && r.value === "()", "paired");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
