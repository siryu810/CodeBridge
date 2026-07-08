/**
 * 練習モードの答え合わせ（ゆるい判定）
 * @param {object} params
 * @param {string} params.code - ユーザーが書いた日本語コード
 * @param {object} params.practice - sample.practice
 * @param {{ status?: string, consoleOutput?: string, output?: string }} [params.runResult]
 */
export function evaluatePractice({ code, practice, runResult }) {
    if (!practice) {
        return { level: "error", message: "練習データがありません。" };
    }

    const expectedCommands = practice.expectedCommands ?? [];
    const expectedIncludes = practice.expectedOutputIncludes ?? [];
    const source = String(code ?? "");

    const missingCommands = expectedCommands.filter((cmd) => !source.includes(cmd));
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

    if (!commandOk) {
        return {
            level: "commands",
            message: `まだ足りない命令があります：${missingCommands.join(" / ")}`,
            missingCommands,
            commandOk,
            runnable,
            outputOk,
        };
    }

    if (!runnable) {
        const hint =
            status === "compile_error"
                ? "コードを修正して、実行できるようにしてください。"
                : status === "input_required"
                  ? "入力が必要です。下の入力欄に値を入れてから再実行してください。"
                  : "実行に失敗しました。エラーを確認してください。";
        return {
            level: "run",
            message: hint,
            missingCommands: [],
            commandOk,
            runnable,
            outputOk: false,
        };
    }

    if (!outputOk) {
        return {
            level: "output",
            message: "実行結果が期待と違います。出力を確認してください。",
            missingCommands: [],
            commandOk,
            runnable,
            outputOk,
        };
    }

    return {
        level: "success",
        message: "よくできました。必要な命令が使えています。",
        missingCommands: [],
        commandOk,
        runnable,
        outputOk,
    };
}

/** 練習実行用の stdin（サンプルの成功例から取得） */
export function getPracticeStdin(sample) {
    const success = (sample?.stdinExamples ?? []).find((e) => e.expectStatus === "success");
    return success?.stdin ?? "";
}
