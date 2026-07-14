// 主要ファイルの構文チェック — node scripts/check-syntax.mjs

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = [
    "server.js",
    "shared/jp2c.js",
    "shared/c2jp.js",
    "shared/learningDictionary.js",
    "shared/samples.js",
    "shared/samplePractice.js",
    "frontend/src/lib/progress.js",
    "frontend/src/lib/codeDiff.js",
    "frontend/src/lib/practice.js",
    "frontend/src/lib/practiceLanguage.js",
    "frontend/src/lib/editorAssist.js",
    "frontend/src/lib/monacoCodebridgeJp.js",
    "frontend/src/lib/monacoMarkers.js",
    "frontend/src/lib/monacoSetup.js",
    "test-practice.mjs",
    "test-editor-assist.mjs",
    "test-monaco-lang.mjs",
    "test-monaco-offline.mjs",
    "shared/learningRoadmap.js",
    "shared/roadmapManager.js",
    "test-roadmap.mjs",
    "test-convert.mjs",
    "test-run.mjs",
    "test-regression.mjs",
    "shared/sampleManager.js",
    "scripts/validate-samples.mjs",
    "scripts/final-check.mjs",
    "shared/sampleSchema.js",
];

let failed = 0;

for (const rel of files) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
        console.error(`✗ ファイルがありません: ${rel}`);
        failed++;
        continue;
    }
    try {
        execFileSync(process.execPath, ["--check", abs], { stdio: "pipe" });
        console.log(`✓ ${rel}`);
    } catch (err) {
        console.error(`✗ ${rel}`);
        console.error(err.stderr?.toString() || err.message);
        failed++;
    }
}

if (failed > 0) {
    console.error(`\n構文チェック失敗: ${failed} 件`);
    process.exit(1);
}

console.log("\n構文チェック: すべて OK");
