// サンプル品質検証 — node scripts/validate-samples.mjs

import { createRequire } from "module";
import SampleManager from "../shared/sampleManager.js";

const require = createRequire(import.meta.url);
const { executeCCode, isGccReady } = require("../server.js");

async function main() {
    console.log("=== サンプル検証 (SampleManager) ===\n");

    const result = await SampleManager.validateSamples({
        executeCCode,
        isGccReady,
        runPrograms: true,
    });

    SampleManager.printSampleReport(result);

    if (result.failed > 0) {
        process.exit(1);
    }
}

main();
