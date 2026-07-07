// =========================================================
// CodeBridge C言語 → 日本語 変換エンジン（基本対応）
// =========================================================

import CodeBridgeJp2c from "./jp2c.js";

const { dictionary } = CodeBridgeJp2c;

const SKIP_C2JP_TOKEN_KEYS = new Set([
    "EQ",
    "NE",
    "GE",
    "LE",
    "GT",
    "LT",
    "AND",
    "OR",
    "NOT",
]);

const dictionaryForCConvert = dictionary
    .filter((d) => d.convertible && !SKIP_C2JP_TOKEN_KEYS.has(d.key))
    .sort((a, b) => b.c.length - a.c.length);

const dictionaryForCDetect = [...dictionaryForCConvert];

const C_EXPR_OPERAND =
    "(?:[A-Za-z_][A-Za-z0-9_]*|[0-9]+(?:\\.[0-9]+)?|'(?:[^'\\\\]|\\\\.)*'|\"(?:[^\"\\\\]|\\\\.)*\"|\\([^)]+\\))";

const C_COMPARISON_RULES = [
    {
        pattern: new RegExp(`(${C_EXPR_OPERAND})\\s*!=\\s*(${C_EXPR_OPERAND})`, "g"),
        replace: "$1が$2と等しくない",
    },
    {
        pattern: new RegExp(`(${C_EXPR_OPERAND})\\s*==\\s*(${C_EXPR_OPERAND})`, "g"),
        replace: "$1が$2と等しい",
    },
    {
        pattern: new RegExp(`(${C_EXPR_OPERAND})\\s*>=\\s*(${C_EXPR_OPERAND})`, "g"),
        replace: "$1が$2以上",
    },
    {
        pattern: new RegExp(`(${C_EXPR_OPERAND})\\s*<=\\s*(${C_EXPR_OPERAND})`, "g"),
        replace: "$1が$2以下",
    },
    {
        pattern: new RegExp(`(${C_EXPR_OPERAND})\\s*>\\s*(${C_EXPR_OPERAND})`, "g"),
        replace: "$1が$2より大きい",
    },
    {
        pattern: new RegExp(`(${C_EXPR_OPERAND})\\s*<\\s*(${C_EXPR_OPERAND})`, "g"),
        replace: "$1が$2より小さい",
    },
    {
        pattern: /&&/g,
        replace: "かつ",
    },
    {
        pattern: /\|\|/g,
        replace: "または",
    },
];

function isIdentifierChar(ch) {
    return /[A-Za-z0-9_]/.test(ch);
}

function isCBoundary(ch) {
    if (ch === "") return true;
    return /[\s(){}\[\];,=<>!&|+\-*/%]/.test(ch);
}

function isCKeywordToken(cText) {
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(cText);
}

function nextNonWhitespace(text, startIndex) {
    for (let i = startIndex; i < text.length; i++) {
        if (!/\s/.test(text[i])) return text[i];
    }
    return "";
}

function mapOutsideStrings(text, callback) {
    let result = "";
    let i = 0;

    while (i < text.length) {
        if (text[i] === "\"") {
            let j = i + 1;
            result += "\"";
            while (j < text.length) {
                if (text[j] === "\\" && j + 1 < text.length) {
                    result += text[j] + text[j + 1];
                    j += 2;
                    continue;
                }
                result += text[j];
                if (text[j] === "\"") {
                    j++;
                    break;
                }
                j++;
            }
            i = j;
            continue;
        }

        const nextQuote = text.indexOf("\"", i);
        const segmentEnd = nextQuote === -1 ? text.length : nextQuote;
        result += callback(text.slice(i, segmentEnd));
        i = segmentEnd;
    }

    return result;
}

function preProcessCSource(text) {
    return text
        .replace(
            /srand\s*\(\s*\(\s*unsigned\s+int\s*\)\s*time\s*\(\s*NULL\s*\)\s*\)/g,
            "srand()"
        )
        .replace(/\brand\s*\(\s*\)/g, "rand()");
}

