// shared/samples.js から js/samples.js を生成 — node scripts/sync-legacy-samples.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CODEBRIDGE_SAMPLES } from "../shared/samples.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "js", "samples.js");

const body = `// =========================================================
// CodeBridge サンプル集（shared/samples.js から自動生成）
// 手編集しないでください — node scripts/sync-legacy-samples.mjs
// =========================================================

const CODEBRIDGE_SAMPLES = ${JSON.stringify(CODEBRIDGE_SAMPLES, null, 4)};

if (typeof window !== "undefined") {
    window.CODEBRIDGE_SAMPLES = CODEBRIDGE_SAMPLES;
}

function getSampleEditorCode(sample, mode) {
    if (!sample) return "";
    if (mode === "c2jp") return sample.cCode ?? "";
    return sample.jpCode ?? sample.code ?? "";
}

function setupSampleSelector() {
    const select = document.getElementById("sampleSelect");
    if (!select) return;

    select.innerHTML =
        '<option value="">サンプルを選ぶ…</option>' +
        CODEBRIDGE_SAMPLES.map(
            (s) => \`<option value="\${s.id}">\${s.title} — \${s.description}</option>\`
        ).join("");

    select.addEventListener("change", () => {
        const sample = CODEBRIDGE_SAMPLES.find((s) => s.id === select.value);
        if (!sample) return;

        if (typeof window.loadSampleIntoEditor === "function") {
            window.loadSampleIntoEditor(sample);
        } else if (typeof window.loadCodeIntoEditor === "function") {
            const mode =
                typeof window.getInputMode === "function" ? window.getInputMode() : "jp2c";
            window.loadCodeIntoEditor(getSampleEditorCode(sample, mode), sample.title);
        }
    });
}

if (typeof window !== "undefined") {
    window.setupSampleSelector = setupSampleSelector;
    window.getSampleEditorCode = getSampleEditorCode;
}

try {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { CODEBRIDGE_SAMPLES, getSampleEditorCode };
    }
} catch {
    /* ブラウザ環境では無視 */
}
`;

fs.writeFileSync(outPath, body, "utf8");
console.log(`✓ wrote ${outPath} (${CODEBRIDGE_SAMPLES.length} samples)`);
