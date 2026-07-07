// CodeBridge 実行テスト — node test-run.mjs（gcc 必須）
// サンプル個別の実行・出力検証は scripts/validate-samples.mjs に集約

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { executeCCode } = require("./server.js");

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

    console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
    process.exit(failed > 0 ? 1 : 0);
}

main();
