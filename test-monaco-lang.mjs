// Monaco / codebridge-jp 言語定義テスト — node test-monaco-lang.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
    CODEBRIDGE_JP_LANGUAGE_ID,
    ensureCodebridgeJpLanguage,
} from "./frontend/src/lib/monacoCodebridgeJp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

console.log("=== Monaco / codebridge-jp テスト ===\n");

test("言語 ID が codebridge-jp", () => {
    assert(CODEBRIDGE_JP_LANGUAGE_ID === "codebridge-jp", "id");
});

test("定義ファイルにキーワードが含まれる", () => {
    const src = fs.readFileSync(
        path.join(__dirname, "frontend/src/lib/monacoCodebridgeJp.js"),
        "utf8"
    );
    for (const kw of [
        "表示",
        "続けて表示",
        "入力",
        "もし",
        "そうでなくもし",
        "そうでなければ",
        "繰り返し",
        "乱数初期化",
        "かつ",
        "または",
        "と等しい",
    ]) {
        assert(src.includes(kw), `keyword ${kw}`);
    }
});

test("ensureCodebridgeJpLanguage が monaco mock で登録する", () => {
    const languages = [];
    const providers = [];
    const configs = [];
    const monaco = {
        languages: {
            getLanguages: () => languages.map((id) => ({ id })),
            register: ({ id }) => {
                languages.push(id);
            },
            setMonarchTokensProvider: (id, provider) => {
                providers.push({ id, provider });
            },
            setLanguageConfiguration: (id, config) => {
                configs.push({ id, config });
            },
        },
    };

    // リセット用に再インポートは難しいので、未登録の mock で一度だけ
    ensureCodebridgeJpLanguage(monaco);
    assert(languages.includes("codebridge-jp"), "registered");
    assert(providers.some((p) => p.id === "codebridge-jp"), "tokenizer");
    assert(
        configs.some((c) => c.config?.autoClosingPairs?.length > 0),
        "autoClosingPairs"
    );
});

test("CodeBridgeMonaco コンポーネントが存在する", () => {
    const src = fs.readFileSync(
        path.join(__dirname, "frontend/src/components/CodeBridgeMonaco.jsx"),
        "utf8"
    );
    assert(src.includes("@monaco-editor/react"), "import");
    assert(src.includes("monacoSetup"), "local setup");
    assert(src.includes("minimap"), "minimap off");
    assert(src.includes("automaticLayout"), "layout");
});

test("JapaneseEditor が Monaco を使う", () => {
    const src = fs.readFileSync(
        path.join(__dirname, "frontend/src/components/JapaneseEditor.jsx"),
        "utf8"
    );
    assert(src.includes("CodeBridgeMonaco"), "monaco wrapper");
    assert(!src.includes('from "../lib/editorAssist'), "no editorAssist import");
});

test("CCodePreview が readOnly Monaco", () => {
    const src = fs.readFileSync(
        path.join(__dirname, "frontend/src/components/CCodePreview.jsx"),
        "utf8"
    );
    assert(src.includes("readOnly"), "readonly");
    assert(src.includes("CodeBridgeMonaco"), "monaco");
});

test("PracticePanel が sticky 言語切替を持つ", () => {
    const src = fs.readFileSync(
        path.join(__dirname, "frontend/src/components/PracticePanel.jsx"),
        "utf8"
    );
    assert(src.includes("stickyAutoLang"), "sticky");
    assert(src.includes("languageMode"), "manual mode");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
