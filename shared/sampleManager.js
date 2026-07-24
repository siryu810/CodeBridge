// =========================================================
// CodeBridge SampleManager — サンプル一覧・検索・検証
// =========================================================

import CodeBridgeJp2c from "./jp2c.js";
import { CODEBRIDGE_SAMPLES, HOME_FEATURED_SAMPLE_IDS } from "./samples.js";

const { convertJapaneseToC, normalizeJapaneseInput } = CodeBridgeJp2c;

/** @typedef {"success" | "input_required" | "compile_error"} SampleExpectStatus */

/**
 * @typedef {object} ExpectedOutput
 * @property {string[]} includes
 * @property {string[]} [oneOf]
 */

/**
 * @typedef {object} StdinExample
 * @property {string} [label]
 * @property {string} stdin
 * @property {SampleExpectStatus} expectStatus
 * @property {ExpectedOutput} [expectedOutput]
 */

/**
 * @typedef {object} CodeBridgeSample
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {number} difficulty
 * @property {string[]} tags
 * @property {string} jpCode
 * @property {string} cCode
 * @property {StdinExample[]} stdinExamples
 * @property {ExpectedOutput} expectedOutput
 * @property {string[]} learningGoals
 * @property {string[]} algorithmSteps
 * @property {string[]} commands
 */

export const SAMPLE_CATEGORIES = [
    "基本",
    "条件分岐",
    "繰り返し",
    "配列",
    "関数",
    "乱数",
    "計算",
    "文字列",
];

export const REQUIRED_PRACTICE_FIELDS = [
    "prompt",
    "hints",
    "expectedCommands",
    "expectedOutputIncludes",
];

/**
 * @param {object} practice
 * @param {string} sampleId
 * @returns {ValidationIssue[]}
 */
export function validatePracticeSchema(practice, sampleId) {
    const issues = [];
    const sid = sampleId ?? "(idなし)";

    if (!practice || typeof practice !== "object") {
        issues.push({
            sampleId: sid,
            level: "error",
            message: "practice がありません",
            check: "practice",
        });
        return issues;
    }

    if (!practice.prompt?.trim()) {
        issues.push({
            sampleId: sid,
            level: "error",
            message: "practice.prompt が空です",
            check: "practice",
        });
    }

    if (!Array.isArray(practice.hints)) {
        issues.push({
            sampleId: sid,
            level: "error",
            message: "practice.hints が配列ではありません",
            check: "practice",
        });
    }

    if (!Array.isArray(practice.expectedCommands)) {
        issues.push({
            sampleId: sid,
            level: "error",
            message: "practice.expectedCommands が配列ではありません",
            check: "practice",
        });
    }

    if (!Array.isArray(practice.expectedOutputIncludes)) {
        issues.push({
            sampleId: sid,
            level: "error",
            message: "practice.expectedOutputIncludes が配列ではありません",
            check: "practice",
        });
    }

    if (
        practice.outputPolicy != null &&
        !["flexible", "strict", "exact"].includes(practice.outputPolicy)
    ) {
        issues.push({
            sampleId: sid,
            level: "error",
            message: `practice.outputPolicy が不正です: ${practice.outputPolicy}`,
            check: "practice",
        });
    }

    if (practice.testCases != null) {
        if (!Array.isArray(practice.testCases)) {
            issues.push({
                sampleId: sid,
                level: "error",
                message: "practice.testCases が配列ではありません",
                check: "practice",
            });
        } else if (practice.testCases.length === 0) {
            issues.push({
                sampleId: sid,
                level: "warning",
                message: "practice.testCases が空です",
                check: "practice",
            });
        } else {
            for (const [index, tc] of practice.testCases.entries()) {
                if (!tc || typeof tc !== "object") {
                    issues.push({
                        sampleId: sid,
                        level: "error",
                        message: `practice.testCases[${index}] が不正です`,
                        check: "practice",
                    });
                    continue;
                }
                if (typeof tc.stdin !== "string") {
                    issues.push({
                        sampleId: sid,
                        level: "error",
                        message: `practice.testCases[${index}].stdin が文字列ではありません`,
                        check: "practice",
                    });
                }
                if (
                    tc.expectedOutput == null ||
                    typeof tc.expectedOutput !== "object" ||
                    (!Array.isArray(tc.expectedOutput.includes) &&
                        !Array.isArray(tc.expectedOutput.oneOf))
                ) {
                    issues.push({
                        sampleId: sid,
                        level: "error",
                        message: `practice.testCases[${index}].expectedOutput が不正です`,
                        check: "practice",
                    });
                }
            }
        }
    }

    return issues;
}

