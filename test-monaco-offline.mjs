// Monaco オフライン／CDN 非依存チェック — node test-monaco-offline.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;

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

function read(rel) {
    return fs.readFileSync(path.join(root, rel), "utf8");
}

const CDN_PATTERNS = [
    /https?:\/\/cdn\.jsdelivr\.net/i,
    /https?:\/\/unpkg\.com/i,
    /https?:\/\/cdnjs\.cloudflare\.com/i,
    /https?:\/\/[^"'`\s]*monaco-editor[^"'`\s]*/i,
    /paths:\s*\{\s*vs:\s*["']https?:\/\//i,
];

const SCAN_FILES = [
    "frontend/src/main.jsx",
    "frontend/src/lib/monacoSetup.js",
    "frontend/src/components/CodeBridgeMonaco.jsx",
    "frontend/src/components/JapaneseEditor.jsx",
    "frontend/src/components/CCodePreview.jsx",
    "frontend/src/components/PracticePanel.jsx",
    "frontend/src/components/EditorView.jsx",
    "frontend/vite.config.js",
    "frontend/index.html",
];

console.log("=== Monaco オフライン構成テスト ===\n");

test("monacoSetup がローカル monaco-editor を使う", () => {
    const src = read("frontend/src/lib/monacoSetup.js");
    assert(
        src.includes("monaco-editor/esm/vs/editor/editor.api") ||
            src.includes('from "monaco-editor"'),
        "import monaco-editor"
    );
    assert(src.includes("loader.config({ monaco })"), "loader.config monaco");
    assert(src.includes("editor.worker?worker"), "local worker");
    assert(src.includes("MonacoEnvironment"), "MonacoEnvironment");
    assert(src.includes("cpp.contribution"), "c language contribution");
    assert(!/cdn\.jsdelivr\.net|unpkg\.com/i.test(src), "no CDN in setup");
});

test("main.jsx が monacoSetup を先に読み込む", () => {
    const src = read("frontend/src/main.jsx");
    const setupIdx = src.indexOf("monacoSetup");
    const appIdx = src.indexOf("./App");
    assert(setupIdx >= 0, "monacoSetup import");
    assert(appIdx > setupIdx, "setup before App");
});

test("フロントソースに Monaco CDN URL が無い", () => {
    for (const rel of SCAN_FILES) {
        const abs = path.join(root, rel);
        if (!fs.existsSync(abs)) continue;
        const src = read(rel);
        for (const re of CDN_PATTERNS) {
            assert(!re.test(src), `${rel} matches ${re}`);
        }
    }
});

test("CodeBridgeMonaco がフォールバック UI を持つ", () => {
    const src = read("frontend/src/components/CodeBridgeMonaco.jsx");
    assert(src.includes("MonacoErrorBoundary"), "error boundary");
    assert(src.includes("読み込みに失敗"), "fallback message");
    assert(src.includes("monacoSetup"), "uses local setup");
});

test("練習・プレビューが Monaco を使用", () => {
    assert(
        read("frontend/src/components/CCodePreview.jsx").includes("readOnly"),
        "preview readonly"
    );
    assert(
        read("frontend/src/components/PracticePanel.jsx").includes("JapaneseEditor"),
        "practice editor"
    );
    assert(
        read("frontend/src/components/JapaneseEditor.jsx").includes("CodeBridgeMonaco"),
        "jp editor monaco"
    );
});

test("旧 mirror CSS が削除されている", () => {
    const css = read("frontend/src/App.css");
    assert(!css.includes("code-editor-mirror"), "no mirror");
    assert(!css.includes("bracket-match"), "no old bracket-match");
    assert(css.includes("cb-monaco"), "monaco styles remain");
    assert(css.includes("practice-stdin"), "stdin textarea styles remain");
});

test("package.json に monaco-editor 直接依存がある", () => {
    const pkg = JSON.parse(read("frontend/package.json"));
    assert(pkg.dependencies?.["monaco-editor"], "monaco-editor dep");
    assert(pkg.dependencies?.["@monaco-editor/react"], "react wrapper dep");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
