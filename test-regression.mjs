// CodeBridge 回帰テスト — node test-regression.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import CodeBridgeJp2c from "./shared/jp2c.js";
import CodeBridgeC2jp from "./shared/c2jp.js";
import { CODEBRIDGE_SAMPLES, HOME_FEATURED_SAMPLE_IDS, NEW_PROJECT_TEMPLATE } from "./shared/samples.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname);

let passed = 0;
let failed = 0;

function check(name, fn) {
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

function read(relPath) {
    return fs.readFileSync(path.join(root, relPath), "utf8");
}

function assertIncludes(haystack, needle, msg) {
    if (!haystack.includes(needle)) throw new Error(msg ?? `"${needle}" が見つかりません`);
}

console.log("=== 回帰テスト ===\n");

check("サンプル一覧が空でない", () => {
    if (!Array.isArray(CODEBRIDGE_SAMPLES) || CODEBRIDGE_SAMPLES.length < 7) {
        throw new Error(`サンプル数が不足: ${CODEBRIDGE_SAMPLES?.length ?? 0}`);
    }
});

check("ホーム注目サンプル ID が有効", () => {
    for (const id of HOME_FEATURED_SAMPLE_IDS) {
        if (!CODEBRIDGE_SAMPLES.find((s) => s.id === id)) {
            throw new Error(`不明な注目サンプル ID: ${id}`);
        }
    }
});

check("新規作成テンプレートが変換できる", () => {
    const result = CodeBridgeJp2c.convertJapaneseToC(NEW_PROJECT_TEMPLATE);
    if (!result.program.includes("printf")) throw new Error("変換結果が不正");
});

check("C言語 → 日本語モードが React に存在する", () => {
    const editor = read("frontend/src/components/EditorView.jsx");
    assertIncludes(editor, 'value="c2jp"', "c2jp ラジオ");
    assertIncludes(editor, "C言語 → 日本語", "モードラベル");
    assertIncludes(editor, "日本語 → C言語", "モードラベル");
});

check("実行ボタンが React に存在する", () => {
    assertIncludes(read("frontend/src/components/EditorView.jsx"), "▶ 実行", "実行ボタン");
});

check("新規作成がホームに存在する", () => {
    assertIncludes(read("frontend/src/components/HomeView.jsx"), "新規作成", "新規作成");
    assertIncludes(read("frontend/src/components/HomeView.jsx"), "home-primary-btn", "新規ボタン");
});

check("サンプル一覧コンポーネントが存在する", () => {
    assertIncludes(read("frontend/src/components/SampleList.jsx"), "CODEBRIDGE_SAMPLES", "サンプル参照");
});

check("じゃんけんに乱数初期化がある", () => {
    const janken = CODEBRIDGE_SAMPLES.find((s) => s.id === "janken");
    const result = CodeBridgeJp2c.convertJapaneseToC(janken.jpCode);
    assertIncludes(result.body, "srand((unsigned int)time(NULL))", "srand");
    assertIncludes(result.body, "rand() % 3", "rand mod 3");
});

check("双方向変換の基本往復（printf）", () => {
    const c = 'printf("test\\n");';
    const jp = CodeBridgeC2jp.convertCToJapanese(c).body;
    const back = CodeBridgeJp2c.convertJapaneseToC(jp).body;
    assertIncludes(back, 'printf("test\\n");', "往復変換");
});

check("server.js が internal_error を定義", () => {
    assertIncludes(read("server.js"), "internal_error", "internal_error");
    assertIncludes(read("server.js"), "buildInternalErrorResponse", "helper");
});

check("/run の catch で stack をログ出力", () => {
    const src = read("server.js");
    assertIncludes(src, "error.stack", "stack log");
});

check("空コードは compile_error で返す", () => {
    assertIncludes(read("server.js"), "buildEmptyCodeResponse", "empty code helper");
});

check("GET /health が status ok を返す", () => {
    const src = read("server.js");
    assertIncludes(src, 'app.get("/health"', "/health ルート");
    assertIncludes(src, 'status: "ok"', "status ok");
});

check("実行サーバー状態バナーが React に存在する", () => {
    assertIncludes(read("frontend/src/components/ServerStatusBanner.jsx"), "接続済み", "接続済み表示");
    assertIncludes(read("frontend/src/components/ServerStatusBanner.jsx"), "接続できません", "切断表示");
    assertIncludes(read("frontend/src/hooks/useServerHealth.js"), "POLL_INTERVAL_MS", "ポーリング間隔");
    assertIncludes(read("frontend/src/lib/serverHealth.js"), "/health", "health API");
});

check("runApi が internal_error を処理", () => {
    assertIncludes(read("frontend/src/lib/runApi.js"), "internal_error", "internal_error 分岐");
});

check("package.json に check スクリプト", () => {
    const pkg = JSON.parse(read("package.json"));
    if (!pkg.scripts?.check) throw new Error("npm run check がありません");
    if (!pkg.scripts?.test) throw new Error("npm test がありません");
    if (!pkg.scripts?.build) throw new Error("npm run build がありません");
    if (!pkg.scripts?.["validate-samples"]) throw new Error("validate-samples がありません");
});

check("学習辞書データが存在する", () => {
    assertIncludes(read("shared/learningDictionary.js"), "LEARNING_DICTIONARY", "辞書");
    assertIncludes(read("shared/learningDictionary.js"), 'id: "int"', "整数エントリ");
});

check("全サンプルに algorithmSteps がある", () => {
    for (const sample of CODEBRIDGE_SAMPLES) {
        if (!Array.isArray(sample.algorithmSteps) || sample.algorithmSteps.length === 0) {
            throw new Error(`${sample.title} に algorithmSteps がありません`);
        }
    }
});

check("全サンプルに必須メタデータがある", () => {
    for (const sample of CODEBRIDGE_SAMPLES) {
        if (!sample.jpCode?.trim()) throw new Error(`${sample.id}: jpCode がありません`);
        if (!sample.cCode?.trim()) throw new Error(`${sample.id}: cCode がありません`);
        if (!sample.category?.trim()) throw new Error(`${sample.id}: category がありません`);
        if (sample.difficulty == null) throw new Error(`${sample.id}: difficulty がありません`);
        if (!Array.isArray(sample.commands) || sample.commands.length === 0) {
            throw new Error(`${sample.id}: commands がありません`);
        }
        if (!sample.expectedOutput || typeof sample.expectedOutput !== "object") {
            throw new Error(`${sample.id}: expectedOutput がありません`);
        }
    }
});

check("サンプル検証スクリプトが存在する", () => {
    assertIncludes(read("scripts/validate-samples.mjs"), "SampleManager", "SampleManager 利用");
    assertIncludes(read("shared/sampleManager.js"), "validateSamples", "validateSamples");
    assertIncludes(read("shared/sampleManager.js"), "printSampleReport", "Sample Report");
});

check("エディタがモード別コードを保持する", () => {
    const app = read("frontend/src/App.jsx");
    assertIncludes(app, "jpCode", "jpCode state");
    assertIncludes(app, "cCode", "cCode state");
    const editor = read("frontend/src/components/EditorView.jsx");
    assertIncludes(editor, "editorMode === \"jp2c\" ? jpCode : cCode", "モード別エディタ");
});

check("IDE 固定レイアウトが React に存在する", () => {
    assertIncludes(read("frontend/src/components/EditorView.jsx"), "ide-shell", "IDE シェル");
    assertIncludes(read("frontend/src/components/EditorView.jsx"), "ide-bottom", "下部コンソール");
    assertIncludes(read("frontend/src/components/IdeSidePanel.jsx"), "ide-rail", "サイドレール");
    assertIncludes(read("frontend/src/components/EditorView.jsx"), "codeToRun", "実行コード分岐");
    assertIncludes(read("frontend/src/components/IdeWorkspaceSplit.jsx"), "ide-splitter", "リサイズ");
    assertIncludes(read("frontend/src/hooks/useIdeLayout.js"), "IDE_LAYOUT_PRESETS", "レイアウトプリセット");
    const css = read("frontend/src/App.css");
    assertIncludes(css, "ide-workspace", "ワークスペース");
    assertIncludes(css, "100dvh", "100dvh 固定");
    assertIncludes(css, "console-panel", "コンソールパネル");
    assertIncludes(css, "runtime-input-panel", "実行時入力パネル");
    assertIncludes(css, "flex: 1 1 auto", "ワークスペース伸縮");
    assertIncludes(css, "flex: 0 0 auto", "下部パネル自然配置");
});

check("命令辞書モーダルが React に存在する", () => {
    assertIncludes(read("frontend/src/components/CommandDictionaryModal.jsx"), "dict-modal", "モーダル");
    assertIncludes(read("frontend/src/components/LearningPanel.jsx"), "onSelectEntry", "クリック");
});

check("レガシー UI に双方向モード", () => {
    assertIncludes(read("top.html"), 'value="c2jp"', "c2jp");
    assertIncludes(read("top.html"), "js/c2jp.js", "c2jp スクリプト");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
