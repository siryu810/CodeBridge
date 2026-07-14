/**
 * 実行結果の errors 配列から Monaco marker 用データを作る
 * @param {Array<{ line?: number|null, messageJa?: string, messageRaw?: string }>} errors
 * @param {{ bodyStartLine?: number, bodyLineCount?: number }|null} layout - jp2c 時の行マップ
 * @returns {Array<{ line: number, message: string, severity: "error"|"warning" }>}
 */
export function buildEditorMarkersFromErrors(errors, layout = null) {
    const list = Array.isArray(errors) ? errors : [];
    /** @type {Array<{ line: number, message: string, severity: "error"|"warning" }>} */
    const markers = [];

    for (const err of list) {
        if (!err) continue;
        let line = typeof err.line === "number" ? err.line : null;
        if (line != null && layout?.bodyStartLine && layout.bodyLineCount > 0) {
            const jpLine = line - layout.bodyStartLine + 1;
            if (jpLine >= 1 && jpLine <= layout.bodyLineCount) {
                line = jpLine;
            }
        }
        if (line == null || line < 1) continue;
        markers.push({
            line,
            message: err.messageJa || err.messageRaw || "エラー",
            severity: "error",
        });
    }
    return markers;
}

/**
 * 変換警告から marker を作る（行番号が無い場合は1行目）
 * @param {Array<{ messageJa?: string, line?: number }>} warnings
 */
export function buildEditorMarkersFromWarnings(warnings) {
    const list = Array.isArray(warnings) ? warnings : [];
    return list.map((w, i) => ({
        line: typeof w.line === "number" && w.line >= 1 ? w.line : 1,
        message: w.messageJa || `変換の警告 (${i + 1})`,
        severity: /** @type {const} */ ("warning"),
    }));
}
