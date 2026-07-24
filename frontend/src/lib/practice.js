/**
 * 練習モード — テストケース採点（提出）と実行フィードバック
 *
 * 採点順位:
 * 1. コンパイル成功
 * 2. 実行成功
 * 3. 期待する出力（テストケース）
 * 4. 問題ごとの必須要件（学習目標の命令 — 採点点には含めず表示）
 * 5. 参考コードとの差分（学習用・採点外）
 */

import {
    detectPracticeLanguage,
    findMissingCommands,
} from "./practiceLanguage.js";
import { matchExpectedOutput } from "./outputMatch.js";

/**
 * @typedef {object} PracticeTestCase
 * @property {string} [id]
 * @property {string} [label]
 * @property {string} stdin
 * @property {{ includes?: string[], oneOf?: string[] }} expectedOutput
 */

/**
 * @param {object} sample
 * @returns {PracticeTestCase[]}
 */
export function resolvePracticeTestCases(sample) {
    const practice = sample?.practice;
    if (Array.isArray(practice?.testCases) && practice.testCases.length > 0) {
        return practice.testCases.map((tc, index) => ({
            id: tc.id ?? `case-${index + 1}`,
            label: tc.label ?? `ケース${index + 1}`,
            stdin: String(tc.stdin ?? ""),
            expectedOutput: normalizeCaseExpected(tc.expectedOutput, practice),
        }));
    }

    const successExamples = (sample?.stdinExamples ?? []).filter(
        (e) => e.expectStatus === "success"
    );

    if (successExamples.length > 0) {
        return successExamples.map((example, index) => ({
            id: `auto-${index + 1}`,
            label: example.label ?? `ケース${index + 1}`,
            stdin: String(example.stdin ?? ""),
            expectedOutput: normalizeCaseExpected(
                example.expectedOutput ?? sample?.expectedOutput,
                practice
            ),
        }));
    }

    return [
        {
            id: "default",
            label: "基本ケース",
            stdin: "",
            expectedOutput: normalizeCaseExpected(null, practice),
        },
    ];
}

function normalizeCaseExpected(raw, practice) {
    if (raw && (Array.isArray(raw.includes) || Array.isArray(raw.oneOf))) {
        return {
            includes: Array.isArray(raw.includes) ? raw.includes : [],
            oneOf: Array.isArray(raw.oneOf) ? raw.oneOf : [],
        };
    }
    const legacy = practice?.expectedOutputIncludes;
    if (Array.isArray(legacy) && legacy.length > 0) {
        return { includes: [...legacy], oneOf: [] };
    }
    return { includes: [], oneOf: [] };
}

export function getPracticeOutputPolicy(practice) {
    const policy = practice?.outputPolicy;
    if (policy === "strict" || policy === "exact" || policy === "flexible") {
        return policy;
    }
    return "flexible";
}

/**
 * 実行エラーを初心者向けに日本語で説明する
 * @param {string} [status]
 * @param {"japanese"|"c"|"unknown"} [language]
 * @param {Array<{ messageJa?: string }>|undefined} [errors]
 */
export function explainPracticeRunError(status, language = "japanese", errors) {
    const detail = errors?.[0]?.messageJa?.trim() ?? "";
    const isC = language === "c";

    switch (status) {
        case "compile_error":
            return [
                "【コンパイルエラー】",
                "プログラムをコンピュータが理解できる形に変換できませんでした。",
                "",
                "よくある原因:",
                "・文の終わりの ; が抜けている",
                "・括弧 ( ) { } の対応が合っていない",
                "・変数を宣言する前に使っている",
                isC
                    ? "・C言語のスペルミス（printf / scanf など）"
                    : "・日本語命令の書き方ミス（表示 / 入力 など）",
                detail ? `\n詳細:\n${detail}` : "",
            ]
                .filter(Boolean)
                .join("\n");

        case "input_required":
            return [
                "【入力が不足しています】",
                "プログラムはキーボード入力を待っています。",
                "",
                "下の「練習用の入力」欄に、問題で使う値を1行ずつ入れてから",
                "もう一度「実行」してください。",
                detail ? `\n詳細:\n${detail}` : "",
            ]
                .filter(Boolean)
                .join("\n");

        case "timeout":
            return [
                "【タイムアウト】",
                "実行に時間がかかりすぎたため、強制終了しました。",
                "",
                "よくある原因:",
                "・繰り返しが終わらない（無限ループ）",
                "・条件式の書き間違いでループが抜けられない",
                "",
                "繰り返しの条件と、カウンタの更新を確認してください。",
            ].join("\n");

        case "runtime_error":
            return [
                "【実行時エラー】",
                "コンパイルは通りましたが、実行中に問題が起きました。",
                "",
                "よくある原因:",
                "・入力の個数や形式が合っていない",
                "・0で割っている",
                "・配列の範囲外にアクセスしている",
                detail ? `\n詳細:\n${detail}` : "",
            ]
                .filter(Boolean)
                .join("\n");

        case "internal_error":
            return [
                "【実行サーバーに接続できません】",
                detail ||
                    "npm run dev でサーバーとフロントを同時に起動するか、別ターミナルで npm run dev:server を実行してください。",
            ].join("\n");

        default:
            return (
                detail ||
                "実行に失敗しました。エラーメッセージを確認して修正してください。"
            );
    }
}

/**
 * 単一実行の簡易評価（実行ボタン用・採点・挑戦回数には使わない）
 * @deprecated 提出採点は gradePracticeSubmission を使用
 */
