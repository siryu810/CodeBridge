export const INPUT_WAIT_MESSAGE =
    "このプログラムは入力を待っています。\n実行時入力欄に値を入れてから再度「実行」してください。";

const FALLBACK_RUN_ERROR = {
    status: "internal_error",
    ok: false,
    output: "",
    consoleOutput: "",
    errors: [
        {
            line: null,
            messageJa: "サーバーからの応答を読み取れませんでした。",
            messageRaw: "",
        },
    ],
    hints: [],
};

export async function runCodeOnServer(code, stdin) {
    try {
        const response = await fetch("/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code ?? "", stdin: stdin ?? "" }),
        });

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            if (data && typeof data === "object") {
                return data;
            }
        } catch {
            /* invalid JSON — proxy エラー等 */
        }

        const looksLikeProxyFailure =
            response.status === 500 &&
            (text.includes("ECONNREFUSED") ||
                text.includes("http proxy error") ||
                text.length === 0);

        return {
            ...FALLBACK_RUN_ERROR,
            errors: [
                {
                    line: null,
                    messageJa: looksLikeProxyFailure
                        ? "実行サーバーに接続できません。npm run dev でサーバーとフロントを同時に起動するか、別ターミナルで npm run dev:server を実行してください。"
                        : `サーバー応答が不正です（HTTP ${response.status}）。`,
                    messageRaw: text.slice(0, 200),
                },
            ],
        };
    } catch (err) {
        const msg = String(err?.message ?? err);
        const isConnectionFailure =
            msg.includes("Failed to fetch") ||
            msg.includes("ECONNREFUSED") ||
            msg.includes("NetworkError");

        return {
            ...FALLBACK_RUN_ERROR,
            errors: [
                {
                    line: null,
                    messageJa: isConnectionFailure
                        ? "実行サーバーに接続できません。npm run dev でサーバーとフロントを同時に起動するか、別ターミナルで npm run dev:server を実行してください。"
                        : "サーバーと通信できませんでした。",
                    messageRaw: msg,
                },
            ],
        };
    }
}

function pickConsoleText(data) {
    if (!data || typeof data !== "object") return "";
    const consoleOutput = data.consoleOutput;
    if (consoleOutput != null && String(consoleOutput).length > 0) {
        return String(consoleOutput).trimEnd();
    }
    const output = data.output;
    if (output != null && String(output).length > 0) {
        return String(output).trimEnd();
    }
    return "";
}

function safeFormatErrors(data, layout, jpLines, formatErrorsFn) {
    try {
        return formatErrorsFn(data?.errors, data?.hints, layout, jpLines) || "";
    } catch {
        return data?.errors?.[0]?.messageJa || "";
    }
}

export function parseRunResponse(data, layout, jpLines, formatErrorsFn) {
    const status = data?.status || (data?.ok ? "success" : "runtime_error");
    const consoleText = pickConsoleText(data);

    if (status === "success") {
        let output = consoleText || "（出力はありませんでした）";
        if (!consoleText && data?.exitCode != null) {
            output += `\n（終了コード: ${data.exitCode}）`;
        }
        const errorText =
            data?.errors?.length > 0
                ? safeFormatErrors(data, layout, jpLines, formatErrorsFn) || "（エラーなし）"
                : "（エラーなし）";
        return { output, errorText, showStdinPanel: false, panelMode: "success" };
    }

    if (status === "input_required") {
        const serverMessage = data?.errors?.[0]?.messageJa;
        return {
            output: consoleText || "（まだ出力はありません）",
            errorText: serverMessage || "入力が必要です\n\n" + INPUT_WAIT_MESSAGE,
            showStdinPanel: true,
            panelMode: "input_wait",
        };
    }

    if (status === "compile_error") {
        return {
            output: consoleText || "（実行結果なし）",
            errorText:
                safeFormatErrors(data, layout, jpLines, formatErrorsFn) ||
                "コンパイルに失敗しました。",
            showStdinPanel: false,
            panelMode: "compile_error",
        };
    }

    if (status === "timeout") {
        return {
            output: consoleText || "（実行結果なし）",
            errorText: "実行時間が長すぎます。無限ループの可能性があります。",
            showStdinPanel: false,
            panelMode: "timeout",
        };
    }

    if (status === "internal_error") {
        return {
            output: consoleText || "（実行結果なし）",
            errorText:
                safeFormatErrors(data, layout, jpLines, formatErrorsFn) ||
                data?.errors?.[0]?.messageJa ||
                "サーバー側で予期しないエラーが発生しました。",
            showStdinPanel: false,
            panelMode: "runtime_error",
        };
    }

    if (status === "runtime_error") {
        return {
            output: consoleText || "（実行結果なし）",
            errorText:
                safeFormatErrors(data, layout, jpLines, formatErrorsFn) ||
                data?.message ||
                "実行時エラーが発生しました。",
            showStdinPanel: false,
            panelMode: "runtime_error",
        };
    }

    return {
        output: consoleText || "（実行結果なし）",
        errorText:
            safeFormatErrors(data, layout, jpLines, formatErrorsFn) ||
            data?.message ||
            "エラーが発生しました。",
        showStdinPanel: false,
        panelMode: "error",
    };
}
