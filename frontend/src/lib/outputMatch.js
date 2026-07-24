/**
 * 練習提出の出力比較ポリシー
 *
 * - flexible … 全角数字を半角に正規化してから部分一致（既定）
 * - strict   … 文字列をそのまま比較（問題文で半角指定などがある場合）
 * - exact    … 正規化後の全文一致（末尾改行・行末空白は無視）
 */

/** 全角数字 → 半角 */
export function normalizeDigits(text) {
    return String(text ?? "").replace(/[０-９]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30)
    );
}

/** 比較用の軽い正規化（改行統一・末尾空白除去） */
export function normalizeOutputBasic(text) {
    return String(text ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+$/gm, "")
        .replace(/\n+$/g, "");
}

/**
 * @param {"flexible"|"strict"|"exact"} [policy]
 * @param {string} text
 */
export function prepareOutputForPolicy(text, policy = "flexible") {
    let prepared = normalizeOutputBasic(text);
    if (policy === "flexible") {
        prepared = normalizeDigits(prepared);
    }
    return prepared;
}

/**
 * @param {string} snippet
 * @param {"flexible"|"strict"|"exact"} [policy]
 */
export function prepareSnippetForPolicy(snippet, policy = "flexible") {
    if (policy === "flexible") {
        return normalizeDigits(String(snippet ?? ""));
    }
    return String(snippet ?? "");
}

/**
 * @param {string} outputText
 * @param {{ includes?: string[], oneOf?: string[] }|null|undefined} expected
 * @param {"flexible"|"strict"|"exact"} [policy]
 * @returns {{ ok: boolean, reason?: string }}
 */
export function matchExpectedOutput(outputText, expected, policy = "flexible") {
    const includes = Array.isArray(expected?.includes) ? expected.includes : [];
    const oneOf = Array.isArray(expected?.oneOf) ? expected.oneOf : [];

    if (includes.length === 0 && oneOf.length === 0) {
        return { ok: true };
    }

    const haystack = prepareOutputForPolicy(outputText, policy);

    if (policy === "exact") {
        const target = prepareOutputForPolicy(
            [...includes, ...oneOf].join("\n"),
            policy
        );
        if (haystack === target) return { ok: true };
        return {
            ok: false,
            reason: "出力が期待する内容と完全には一致しません。",
        };
    }

    for (const snippet of includes) {
        const needle = prepareSnippetForPolicy(snippet, policy);
        if (!haystack.includes(needle)) {
            return {
                ok: false,
                reason: `出力に「${snippet}」が含まれていません。`,
            };
        }
    }

    if (oneOf.length > 0) {
        const matched = oneOf.some((snippet) =>
            haystack.includes(prepareSnippetForPolicy(snippet, policy))
        );
        if (!matched) {
            return {
                ok: false,
                reason: `出力に次のいずれかが必要です: ${oneOf.join(" / ")}`,
            };
        }
    }

    return { ok: true };
}