export function evaluatePractice({ code, practice, runResult, language: languageOverride }) {
    if (!practice) {
        return {
            level: "error",
            message: "練習データがありません。",
            language: "unknown",
            alternateStyle: false,
        };
    }

    const expectedCommands = practice.expectedCommands ?? [];
    const source = String(code ?? "");

    /** @type {"japanese"|"c"|"unknown"} */
    let language =
        languageOverride && languageOverride !== "auto"
            ? languageOverride
            : detectPracticeLanguage(source);

    if (language === "unknown" && languageOverride === "auto") {
        language = "japanese";
    }

    const missingCommands = findMissingCommands(expectedCommands, source, language);
    const commandOk = missingCommands.length === 0;
    const status = runResult?.status;
    const outputText = String(runResult?.consoleOutput ?? runResult?.output ?? "");
    const policy = getPracticeOutputPolicy(practice);
    const expected = {
        includes: practice.expectedOutputIncludes ?? [],
        oneOf: [],
    };
    const runnable = status === "success";
    const outputMatch = matchExpectedOutput(outputText, expected, policy);
    const outputOk =
        (practice.expectedOutputIncludes ?? []).length === 0 || outputMatch.ok;

    if (!runnable) {
        return {
            level: "run",
            message: explainPracticeRunError(status, language, runResult?.errors),
            missingCommands,
            commandOk,
            runnable: false,
            outputOk: false,
            language,
            alternateStyle: false,
        };
    }

    if (!outputOk) {
        return {
            level: "output",
            message:
                outputMatch.reason ||
                "実行結果が期待と違います。出力を確認してください。",
            missingCommands,
            commandOk,
            runnable: true,
            outputOk: false,
            language,
            alternateStyle: false,
        };
    }

    if (!commandOk) {
        return {
            level: "success",
            message:
                "正しく動作しています。書き方は参考コードと違っても大丈夫です。学習目標の命令も確認してみましょう。",
            missingCommands,
            commandOk: false,
            runnable: true,
            outputOk: true,
            language,
            alternateStyle: true,
            successLanguage: language,
        };
    }

    const successMessage =
        language === "c"
            ? "C言語コードで正しく動作しました。対応する日本語コードも確認できます。"
            : "日本語コードで正しく動作しました。対応するC言語も確認できます。";

    return {
        level: "success",
        message: successMessage,
        missingCommands: [],
        commandOk: true,
        runnable: true,
        outputOk: true,
        language,
        alternateStyle: false,
        successLanguage: language,
    };
}

/**
 * 提出採点（テストケース方式）
 *
 * @param {object} params
 * @param {string} params.code
 * @param {object} params.sample
 * @param {object} params.practice
 * @param {"japanese"|"c"|"unknown"} params.language
 * @param {Array<{
 *   testCase: PracticeTestCase,
 *   status?: string,
 *   output?: string,
 *   errors?: Array<{ messageJa?: string }>
 * }>} params.caseResults
 */
export function gradePracticeSubmission({
    code,
    sample,
    practice,
    language,
    caseResults,
}) {
    const policy = getPracticeOutputPolicy(practice);
    const expectedCommands = practice?.expectedCommands ?? [];
    const missingCommands = findMissingCommands(
        expectedCommands,
        String(code ?? ""),
        language
    );
    const requirementsOk = missingCommands.length === 0;

    /** @type {Array<object>} */
    const cases = [];
    let compileOk = true;
    let runOk = true;
    let passedCount = 0;

    for (const entry of caseResults ?? []) {
        const tc = entry.testCase;
        const status = entry.status;
        const output = String(entry.output ?? "");

        let casePassed = false;
        let caseMessage = "";

        if (status === "compile_error") {
            compileOk = false;
            runOk = false;
            caseMessage = explainPracticeRunError(status, language, entry.errors);
        } else if (status !== "success") {
            runOk = false;
            caseMessage = explainPracticeRunError(status, language, entry.errors);
        } else {
            const match = matchExpectedOutput(output, tc.expectedOutput, policy);
            if (match.ok) {
                casePassed = true;
                passedCount += 1;
                caseMessage = "Passed";
            } else {
                caseMessage = match.reason || "期待する出力と一致しません。";
            }
        }

        cases.push({
            id: tc.id,
            label: tc.label,
            stdin: tc.stdin,
            status: status ?? "unknown",
            passed: casePassed,
            message: caseMessage,
            output,
        });
    }

    const total = cases.length;
    const score = total > 0 ? Math.round((passedCount / total) * 100) : 0;
    const outputOk = compileOk && runOk && passedCount === total;
    const cleared = score === 100;

    let summaryMessage = "";
    if (!compileOk) {
        summaryMessage = "コンパイルに失敗したため、採点できませんでした。";
    } else if (!runOk) {
        summaryMessage = "実行に失敗したテストケースがあります。";
    } else if (!cleared) {
        summaryMessage = `テストケース ${passedCount} / ${total} に合格しました。残りを修正してみましょう。`;
    } else if (!requirementsOk) {
        summaryMessage =
            "全テストケース合格です。書き方が違っても正解です。学習目標の命令も確認してみましょう。";
    } else {
        summaryMessage =
            language === "c"
                ? "全テストケース合格です。C言語で正しく実装できました。"
                : "全テストケース合格です。正しく実装できました。";
    }

    return {
        score,
        passedCount,
        totalCount: total,
        compileOk,
        runOk,
        outputOk,
        requirementsOk,
        missingCommands,
        alternateStyle: cleared && !requirementsOk,
        cleared,
        cases,
        language,
        summaryMessage,
        level: cleared ? "success" : !compileOk || !runOk ? "run" : "output",
        message: summaryMessage,
    };
}

/** 練習実行用の stdin（サンプルの成功例から取得） */
export function getPracticeStdin(sample) {
    const success = (sample?.stdinExamples ?? []).find((e) => e.expectStatus === "success");
    return success?.stdin ?? "";
}

export { detectPracticeLanguage, findMissingCommands };