export const REQUIRED_SAMPLE_FIELDS = [
    "id",
    "title",
    "description",
    "category",
    "difficulty",
    "tags",
    "jpCode",
    "cCode",
    "stdinExamples",
    "expectedOutput",
    "learningGoals",
    "algorithmSteps",
    "commands",
];

/** @typedef {"error" | "warning"} ValidationLevel */

/**
 * @typedef {object} ValidationIssue
 * @property {string} sampleId
 * @property {ValidationLevel} level
 * @property {string} message
 * @property {string} [check]
 */

/**
 * @typedef {object} ValidationResult
 * @property {number} total
 * @property {number} passed
 * @property {number} warnings
 * @property {number} failed
 * @property {ValidationIssue[]} issues
 * @property {Record<string, number>} categoryCounts
 * @property {Record<number, number>} difficultyCounts
 * @property {boolean} gccSkipped
 */

// -------------------------------------------------------------------------
// 一覧・検索（将来: おすすめ / 学習順 / お気に入り / 達成率）
// -------------------------------------------------------------------------

export function getAllSamples() {
    return [...CODEBRIDGE_SAMPLES];
}

export function getSampleById(id) {
    return CODEBRIDGE_SAMPLES.find((s) => s.id === id) ?? null;
}

export function getSamplesByCategory(category) {
    return CODEBRIDGE_SAMPLES.filter((s) => s.category === category);
}

export function getCategorySummary() {
    const counts = {};
    for (const sample of CODEBRIDGE_SAMPLES) {
        const key = sample.category ?? "未分類";
        counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
}

export function getCategories() {
    return Object.keys(getCategorySummary()).sort((a, b) => a.localeCompare(b, "ja"));
}

/**
 * タイトル・説明・タグ・カテゴリ・commands から検索
 * @param {string} query
 */
export function searchSamples(query) {
    const q = String(query ?? "").trim().toLowerCase();
    if (!q) return getAllSamples();

    return CODEBRIDGE_SAMPLES.filter((sample) => {
        const haystack = [
            sample.id,
            sample.title,
            sample.description,
            sample.category,
            ...(sample.tags ?? []),
            ...(sample.commands ?? []),
        ]
            .join(" ")
            .toLowerCase();
        return haystack.includes(q);
    });
}

/** 将来: おすすめサンプル ID */
export function getRecommendedSampleIds() {
    return [...HOME_FEATURED_SAMPLE_IDS];
}

/** 将来: 難易度順の学習パス */
export function getLearningOrderSampleIds() {
    return [...CODEBRIDGE_SAMPLES]
        .sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0))
        .map((s) => s.id);
}

/** 将来: お気に入り */
export function getFavoriteSampleIds() {
    return [];
}

/** 将来: 達成率 */
export function getAchievementRate() {
    return null;
}

// -------------------------------------------------------------------------
// 検証ヘルパー
// -------------------------------------------------------------------------

export function countJapaneseInputs(jpCode) {
    if (!jpCode) return 0;
    const normalized = normalizeJapaneseInput(jpCode);
    return (normalized.match(/入力\s*\(/g) ?? []).length;
}

export function countNonEmptyStdinLines(stdin) {
    return String(stdin ?? "")
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0).length;
}

export function pickRunOutputText(result) {
    return (result?.output ?? result?.consoleOutput ?? "").replace(/\r\n/g, "\n");
}

export function normalizeExpectedOutput(raw) {
    if (!raw || typeof raw !== "object") {
        return { includes: [], oneOf: [] };
    }
    if (Array.isArray(raw.includes) || Array.isArray(raw.oneOf)) {
        return {
            includes: Array.isArray(raw.includes) ? raw.includes : [],
            oneOf: Array.isArray(raw.oneOf) ? raw.oneOf : [],
        };
    }
    return { includes: [], oneOf: [] };
}

function normalizeProgram(text) {
    return String(text ?? "")
        .replace(/\r\n/g, "\n")
        .trim();
}