function tokenizeCWithDictionary(text) {
    const tokens = [];
    let i = 0;

    while (i < text.length) {
        const ch = text[i];

        if (ch === "\"") {
            let j = i + 1;
            let value = "\"";
            while (j < text.length) {
                const current = text[j];
                value += current;
                if (current === "\\" && j + 1 < text.length) {
                    value += text[j + 1];
                    j += 2;
                    continue;
                }
                if (current === "\"") {
                    j++;
                    break;
                }
                j++;
            }
            tokens.push({ type: "string", value });
            i = j;
            continue;
        }

        if (ch === "'") {
            let j = i + 1;
            let value = "'";
            while (j < text.length) {
                const current = text[j];
                value += current;
                if (current === "\\" && j + 1 < text.length) {
                    value += text[j + 1];
                    j += 2;
                    continue;
                }
                if (current === "'") {
                    j++;
                    break;
                }
                j++;
            }
            tokens.push({ type: "char", value });
            i = j;
            continue;
        }

        let matched = false;
        for (const item of dictionaryForCConvert) {
            if (!text.startsWith(item.c, i)) continue;

            const before = text[i - 1] ?? "";
            const after = text[i + item.c.length] ?? "";

            if (isCKeywordToken(item.c)) {
                if (isIdentifierChar(before) || isIdentifierChar(after)) continue;
                if (item.requiresParen) {
                    const next = nextNonWhitespace(text, i + item.c.length);
                    if (next !== "(") continue;
                }
            } else if (!isCBoundary(before) || !isCBoundary(after)) {
                continue;
            }

            tokens.push({ type: "kw", key: item.key, value: item.c });
            i += item.c.length;
            matched = true;
            break;
        }
        if (matched) continue;

        tokens.push({ type: "text", value: ch });
        i++;
    }

    return tokens;
}

function convertTokensToJapanese(tokens) {
    return tokens
        .map((token) => {
            if (token.type !== "kw") return token.value;
            if (token.key === "SRAND_INIT") return "乱数初期化";
            const item = dictionary.find((d) => d.key === token.key);
            return item ? item.jp : token.value;
        })
        .join("");
}

