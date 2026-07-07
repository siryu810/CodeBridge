// =========================================================

// CodeBridge 学習IDE — 実行・結果表示

//

// サーバーから status 別の JSON を受け取り、

// 「コンソール」と「状態欄」を分けて表示する

// =========================================================



const RUN_API_URL = "http://localhost:3000/run";



const INPUT_WAIT_MESSAGE =

    "このプログラムは入力を待っています。\n実行時入力欄に値を入れてから再度「実行」してください。";



function getCCodeToSend() {
    const mode =
        typeof window.getInputMode === "function"
            ? window.getInputMode()
            : document.querySelector('input[name="inputMode"]:checked')?.value ?? "jp2c";

    if (mode === "c2jp") {
        const inputEl = document.getElementById("inputCode");
        return inputEl ? inputEl.value : "";
    }

    if (typeof window.getConvertedCCode === "function") {
        const c = window.getConvertedCCode();
        if (c && c.trim()) return c;
    }

    const outputEl = document.getElementById("outputCode");
    return outputEl ? outputEl.textContent : "";
}



function getRunStdin() {

    const el = document.getElementById("runStdin");

    return el ? el.value : "";

}



function setRunOutput(text) {

    const el = document.getElementById("runOutput");

    if (el) el.textContent = text;

}



function pickConsoleText(data) {

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



function setRunError(text, mode = "error") {

    const el = document.getElementById("runError");

    if (el) {

        el.textContent = text;

        el.classList.toggle("run-input-wait", mode === "input_wait");

        el.classList.toggle("run-error", mode !== "input_wait");

    }

    const titleEl = document.getElementById("runErrorPanelTitle");

    if (titleEl) {

        titleEl.textContent = mode === "input_wait" ? "④ 入力待ち" : "④ 日本語エラー";

    }

}



/** エラー配列を日本語表示用テキストに */

function formatErrors(errors, hints) {

    const lines = [];

    const mapLine =

        typeof window.mapCompileErrorToJapanese === "function"

            ? window.mapCompileErrorToJapanese

            : null;



    if (Array.isArray(errors) && errors.length > 0) {

        for (const err of errors) {

            let prefix = "";

            let jpLineText = null;



            if (err.line != null) {

                if (mapLine) {

                    const mapped = mapLine(err.line);

                    prefix = mapped.prefix;

                    jpLineText = mapped.jpLineText;

                } else {

                    prefix = `[生成後Cコードの${err.line}行目] `;

                }

            }



            lines.push(prefix + (err.messageJa || err.messageRaw || "エラー"));

            if (jpLineText) {

                lines.push("  → " + jpLineText);

            }

        }

    }



    if (Array.isArray(hints) && hints.length > 0) {

        lines.push("");

        lines.push("【ヒント】");

        for (const h of hints) {

            lines.push("・" + h);

        }

    }



    return lines.join("\n").trim();

}



/** サーバー応答を ③コンソール / ④状態欄 に振り分け */

function displayRunResponse(data) {

    const status = data.status || (data.ok ? "success" : "runtime_error");

    const consoleText = pickConsoleText(data);



    if (status === "success") {

        let out = consoleText || "（出力はありませんでした）";

        if (!consoleText && data.exitCode != null) {

            out += `\n（終了コード: ${data.exitCode}）`;

        }

        setRunOutput(out);

        if (data.errors && data.errors.length > 0) {

            setRunError(formatErrors(data.errors, data.hints), "success");

        } else {

            setRunError("（エラーなし）", "success");

        }

        return;

    }



    if (status === "input_required") {

        setRunOutput(consoleText || "（まだ出力はありません）");

        setRunError("入力が必要です\n\n" + INPUT_WAIT_MESSAGE, "input_wait");

        if (typeof window.updateStdinPanel === "function") {

            window.updateStdinPanel();

        }

        const stdinPanel = document.getElementById("stdinPanel");

        if (stdinPanel) stdinPanel.classList.remove("is-hidden");

        return;

    }



    if (status === "compile_error") {

        setRunOutput(consoleText || "（実行結果なし）");

        setRunError(

            formatErrors(data.errors, data.hints) || "コンパイルに失敗しました。",

            "compile_error"

        );

        return;

    }



    if (status === "timeout") {

        setRunOutput(consoleText || "（実行結果なし）");

        setRunError("実行時間が長すぎます。無限ループの可能性があります。", "timeout");

        return;

    }



    if (status === "runtime_error") {

        setRunOutput(consoleText || "（実行結果なし）");

        setRunError(

            formatErrors(data.errors, data.hints) || "実行時エラーが発生しました。",

            "runtime_error"

        );

        return;

    }



    setRunOutput(consoleText || "（実行結果なし）");

    setRunError(formatErrors(data.errors, data.hints) || data.message || "エラーが発生しました。", "error");

}



async function runCodeOnServer() {

    const code = getCCodeToSend();



    if (!code.trim()) {

        setRunOutput("（コードがありません）");

        setRunError("日本語Cエディタにコードを書くか、サンプルを選んでください。");

        return;

    }



    const convertWarnings =

        typeof window.getConversionWarnings === "function" ? window.getConversionWarnings() : [];

    if (convertWarnings.length > 0) {

        setRunOutput("（変換の警告があります — 実行前に確認してください）");

        setRunError(convertWarnings.map((w) => "⚠ " + w.messageJa).join("\n"));

        return;

    }



    setRunOutput("コンパイル・実行中...");

    setRunError("");



    const runButton = document.getElementById("runButton");

    if (runButton) runButton.disabled = true;



    try {

        const response = await fetch(RUN_API_URL, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ code, stdin: getRunStdin() }),

        });



        const data = await response.json();

        displayRunResponse(data);

    } catch (error) {

        setRunOutput("（通信失敗）");

        setRunError(

            "サーバーと通信できませんでした。\n\n" +

                String(error.message || error) +

                "\n\nnpm start でサーバーを起動してください。"

        );

    } finally {

        if (runButton) runButton.disabled = false;

    }

}



function setupRunButton() {

    const runButton = document.getElementById("runButton");

    if (!runButton) return;

    runButton.addEventListener("click", runCodeOnServer);

}



window.setupRunButton = setupRunButton;