function hasOutputCriteria(expected) {
    const norm = normalizeExpectedOutput(expected);
    return norm.includes.length > 0 || norm.oneOf.length > 0;
}

function assertOutputContains(sampleId, text, expected, context) {
    const norm = normalizeExpectedOutput(expected);
    for (const snippet of norm.includes) {
        if (!text.includes(snippet)) {
            throw new Error(`${sampleId} (${context}): 出力に "${snippet}" が含まれません`);
        }
    }
    if (norm.oneOf.length > 0) {
        const matched = norm.oneOf.some((snippet) => text.includes(snippet));
        if (!matched) {
            throw new Error(
                `${sampleId} (${context}): 出力に次のいずれかが必要です — ${norm.oneOf.join(" / ")}`
            );
        }
    }
    if (norm.includes.length === 0 && norm.oneOf.length === 0 && !text.trim()) {
        throw new Error(`${sampleId} (${context}): 成功時の出力が空です`);
    }
}

function pushIssue(issues, sampleId, level, message, check) {
    issues.push({ sampleId, level, message, check });
}

// -------------------------------------------------------------------------
// validateSamples()
// -------------------------------------------------------------------------

/**
 * @param {object} [options]
 * @param {typeof import('../server.js').executeCCode} [options.executeCCode]
 * @param {() => Promise<{available: boolean}>} [options.isGccReady]
 * @param {boolean} [options.runPrograms=true]
 */
