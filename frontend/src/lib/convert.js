import CodeBridgeJp2c from "@shared/jp2c.js";
import CodeBridgeC2jp from "@shared/c2jp.js";

const EMPTY_LAYOUT = { bodyStartLine: 1, bodyLineCount: 0 };

function emptyJp2cResult(source, warnings) {
    return {
        normalized: source ?? "",
        body: "",
        program: "",
        varTypes: new Map(),
        warnings: warnings ?? [],
        layout: EMPTY_LAYOUT,
    };
}

function emptyC2jpResult(warnings) {
    return {
        body: "",
        program: "",
        warnings: warnings ?? [],
    };
}

export function convertJapaneseSource(source) {
    try {
        return CodeBridgeJp2c.convertJapaneseToC(source ?? "");
    } catch (err) {
        return emptyJp2cResult(source, [
            {
                messageJa: CodeBridgeJp2c.UNSUPPORTED_SYNTAX_MESSAGE,
                messageRaw: String(err?.message ?? err),
            },
        ]);
    }
}

export function convertCSource(source) {
    try {
        return CodeBridgeC2jp.convertCToJapanese(source ?? "");
    } catch (err) {
        return emptyC2jpResult([
            {
                messageJa: CodeBridgeJp2c.UNSUPPORTED_SYNTAX_MESSAGE,
                messageRaw: String(err?.message ?? err),
            },
        ]);
    }
}

export function detectNeedsStdin(source, mode = "jp2c") {
    try {
        if (mode === "c2jp") {
            return /\bscanf\s*\(/.test(source ?? "");
        }
        return CodeBridgeJp2c.detectNeedsStdin(source);
    } catch {
        return false;
    }
}

export function getDictionary() {
    return CodeBridgeJp2c.dictionary ?? [];
}

export function findUsedMappings(normalizedSource, mode = "jp2c") {
    try {
        if (mode === "c2jp") {
            return CodeBridgeC2jp.findUsedMappingsInC(normalizedSource ?? "") ?? [];
        }
    } catch {
        return [];
    }

    const dictionary = CodeBridgeJp2c.dictionary ?? [];
    const usedKeys = new Set();
    const usedList = [];
    const text = normalizedSource ?? "";
    let i = 0;

    const isJpBoundary = (ch) => {
        if (ch === "") return true;
        return /[\s(){}\[\];,=<>!&|+\-*/%]/.test(ch);
    };

    const nextNonWhitespace = (startIndex) => {
        for (let j = startIndex; j < text.length; j++) {
            if (!/\s/.test(text[j])) return text[j];
        }
        return "";
    };

    const skipStringLiteral = (startIndex) => {
        let j = startIndex + 1;
        while (j < text.length) {
            if (text[j] === "\\" && j + 1 < text.length) {
                j += 2;
                continue;
            }
            if (text[j] === "\"") return j + 1;
            j++;
        }
        return text.length;
    };

    const sorted = [...dictionary].sort((a, b) => (b.jp?.length ?? 0) - (a.jp?.length ?? 0));

    while (i < text.length) {
        if (text[i] === "\"") {
            i = skipStringLiteral(i);
            continue;
        }

        let matched = false;
        for (const item of sorted) {
            if (!item.jp || !text.startsWith(item.jp, i)) continue;
            const before = text[i - 1] ?? "";
            const after = text[i + item.jp.length] ?? "";
            if (!isJpBoundary(before) || !isJpBoundary(after)) continue;
            if (item.requiresParen) {
                const next = nextNonWhitespace(i + item.jp.length);
                if (next !== "(") continue;
            }
            if (!usedKeys.has(item.key)) {
                usedKeys.add(item.key);
                usedList.push(item);
            }
            i += item.jp.length;
            matched = true;
            break;
        }
        if (!matched) i++;
    }

    for (const rule of CodeBridgeJp2c.JAPANESE_COMPARISON_RULES ?? []) {
        if (usedKeys.has(rule.key)) continue;
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(text)) {
            usedKeys.add(rule.key);
            const item = dictionary.find((d) => d.key === rule.key);
            if (item) usedList.push(item);
        }
    }

    return usedList;
}

export function mapCompileErrorToJapanese(cLine, layout, jpLines) {
    if (cLine == null || !layout || layout.bodyLineCount === 0) {
        return {
            prefix: cLine != null ? `[生成後Cコードの${cLine}行目] ` : "",
            jpLineText: null,
        };
    }

    const jpLine = cLine - layout.bodyStartLine + 1;
    const safeLines = Array.isArray(jpLines) ? jpLines : [];
    if (jpLine >= 1 && jpLine <= layout.bodyLineCount) {
        const jpLineText = safeLines[jpLine - 1]?.trim() || null;
        return { prefix: `[${jpLine}行目] `, jpLineText };
    }

    return {
        prefix: `[生成後Cコードの${cLine}行目] `,
        jpLineText: null,
    };
}

export function formatErrors(errors, hints, layout, jpLines) {
    const lines = [];
    const safeErrors = Array.isArray(errors) ? errors : [];

    for (const err of safeErrors) {
        if (!err) continue;
        let prefix = "";
        let jpLineText = null;

        if (err.line != null) {
            const mapped = mapCompileErrorToJapanese(err.line, layout, jpLines);
            prefix = mapped.prefix;
            jpLineText = mapped.jpLineText;
        }

        lines.push(prefix + (err.messageJa || err.messageRaw || "エラー"));
        if (jpLineText) {
            lines.push("  → " + jpLineText);
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
