// jpCode から cCode を生成して検証 — node scripts/generate-sample-ccodes.mjs
import CodeBridgeJp2c from "../shared/jp2c.js";
import { CODEBRIDGE_SAMPLES } from "../shared/samples.js";

for (const sample of CODEBRIDGE_SAMPLES) {
    const jp = sample.jpCode ?? sample.code;
    const expected = sample.cCode?.trim();
    const actual = CodeBridgeJp2c.convertJapaneseToC(jp).program.trim();
    if (expected && expected !== actual) {
        console.error(`✗ ${sample.id}: cCode が jpCode の変換と一致しません`);
        process.exit(1);
    }
    if (!expected) {
        console.log(`// ${sample.id} — cCode 未設定`);
        console.log(actual);
        console.log("");
    }
}
console.log("✓ サンプル cCode 検証 OK");
