/**
 * 練習モードの答え合わせ（日本語 / C 両対応）
 *
 * 判定優先順:
 * 1. コンパイル・実行できる
 * 2. 実行結果が期待値を満たす
 * 3. 必要な構文・命令が含まれている
 */

import {
    detectPracticeLanguage,
    findMissingCommands,
} from "./practiceLanguage.js";

/**
 * @param {object} params
 * @param {string} params.code
 * @param {object} params.practice
 * @param {{ status?: string, consoleOutput?: string, output?: string }} [params.runResult]
 * @param {"japanese"|"c"|"unknown"|"auto"} [params.language]
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
    const expectedIncludes = practice.expectedOutputIncludes ?? [];
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
    const outputText = String(runResult?.consoleOutput ?? runResult?.output ?? "").replace(
        /\r\n/g,
        "\n"
    );

    const runnable = status === "success";
    const hasOutputCriteria = expectedIncludes.length > 0;
    const outputOk =
        !hasOutputCriteria ||
        (runnable && expectedIncludes.every((snippet) => outputText.includes(snippet)));

    // 1. 実行できること
    if (!runnable) {
        const hint =
            status === "compile_error"
                ? language === "c"
                    ? "C言語コードを修正して、実行できるようにしてください。"
                    : "コードを修正して、実行できるようにしてください。"
                : status === "input_required"
                  ? "入力が必要です。下の入力欄に値を入れてから再実行してください。"
                  : "実行に失敗しました。エラーを確認してください。";
        return {
            level: "run",
            message: hint,
            missingCommands,
            commandOk,
            runnable: false,
            outputOk: false,
            language,
            alternateStyle: false,
        };
    }

    // 2. 出力が期待値を満たすこと
    if (!outputOk) {
        return {
            level: "output",
            message: "実行結果が期待と違います。出力を確認してください。",
            missingCommands,
            commandOk,
            runnable: true,
            outputOk: false,
            language,
            alternateStyle: false,
        };
    }

    // 3. 命令・構文（出力は正しいが学習目標を外れている場合は補足付き成功）
    if (!commandOk) {
        return {
            level: "success",
            message:
                "正解ですが、別の書き方を使っています。学習目標の命令・構文も確認してみましょう。",
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
            ? "C言語コードで正解しました。対応する日本語コードも確認できます。"
            : "日本語コードで正解しました。対応するC言語も確認できます。";

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

/** 練習実行用の stdin（サンプルの成功例から取得） */
export function getPracticeStdin(sample) {
    const success = (sample?.stdinExamples ?? []).find((e) => e.expectStatus === "success");
    return success?.stdin ?? "";
}

export { detectPracticeLanguage, findMissingCommands };