export async function validateSamples(options = {}) {
    const issues = [];
    let gccSkipped = false;

    const ids = new Set();

    for (const sample of CODEBRIDGE_SAMPLES) {
        const sid = sample.id ?? "(idなし)";

        for (const field of REQUIRED_SAMPLE_FIELDS) {
            if (!(field in sample)) {
                pushIssue(issues, sid, "error", `必須項目 "${field}" がありません`, "schema");
            }
        }

        if (!sample.id?.trim()) {
            pushIssue(issues, sid, "error", "id が空です", "schema");
        } else if (ids.has(sample.id)) {
            pushIssue(issues, sid, "error", `id が重複しています: ${sample.id}`, "schema");
        } else {
            ids.add(sample.id);
        }

        if (!sample.title?.trim()) pushIssue(issues, sid, "error", "title が空です", "schema");
        if (!sample.jpCode?.trim()) pushIssue(issues, sid, "error", "jpCode が空です", "schema");
        if (!sample.cCode?.trim()) pushIssue(issues, sid, "error", "cCode が空です", "schema");

        if (!Array.isArray(sample.learningGoals) || sample.learningGoals.length === 0) {
            pushIssue(issues, sid, "error", "learningGoals が空です", "schema");
        }
        if (!Array.isArray(sample.algorithmSteps) || sample.algorithmSteps.length === 0) {
            pushIssue(issues, sid, "error", "algorithmSteps が空です", "schema");
        }
        if (!Array.isArray(sample.commands) || sample.commands.length === 0) {
            pushIssue(issues, sid, "error", "commands が空です", "schema");
        }

        for (const practiceIssue of validatePracticeSchema(sample.practice, sid)) {
            pushIssue(
                issues,
                practiceIssue.sampleId,
                practiceIssue.level,
                practiceIssue.message,
                practiceIssue.check
            );
        }

        if (!Array.isArray(sample.stdinExamples) || sample.stdinExamples.length === 0) {
            pushIssue(issues, sid, "error", "stdinExamples が不足しています", "schema");
        }
        if (!sample.category?.trim()) {
            pushIssue(issues, sid, "error", "category が未設定です", "schema");
        } else if (!SAMPLE_CATEGORIES.includes(sample.category)) {
            pushIssue(
                issues,
                sid,
                "warning",
                `category "${sample.category}" は定義済みカテゴリ外です`,
                "schema"
            );
        }
        if (sample.difficulty == null || Number.isNaN(Number(sample.difficulty))) {
            pushIssue(issues, sid, "error", "difficulty が未設定です", "schema");
        } else if (sample.difficulty < 1 || sample.difficulty > 5) {
            pushIssue(issues, sid, "warning", "difficulty は 1〜5 が推奨です", "schema");
        }

        const sampleOutput = normalizeExpectedOutput(sample.expectedOutput);
        const hasSuccessCase = (sample.stdinExamples ?? []).some((e) => e.expectStatus === "success");
        const sampleHasCriteria = hasOutputCriteria(sampleOutput);
        const exampleHasCriteria = (sample.stdinExamples ?? []).some(
            (e) => e.expectStatus === "success" && hasOutputCriteria(e.expectedOutput)
        );

        if (hasSuccessCase && !sampleHasCriteria && !exampleHasCriteria) {
            pushIssue(issues, sid, "error", "expectedOutput が不足しています", "schema");
        }

        if (!hasOutputCriteria(sampleOutput) && !hasSuccessCase) {
            pushIssue(issues, sid, "warning", "expectedOutput が空です（入力待ちのみのサンプル）", "schema");
        }

        const inputCount = countJapaneseInputs(sample.jpCode);
        for (const [index, example] of (sample.stdinExamples ?? []).entries()) {
            const label = example.label ?? `stdinExamples[${index}]`;
            if (typeof example.stdin !== "string") {
                pushIssue(issues, sid, "error", `${label}: stdin が文字列ではありません`, "stdin");
                continue;
            }
            if (!["success", "input_required", "compile_error"].includes(example.expectStatus)) {
                pushIssue(issues, sid, "error", `${label}: expectStatus が不正です`, "stdin");
                continue;
            }

            const lineCount = countNonEmptyStdinLines(example.stdin);
            if (example.expectStatus === "success") {
                if (inputCount > 0 && lineCount !== inputCount) {
                    pushIssue(
                        issues,
                        sid,
                        "error",
                        `${label}: 入力(...) は ${inputCount} 個ですが stdin は ${lineCount} 行です`,
                        "stdin"
                    );
                }
            }
            if (example.expectStatus === "input_required" && inputCount > 0 && lineCount >= inputCount) {
                pushIssue(
                    issues,
                    sid,
                    "error",
                    `${label}: input_required なのに stdin が ${lineCount} 行です`,
                    "stdin"
                );
            }
        }

        const converted = convertJapaneseToC(sample.jpCode);
        if (!converted.program?.includes("int main")) {
            pushIssue(issues, sid, "error", "main を含む C プログラムが生成されません", "conversion");
        }
        if (converted.warnings.length > 0) {
            pushIssue(
                issues,
                sid,
                "warning",
                `変換警告 — ${converted.warnings.map((w) => w.messageJa).join("; ")}`,
                "conversion"
            );
        }

        const expectedC = normalizeProgram(sample.cCode);
        const actualC = normalizeProgram(converted.program);
        if (expectedC !== actualC) {
            pushIssue(
                issues,
                sid,
                "warning",
                "jpCode の変換結果が cCode と一致しません（要確認）",
                "conversion"
            );
        }

        if (/printf\s*\(\s*[^"%'][^,)]*\s*\)/.test(converted.body)) {
            pushIssue(issues, sid, "error", "不正な printf が残っています", "conversion");
        }
        if (/scanf\s*\(\s*[^"%'][^,)]*\s*\)/.test(converted.body)) {
            pushIssue(issues, sid, "error", "不正な scanf が残っています", "conversion");
        }
    }

    const runPrograms = options.runPrograms !== false;
    if (runPrograms && options.executeCCode && options.isGccReady) {
        const gcc = await options.isGccReady();
        if (!gcc.available) {
            gccSkipped = true;
            pushIssue(issues, "(全体)", "warning", "gcc 未検出のため実行検証をスキップしました", "runtime");
        } else {
            for (const sample of CODEBRIDGE_SAMPLES) {
                const programs = [
                    { label: "cCode", code: sample.cCode.trim() },
                    { label: "jpCode→変換", code: convertJapaneseToC(sample.jpCode).program },
                ];

                for (const { label, code } of programs) {
                    for (const example of sample.stdinExamples ?? []) {
                        const exampleLabel = example.label ?? example.expectStatus;
                        const context = `${label} / ${exampleLabel}`;

                        try {
                            let run = null;
                            let lastError = null;
                            for (let attempt = 0; attempt < 2; attempt++) {
                                try {
                                    run = await options.executeCCode(code, example.stdin);
                                    if (run.status !== example.expectStatus) {
                                        throw new Error(
                                            `${context}: status が ${example.expectStatus} ではありません (実際: ${run.status})`
                                        );
                                    }

                                    if (example.expectStatus === "success") {
                                        const output = pickRunOutputText(run);
                                        const expected =
                                            example.expectedOutput ??
                                            sample.expectedOutput ??
                                            { includes: [], oneOf: [] };
                                        assertOutputContains(sample.id, output, expected, context);
                                    }

                                    if (example.expectStatus === "input_required") {
                                        const inputCount = countJapaneseInputs(sample.jpCode);
                                        if (inputCount > 0) {
                                            const msg = run.errors?.[0]?.messageJa ?? "";
                                            if (!msg.includes(`${inputCount}個の入力`)) {
                                                throw new Error(
                                                    `${context}: 入力不足メッセージが不正 — ${msg}`
                                                );
                                            }
                                        }
                                    }

                                    lastError = null;
                                    break;
                                } catch (err) {
                                    lastError = err;
                                    if (attempt === 0) {
                                        await new Promise((resolve) => setTimeout(resolve, 120));
                                    }
                                }
                            }

                            if (lastError) {
                                throw lastError;
                            }
                        } catch (err) {
                            pushIssue(
                                issues,
                                sample.id,
                                "error",
                                `${context}: ${err.message ?? err}`,
                                "runtime"
                            );
                        }
                    }
                }
            }
        }
    }

    const samplesWithErrors = new Set(
        issues.filter((i) => i.level === "error").map((i) => i.sampleId)
    );
    const passed = CODEBRIDGE_SAMPLES.filter((s) => !samplesWithErrors.has(s.id)).length;
    const warnings = issues.filter((i) => i.level === "warning").length;
    const failed = samplesWithErrors.size;

    return {
        total: CODEBRIDGE_SAMPLES.length,
        passed,
        warnings,
        failed,
        issues,
        categoryCounts: getCategorySummary(),
        difficultyCounts: CODEBRIDGE_SAMPLES.reduce((acc, s) => {
            const d = s.difficulty ?? 0;
            acc[d] = (acc[d] ?? 0) + 1;
            return acc;
        }, {}),
        gccSkipped,
    };
}

export function printSampleReport(result) {
    console.log("\n====================");
    console.log("Sample Report");
    console.log("====================\n");
    console.log(`Total Samples : ${result.total}`);
    console.log(`Passed        : ${result.passed}`);
    console.log(`Warnings      : ${result.warnings}`);
    console.log(`Failed        : ${result.failed}`);
    if (result.gccSkipped) {
        console.log("\n(実行検証は gcc 未検出のためスキップ)");
    }

    console.log("\nCategory");
    const categories = Object.entries(result.categoryCounts).sort((a, b) => a[0].localeCompare(b[0], "ja"));
    for (const [name, count] of categories) {
        console.log(`${name} ${count}`);
    }

    console.log("\nDifficulty");
    const difficulties = Object.entries(result.difficultyCounts).sort((a, b) => Number(a[0]) - Number(b[0]));
    for (const [level, count] of difficulties) {
        console.log(`Level ${level} : ${count}`);
    }

    const errorIssues = result.issues.filter((i) => i.level === "error");
    const warningIssues = result.issues.filter((i) => i.level === "warning");

    if (warningIssues.length > 0) {
        console.log("\nWarnings");
        for (const issue of warningIssues) {
            console.log(`  [${issue.sampleId}] ${issue.message}`);
        }
    }

    if (errorIssues.length > 0) {
        console.log("\nFailures");
        for (const issue of errorIssues) {
            console.log(`  [${issue.sampleId}] ${issue.message}`);
        }
    }

    console.log("");
}

const SampleManager = {
    SAMPLE_CATEGORIES,
    REQUIRED_SAMPLE_FIELDS,
    REQUIRED_PRACTICE_FIELDS,
    getAllSamples,
    getSampleById,
    getSamplesByCategory,
    getCategorySummary,
    getCategories,
    searchSamples,
    getRecommendedSampleIds,
    getLearningOrderSampleIds,
    getFavoriteSampleIds,
    getAchievementRate,
    countJapaneseInputs,
    countNonEmptyStdinLines,
    pickRunOutputText,
    normalizeExpectedOutput,
    validateSamples,
    validatePracticeSchema,
    printSampleReport,
};

export default SampleManager;
