// CodeBridge 実行テスト — node test-run.mjs（gcc 必須）

import { createRequire } from "module";
import CodeBridgeJp2c from "./shared/jp2c.js";
import { CODEBRIDGE_SAMPLES } from "./shared/samples.js";

const require = createRequire(import.meta.url);
const { executeCCode, isGccReady } = require("./server.js");

const { convertJapaneseToC } = CodeBridgeJp2c;

/** サンプルごとの実行時入力（空文字 = 入力待ちを期待） */
const SAMPLE_STDIN = {
    hello: { empty: "", filled: "" },
    "input-echo": { empty: "", filled: "42" },
    janken: { empty: "", filled: "1" },
    bmi: { empty: "", filled: "160\n58.6" },
    grade: { empty: "", filled: "80" },
    omikuji: { empty: "", filled: "" },
    quiz: { empty: "", filled: "3\n4\n7" },
};

const NEEDS_STDIN = new Set(["input-echo", "janken", "bmi", "grade", "quiz"]);

let passed = 0;
let failed = 0;

function assertStatus(result, expected, label) {
    if (result.status !== expected) {
        throw new Error(
            `${label}: status が ${expected} ではありません (実際: ${result.status})\n` +
                JSON.stringify(result.errors?.[0]?.messageJa ?? result)
        );
    }
}

async function runSampleProgram(sample, program, label) {
    const stdinCfg = SAMPLE_STDIN[sample.id] ?? { empty: "", filled: "" };

    if (NEEDS_STDIN.has(sample.id)) {
        const emptyRun = await executeCCode(program, stdinCfg.empty);
        assertStatus(emptyRun, "input_required", `${label}（入力なし）`);
    } else {
        const run = await executeCCode(program, "");
        assertStatus(run, "success", label);
    }

    if (stdinCfg.filled) {
        const filledRun = await executeCCode(program, stdinCfg.filled);
        assertStatus(filledRun, "success", `${label}（入力あり）`);
        if (sample.id === "input-echo" && !String(filledRun.output).includes("42")) {
            throw new Error("stdin の値が出力に反映されていません");
        }
        if (sample.id === "janken" && !filledRun.consoleOutput?.includes("> 1")) {
            throw new Error("コンソールに stdin 表示がありません");
        }
        if (sample.id === "bmi") {
            const out = filledRun.consoleOutput ?? filledRun.output ?? "";
            if (!out.includes("22.89")) {
                throw new Error("BMI の計算結果が表示されていません");
            }
            if (!out.includes("判定：普通体重") || !out.includes("BMIの目安")) {
                throw new Error("BMI の判定または目安が表示されていません");
            }
        }
    }

    if (sample.id === "janken") {
        const r1 = await executeCCode(program, "0");
        const r2 = await executeCCode(program, "1");
        if (r1.status !== "success" || r2.status !== "success") {
            throw new Error("じゃんけんの再実行に失敗");
        }
    }
}

async function main() {
    console.log("=== 空コード検証 ===\n");

    try {
        const empty = await executeCCode("", "");
        assertStatus(empty, "compile_error", "空コード");
        const msg = empty.errors?.[0]?.messageJa ?? "";
        if (!msg.includes("空") || !msg.includes("左のエディタ")) {
            throw new Error(`空コードの日本語メッセージが不正: ${msg}`);
        }
        console.log("✓ 空コードは compile_error（日本語メッセージ付き）");
        passed++;
    } catch (err) {
        console.error("✗ 空コードは compile_error");
        console.error(`  ${err.message}`);
        failed++;
    }

    console.log("\n=== 入力不足検証 ===\n");

    try {
        const bmiSample = CODEBRIDGE_SAMPLES.find((s) => s.id === "bmi");
        const bmiProgram = convertJapaneseToC(bmiSample.jpCode).program;
        const partialRun = await executeCCode(bmiProgram, "170");
        assertStatus(partialRun, "input_required", "BMI（1行のみ）");
        const msg = partialRun.errors?.[0]?.messageJa ?? "";
        if (!msg.includes("2個の入力")) {
            throw new Error(`入力不足メッセージが不正: ${msg}`);
        }
        console.log("✓ BMI は入力1行では実行せず input_required");
        passed++;
    } catch (err) {
        console.error("✗ BMI 入力不足チェック");
        console.error(`  ${err.message}`);
        failed++;
    }

    console.log("\n=== サンプル実行テスト ===\n");

    const gcc = await isGccReady();
    if (!gcc.available) {
        console.log("⚠ gcc 未検出のため実行テストをスキップします");
        process.exit(0);
    }

    for (const sample of CODEBRIDGE_SAMPLES) {
        const jp = sample.jpCode ?? sample.code;
        const converted = convertJapaneseToC(jp);
        const jpProgram = converted.program;

        try {
            await runSampleProgram(sample, jpProgram, `${sample.title}（jpCode→変換）`);
            console.log(`✓ 実行: ${sample.title}（jpCode→変換）`);
            passed++;
        } catch (err) {
            console.error(`✗ 実行: ${sample.title}（jpCode→変換）`);
            console.error(`  ${err.message}`);
            failed++;
        }

        const cProgram = sample.cCode?.trim();
        if (!cProgram) continue;

        try {
            await runSampleProgram(sample, cProgram, `${sample.title}（cCode）`);
            console.log(`✓ 実行: ${sample.title}（cCode）`);
            passed++;
        } catch (err) {
            console.error(`✗ 実行: ${sample.title}（cCode）`);
            console.error(`  ${err.message}`);
            failed++;
        }
    }

    console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
    process.exit(failed > 0 ? 1 : 0);
}

main();