function fixScanfToJapanese(code) {
    return code.replace(
        /入力\s*\(\s*"(?:%d|%lf| %c)"\s*,\s*&\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g,
        "入力($1)"
    );
}

function fixPrintfToJapanese(code) {
    let result = code;

    result = result.replace(/表示\s*\(\s*"%d\\n"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "表示($1)");
    result = result.replace(/表示\s*\(\s*"%.2f\\n"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "表示($1)");
    result = result.replace(/表示\s*\(\s*"%f\\n"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "表示($1)");
    result = result.replace(/表示\s*\(\s*"%c\\n"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "表示($1)");

    result = result.replace(/表示\s*\(\s*"%d"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "続けて表示($1)");
    result = result.replace(/表示\s*\(\s*"%.2f"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "続けて表示($1)");
    result = result.replace(/表示\s*\(\s*"%f"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "続けて表示($1)");
    result = result.replace(/表示\s*\(\s*"%c"\s*,\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)/g, "続けて表示($1)");

    result = result.replace(
        /表示\s*\(\s*"((?:[^"\\]|\\.)*)\\n"\s*\)/g,
        '##PRINTF_WITH_NL##("$1")'
    );
    result = result.replace(/表示\s*\(\s*"((?:[^"\\]|\\.)*)"\s*\)/g, '続けて表示("$1")');
    result = result.replace(/##PRINTF_WITH_NL##\("((?:[^"\\]|\\.)*)"\)/g, '表示("$1")');

    return result;
}

function fixSrandToJapanese(code) {
    return code.replace(/\bsrand\s*\(\s*\)/g, "乱数初期化()");
}

function fixRandToJapanese(code) {
    return code.replace(/\brand\s*\(\s*\)/g, "乱数()");
}

function removeIncludeLines(text) {
    return text.replace(/^\s*#\s*include\b[^\n]*\n?/gm, "");
}

function findMatchingCloseBrace(text, openBraceIndex) {
    let depth = 0;
    for (let i = openBraceIndex; i < text.length; i++) {
        const ch = text[i];
        if (ch === "\"") {
            i = skipStringLiteral(text, i) - 1;
            continue;
        }
        if (ch === "'") {
            i = skipCharLiteral(text, i) - 1;
            continue;
        }
        if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function extractMainFunctionBody(text) {
    const mainRe = /\bint\s+main\s*\([^)]*\)\s*\{/g;
    const match = mainRe.exec(text);
    if (!match) return null;

    const openBrace = match.index + match[0].length - 1;
    const closeBrace = findMatchingCloseBrace(text, openBrace);
    if (closeBrace === -1) return null;

    return text.slice(openBrace + 1, closeBrace);
}

function stripBoilerplateFromBody(body) {
    return body
        .replace(/^\s*return\s+0\s*;\s*$/gm, "")
        .replace(/^\s*setbuf\s*\(\s*stdout\s*,\s*NULL\s*\)\s*;\s*$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/** 学習者向けに読むべき main 本体だけを取り出す（#include / main 宣言 / return 0 等は除外） */
function extractLearnerBody(cSource) {
    const withoutIncludes = removeIncludeLines(cSource ?? "");
    const mainBody = extractMainFunctionBody(withoutIncludes);
    const rawBody = mainBody ?? withoutIncludes.trim();
    return stripBoilerplateFromBody(rawBody);
}

function postProcessCToJapanese(code) {
    let result = code;
    result = fixSrandToJapanese(result);
    result = fixRandToJapanese(result);
    result = fixScanfToJapanese(result);
    result = fixPrintfToJapanese(result);
    result = mapOutsideStrings(result, (segment) => {
        let out = segment;
        for (const rule of C_COMPARISON_RULES) {
            out = out.replace(rule.pattern, rule.replace);
        }
        return out;
    });
    return result;
}

function skipStringLiteral(text, startIndex) {
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
}

function skipCharLiteral(text, startIndex) {
    let j = startIndex + 1;
    while (j < text.length) {
        if (text[j] === "\\" && j + 1 < text.length) {
            j += 2;
            continue;
        }
        if (text[j] === "'") return j + 1;
        j++;
    }
    return text.length;
}

function findUsedMappingsInC(source) {
    const usedKeys = new Set();
    const usedList = [];
    let i = 0;

    while (i < source.length) {
        if (source[i] === "\"") {
            i = skipStringLiteral(source, i);
            continue;
        }
        if (source[i] === "'") {
            i = skipCharLiteral(source, i);
            continue;
        }

        let matched = false;
        for (const item of dictionaryForCDetect) {
            if (!source.startsWith(item.c, i)) continue;

            const before = source[i - 1] ?? "";
            const after = source[i + item.c.length] ?? "";

            if (isCKeywordToken(item.c)) {
                if (isIdentifierChar(before) || isIdentifierChar(after)) continue;
                if (item.requiresParen) {
                    const next = nextNonWhitespace(source, i + item.c.length);
                    if (next !== "(") continue;
                }
            } else if (!isCBoundary(before) || !isCBoundary(after)) {
                continue;
            }

            if (!usedKeys.has(item.key)) {
                usedKeys.add(item.key);
                usedList.push(item);
            }
            i += item.c.length;
            matched = true;
            break;
        }
        if (!matched) i++;
    }

    if (/\bsrand\s*\(/.test(source) && !usedKeys.has("SRAND_INIT")) {
        const item = dictionary.find((d) => d.key === "SRAND_INIT");
        if (item) usedList.push(item);
    }

    return usedList;
}

function convertCToJapanese(cSource) {
    try {
        const learnerBody = extractLearnerBody(cSource ?? "");
        const preprocessed = preProcessCSource(learnerBody);
        const tokens = tokenizeCWithDictionary(preprocessed);
        const raw = convertTokensToJapanese(tokens);
        const body = postProcessCToJapanese(raw);

        return {
            body,
            program: body,
            warnings: [],
        };
    } catch (err) {
        return {
            body: "",
            program: "",
            warnings: [
                {
                    messageJa: CodeBridgeJp2c.UNSUPPORTED_SYNTAX_MESSAGE,
                    messageRaw: String(err?.message ?? err),
                },
            ],
        };
    }
}

const CodeBridgeC2jp = {
    convertCToJapanese,
    findUsedMappingsInC,
    tokenizeCWithDictionary,
    convertTokensToJapanese,
    postProcessCToJapanese,
    extractLearnerBody,
};

export default CodeBridgeC2jp;
