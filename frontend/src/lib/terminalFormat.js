/**
 * IDE 実行コンソール用の表示整形
 * （本物の OS ターミナルではなく、学習向けの実行ログ）
 */

/**
 * @typedef {"meta"|"input"|"output"|"error"|"success"|"dim"} TerminalLineKind
 * @typedef {{ kind: TerminalLineKind, text: string }} TerminalLine
 */

/** 簡易 ANSI 除去（表示用） */
export function stripAnsi(text) {
    return String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
}

/**
 * サーバーの consoleOutput を入力行と出力行に分ける
 * 入力は "> value" 形式（server.js の inject）
 * @param {string} consoleText
 * @returns {TerminalLine[]}
 */
export function splitConsoleIntoLines(consoleText) {
    const text = stripAnsi(consoleText).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (!text.trim()) return [];

    return text.split("\n").map((line) => {
        if (/^>\s/.test(line) || line === ">") {
            return { kind: /** @type {const} */ ("input"), text: line };
        }
        return { kind: /** @type {const} */ ("output"), text: line };
    });
}

/**
 * 1回の実行セッション用ログを組み立てる
 * @param {object} opts
 * @param {string} [opts.consoleText]
 * @param {string} [opts.status]
 * @param {number|null} [opts.exitCode]
 * @param {number} [opts.elapsedMs]
 * @param {string} [opts.errorText]
 * @param {boolean} [opts.isStart]
 */
export function buildRunTerminalLines(opts = {}) {
    /** @type {TerminalLine[]} */
    const lines = [];

    if (opts.isStart) {
        lines.push({ kind: "meta", text: "実行開始..." });
        return lines;
    }

    lines.push({ kind: "meta", text: "──────── 実行結果 ────────" });

    const body = splitConsoleIntoLines(opts.consoleText ?? "");
    if (body.length === 0) {
        lines.push({ kind: "dim", text: "（出力なし）" });
    } else {
        for (const row of body) {
            lines.push(row);
        }
    }

    if (opts.errorText && opts.errorText !== "（エラーなし）" && opts.status !== "success") {
        lines.push({ kind: "dim", text: "" });
        lines.push({ kind: "error", text: "── エラー詳細 ──" });
        for (const errLine of stripAnsi(opts.errorText).split("\n")) {
            lines.push({ kind: "error", text: errLine });
        }
    }

    lines.push({ kind: "dim", text: "" });

    const exitCode = opts.exitCode;
    if (exitCode != null) {
        lines.push({
            kind: exitCode === 0 ? "success" : "error",
            text: `終了コード: ${exitCode}`,
        });
    }

    if (typeof opts.elapsedMs === "number" && opts.elapsedMs >= 0) {
        const sec = (opts.elapsedMs / 1000).toFixed(3);
        lines.push({ kind: "meta", text: `実行時間: ${sec} sec` });
    }

    if (opts.status === "success") {
        lines.push({ kind: "success", text: "実行完了" });
    } else if (opts.status === "input_required") {
        lines.push({ kind: "meta", text: "入力待ち — 「入力」タブに値を入れて再実行してください" });
    } else if (opts.status === "compile_error") {
        lines.push({ kind: "error", text: "コンパイルに失敗しました — 右サイドの「エラー」を確認" });
    } else if (opts.status === "timeout") {
        lines.push({ kind: "error", text: "タイムアウトしました" });
    } else if (opts.status) {
        lines.push({ kind: "error", text: `状態: ${opts.status}` });
    }

    return lines;
}

/**
 * Problems 用エントリ
 * @param {Array<{ line?: number|null, messageJa?: string, messageRaw?: string }>} errors
 * @param {Array<{ line: number, message: string, severity?: string }>} markers
 * @param {string} [panelMode]
 * @param {string} [errorText]
 */
export function buildProblemEntries(errors, markers, panelMode, errorText) {
    /** @type {Array<{ id: string, severity: "error"|"warning"|"info", line: number|null, message: string, source: string }>} */
    const items = [];
    const seen = new Set();

    const push = (severity, line, message, source) => {
        const key = `${severity}:${line}:${message}`;
        if (seen.has(key)) return;
        seen.add(key);
        items.push({
            id: key,
            severity,
            line: line != null && line >= 1 ? line : null,
            message: String(message || "エラー"),
            source,
        });
    };

    for (const m of markers ?? []) {
        push(m.severity === "warning" ? "warning" : "error", m.line, m.message, "エディタ");
    }

    for (const err of errors ?? []) {
        if (!err) continue;
        push(
            "error",
            typeof err.line === "number" ? err.line : null,
            err.messageJa || err.messageRaw || "エラー",
            "実行"
        );
    }

    if (
        items.length === 0 &&
        errorText &&
        errorText !== "（エラーなし）" &&
        errorText !== "エラーがない場合は空です。" &&
        panelMode &&
        panelMode !== "success"
    ) {
        const sev =
            panelMode === "input_wait" ? "info" : panelMode === "compile_error" ? "error" : "error";
        push(sev, null, errorText.split("\n")[0] || errorText, "実行");
    }

    return items;
}
