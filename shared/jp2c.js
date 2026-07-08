// =========================================================
// CodeBridge 日本語 → C 変換エンジン
// 型追跡に基づく printf / scanf の正しい C コード生成
// =========================================================

const IDENT =
    "[A-Za-z_][A-Za-z0-9_]*|[\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FAF]+";

const dictionary = [
    { key: "PRINTF", category: "出力", jp: "表示", c: "printf", description: "文字を画面へ表示する命令（改行あり）", convertible: true, requiresParen: true, july: true },
    { key: "PRINTF_CONT", category: "出力", jp: "続けて表示", c: "printf_no_nl", description: "改行なしで文字を画面へ表示する命令", convertible: true, requiresParen: true, july: true },
    { key: "SCANF", category: "入力", jp: "入力", c: "scanf", description: "キーボードから値を読み込む命令", convertible: true, requiresParen: true, july: true },
    { key: "IF", category: "条件分岐", jp: "もし", c: "if", description: "条件によって処理を分岐する", convertible: true, requiresParen: true, july: true },
    { key: "ELSE", category: "条件分岐", jp: "そうでなければ", c: "else", description: "条件が偽のときに実行する分岐", convertible: true, requiresParen: false, july: true },
    { key: "ELSE_IF", category: "条件分岐", jp: "そうでなくもし", c: "else if", description: "別の条件で分岐を追加する（else if）", convertible: true, requiresParen: true, july: true },
    { key: "ELSE_IF_ALT", category: "条件分岐", jp: "それ以外もし", c: "else if", description: "別の条件で分岐を追加する（else if）", convertible: true, requiresParen: true },
    { key: "FOR", category: "繰り返し", jp: "繰り返し", c: "for", description: "決めた回数や条件で繰り返すループ", convertible: true, requiresParen: true, july: true },
    { key: "WHILE", category: "繰り返し", jp: "間", c: "while", description: "条件が真の間、繰り返すループ", convertible: true, requiresParen: true, july: true },
    { key: "DO", category: "繰り返し", jp: "do", c: "do", description: "処理を先に1回実行してから条件を判定する（do-while）", convertible: true, requiresParen: false },
    { key: "INT", category: "型", jp: "整数", c: "int", description: "整数を扱う型", convertible: true, requiresParen: false, july: true },
    { key: "DOUBLE", category: "型", jp: "小数", c: "double", description: "小数を扱う型", convertible: true, requiresParen: false, july: true },
    { key: "CHAR", category: "型", jp: "文字", c: "char", description: "1文字を扱う型", convertible: true, requiresParen: false },
    { key: "STRING", category: "型", jp: "文字列", c: "char", displayC: "char[]", description: "文字列を格納する（charの配列として使う）", convertible: true, requiresParen: false },
    { key: "VOID", category: "型", jp: "戻り値なし", c: "void", description: "戻り値を持たない関数の型", convertible: true, requiresParen: false },
    { key: "RETURN", category: "制御", jp: "戻る", c: "return", description: "関数から値を返して終了する", convertible: true, requiresParen: false, july: true },
    { key: "RAND", category: "制御", jp: "乱数", c: "rand", description: "ランダムな整数を得る（例: 乱数() % 3）", convertible: true, requiresParen: true, july: true },
    { key: "SRAND_INIT", category: "制御", jp: "乱数初期化", c: "srand", description: "乱数の種を今の時刻で初期化する（毎回ちがう乱数にする）", convertible: true, requiresParen: true, july: true },
    { key: "BREAK", category: "制御", jp: "抜ける", c: "break", description: "ループや switch から抜ける", convertible: true, requiresParen: false },
    { key: "CONTINUE", category: "制御", jp: "続ける", c: "continue", description: "ループの残りを飛ばして次の繰り返しへ", convertible: true, requiresParen: false },
    { key: "EQ_PHRASE_TO", category: "比較", jp: "と等しい", c: "==", description: "左と右が同じか", convertible: false, july: true },
    { key: "EQ_PHRASE_GA", category: "比較", jp: "が等しい", c: "==", description: "左と右が同じか", convertible: false, july: true },
    { key: "NE_PHRASE_TO", category: "比較", jp: "と等しくない", c: "!=", description: "左と右が違うか", convertible: false, july: true },
    { key: "NE_PHRASE_GA", category: "比較", jp: "が等しくない", c: "!=", description: "左と右が違うか", convertible: false, july: true },
    { key: "GT_PHRASE", category: "比較", jp: "より大きい", c: ">", description: "左が右より大きい", convertible: false, july: true },
    { key: "LT_PHRASE", category: "比較", jp: "より小さい", c: "<", description: "左が右より小さい", convertible: false, july: true },
    { key: "GE_PHRASE", category: "比較", jp: "以上", c: ">=", description: "左が右以上", convertible: false, july: true },
    { key: "LE_PHRASE", category: "比較", jp: "以下", c: "<=", description: "左が右以下", convertible: false, july: true },
    { key: "EQ", category: "比較", jp: "等しい", c: "==", description: "左右が同じか", convertible: true, requiresParen: false, july: true },
    { key: "NE", category: "比較", jp: "等しくない", c: "!=", description: "左右が違うか", convertible: true, requiresParen: false, july: true },
    { key: "GE", category: "比較", jp: "以上", c: ">=", description: "左が右以上", convertible: true, requiresParen: false, july: true },
    { key: "LE", category: "比較", jp: "以下", c: "<=", description: "左が右以下", convertible: true, requiresParen: false, july: true },
    { key: "GT", category: "比較", jp: "より大きい", c: ">", description: "左が右より大きい", convertible: true, requiresParen: false, july: true },
    { key: "LT", category: "比較", jp: "より小さい", c: "<", description: "左が右より小さい", convertible: true, requiresParen: false, july: true },
    { key: "AND", category: "論理", jp: "かつ", c: "&&", description: "両方の条件が真のときだけ真", convertible: true, requiresParen: false, july: true },
    { key: "OR", category: "論理", jp: "または", c: "||", description: "どちらか一方でも真なら真", convertible: true, requiresParen: false, july: true },
    { key: "NOT", category: "論理", jp: "ではない", c: "!", description: "条件の真偽を反転する", convertible: true, requiresParen: false },
    { key: "CONST", category: "その他", jp: "定数", c: "const", description: "変更できない値・変数を表す", convertible: true, requiresParen: false },
    { key: "STRUCT", category: "その他", jp: "構造体", c: "struct", description: "複数のデータをまとめる型", convertible: true, requiresParen: false },
    { key: "ARRAY", category: "その他", jp: "配列", c: "[]", description: "同じ型のデータを並べて扱う", convertible: false, requiresParen: false },
    { key: "PTR", category: "その他", jp: "ポインタ", c: "*", description: "メモリ上の場所を指し示す", convertible: false, requiresParen: false },
    { key: "ADDR", category: "その他", jp: "アドレス", c: "&", description: "変数のメモリアドレスを取得する", convertible: false, requiresParen: false },
];

const dictionaryForJpConvert = dictionary
    .filter((d) => d.convertible)
    .sort((a, b) => b.jp.length - a.jp.length);

const JP_EXPR_OPERAND =
    "(?:[A-Za-z_][A-Za-z0-9_]*|[0-9]+(?:\\.[0-9]+)?|[\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FAF]+|\\([^)]+\\))";

const JAPANESE_COMPARISON_RULES = [
    {
        key: "NE_PHRASE_TO",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*と等しくない`, "g"),
        replace: "$1 != $2",
    },
    {
        key: "NE_PHRASE_GA",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*が等しくない`, "g"),
        replace: "$1 != $2",
    },
    {
        key: "EQ_PHRASE_TO",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*と等しい`, "g"),
        replace: "$1 == $2",
    },
    {
        key: "EQ_PHRASE_GA",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*が等しい`, "g"),
        replace: "$1 == $2",
    },
    {
        key: "GT_PHRASE",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*より大きい`, "g"),
        replace: "$1 > $2",
    },
    {
        key: "LT_PHRASE",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*より小さい`, "g"),
        replace: "$1 < $2",
    },
    {
        key: "GE_PHRASE",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*以上`, "g"),
        replace: "$1 >= $2",
    },
    {
        key: "LE_PHRASE",
        pattern: new RegExp(`(${JP_EXPR_OPERAND})\\s*が\\s*(${JP_EXPR_OPERAND})\\s*以下`, "g"),
        replace: "$1 <= $2",
    },
];

function isJpBoundary(ch) {
    if (ch === "") return true;
    return /[\s(){}\[\];,=<>!&|+\-*/%]/.test(ch);
}

function nextNonWhitespace(text, startIndex) {
    for (let i = startIndex; i < text.length; i++) {
        if (!/\s/.test(text[i])) return text[i];
    }
    return "";
}

function normalizeJapaneseInput(text) {
    return mapOutsideStrings(text, (segment) =>
        segment
            .normalize("NFKC")
            .replaceAll("（", "(")
            .replaceAll("）", ")")
            .replaceAll("；", ";")
            .replace(/[“”]/g, "\"")
    );
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

function preProcessJapaneseExpressions(text) {
    return mapOutsideStrings(text, (segment) => {
        let result = segment;
        for (const rule of JAPANESE_COMPARISON_RULES) {
            result = result.replace(rule.pattern, rule.replace);
        }
        return result;
    });
}

function tokenizeWithDictionary(text) {
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

        let matched = false;
        for (const item of dictionaryForJpConvert) {
            if (!text.startsWith(item.jp, i)) continue;

            const before = text[i - 1] ?? "";
            const after = text[i + item.jp.length] ?? "";
            if (!isJpBoundary(before) || !isJpBoundary(after)) continue;

            if (item.requiresParen) {
                const next = nextNonWhitespace(text, i + item.jp.length);
                if (next !== "(") continue;
            }

            tokens.push({ type: "kw", key: item.key, value: item.jp });
            i += item.jp.length;
            matched = true;
            break;
        }
        if (matched) continue;

        tokens.push({ type: "text", value: ch });
        i++;
    }

    return tokens;
}

function convertTokensToC(tokens) {
    return tokens
        .map((token) => {
            if (token.type !== "kw") return token.value;
            const item = dictionary.find((d) => d.key === token.key);
            return item ? item.c : token.value;
        })
        .join("");
}

/** 乱数() → rand() */
function fixRandCallSyntax(code) {
    return code.replace(/rand\s*\(\s*\)/g, "rand()");
}

/** 乱数初期化() → srand((unsigned int)time(NULL)) */
function fixSrandInitSyntax(code) {
    return code.replace(/\bsrand\s*\(\s*\)/g, "srand((unsigned int)time(NULL))");
}

/** コード中の変数名 → 型（int / double / char） */
function extractVariableTypes(code) {
    const types = new Map();
    const declPattern = new RegExp(
        `\\b(int|double|char)\\s+(${IDENT})(\\[[^\\]]*\\])?(?:\\s*[=;,]|\\s*$)`,
        "g"
    );
    let match;
    while ((match = declPattern.exec(code)) !== null) {
        if (match[1] === "char" && match[3]) {
            types.set(match[2], "cstring");
        } else {
            types.set(match[2], match[1]);
        }
    }
    return types;
}

function findMatchingCloseParen(text, openParenIndex) {
    let depth = 0;
    let inString = false;

    for (let i = openParenIndex; i < text.length; i++) {
        const ch = text[i];
        if (inString) {
            if (ch === "\\" && i + 1 < text.length) {
                i++;
                continue;
            }
            if (ch === "\"") inString = false;
            continue;
        }
        if (ch === "\"") {
            inString = true;
            continue;
        }
        if (ch === "(") depth++;
        else if (ch === ")") {
            depth--;
            if (depth === 0) return i;
        }
    }

    return -1;
}

function replaceFunctionCalls(code, functionNames, replacer) {
    let result = "";
    let i = 0;

    while (i < code.length) {
        let matched = false;

        for (const fn of functionNames) {
            if (!code.startsWith(fn, i)) continue;
            const before = code[i - 1] ?? "";
            if (/[A-Za-z0-9_]/.test(before)) continue;

            const openParen = i + fn.length;
            if (code[openParen] !== "(") continue;

            const closeParen = findMatchingCloseParen(code, openParen);
            if (closeParen === -1) continue;

            const argsRaw = code.slice(openParen + 1, closeParen);
            const fullMatch = code.slice(i, closeParen + 1);
            result += replacer(fn, argsRaw, fullMatch);
            i = closeParen + 1;
            matched = true;
            break;
        }

        if (!matched) {
            result += code[i];
            i++;
        }
    }

    return result;
}

function processPrintfArgs(argsRaw, varTypes, addNewline) {
    const args = argsRaw.trim();
    if (!args) return null;

    if (args.startsWith("\"")) {
        let end = 1;
        while (end < args.length) {
            if (args[end] === "\\") {
                end += 2;
                continue;
            }
            if (args[end] === "\"") break;
            end++;
        }
        const literal = args.slice(0, end + 1);
        const rest = args.slice(end + 1).trim();
        if (rest.startsWith(",")) {
            const fmt = addNewline ? addNewlineToStringLiteral(literal) : literal;
            return `printf(${fmt}, ${rest.slice(1).trim()})`;
        }
        const fmt = addNewline ? addNewlineToStringLiteral(literal) : literal;
        return `printf(${fmt})`;
    }

    if (args.includes(",")) return null;

    const nameMatch = args.match(new RegExp(`^(${IDENT})$`));
    const name = nameMatch ? nameMatch[1] : args;
    const type = varTypes.get(name) ?? "int";
    const fmt = addNewline ? printfFormatForType(type) : printfFormatForTypeNoNewline(type);
    return `printf("${fmt}", ${args})`;
}

function addNewlineToStringLiteral(literal) {
    if (!literal.startsWith("\"") || !literal.endsWith("\"")) return literal;
    const inner = literal.slice(1, -1);
    if (inner.endsWith("\\n")) return literal;
    return `"${inner}\\n"`;
}

function printfFormatForTypeNoNewline(type) {
    if (type === "double") return "%.2f";
    if (type === "char") return "%c";
    if (type === "cstring") return "%s";
    return "%d";
}

/** 続けて表示(...) → 改行なしの printf */
function fixPrintfNoNewline(code, varTypes) {
    return replaceFunctionCalls(code, ["printf_no_nl"], (_fn, argsRaw, fullMatch) => {
        const converted = processPrintfArgs(argsRaw, varTypes, false);
        return converted ?? fullMatch;
    });
}

function printfFormatForType(type) {
    if (type === "double") return "%.2f\\n";
    if (type === "char") return "%c\\n";
    if (type === "cstring") return "%s\\n";
    return "%d\\n";
}

function scanfFormatForType(type) {
    if (type === "double") return "%lf";
    if (type === "char") return " %c";
    if (type === "cstring") return "%s";
    return "%d";
}

/** 表示(...) → 型に応じた printf、文字列は改行付き */
function fixPrintfByVariableTypes(code, varTypes) {
    return replaceFunctionCalls(code, ["printf"], (_fn, argsRaw, fullMatch) => {
        const converted = processPrintfArgs(argsRaw, varTypes, true);
        return converted ?? fullMatch;
    });
}

/** 入力(...) → 型に応じた scanf */
function fixScanfByVariableTypes(code, varTypes) {
    return code.replace(/scanf\s*\(\s*([^)]*?)\s*\)/g, (match, argsRaw) => {
        const args = argsRaw.trim();
        if (!args || args.startsWith("\"")) return match;

        const nameMatch = args.match(new RegExp(`^&?(${IDENT})$`));
        if (!nameMatch) return match;

        const name = nameMatch[1];
        const type = varTypes.get(name) ?? "int";
        if (type === "cstring") {
            return `scanf("${scanfFormatForType(type)}", ${name})`;
        }
        return `scanf("${scanfFormatForType(type)}", &${name})`;
    });
}

function removeConsecutiveDuplicateLines(code) {
    const lines = code.split(/\r?\n/);
    const out = [];
    let prevTrimmed = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length > 0 && trimmed === prevTrimmed && trimmed !== "}" && trimmed !== "{") {
            continue;
        }
        out.push(line);
        if (trimmed.length > 0) prevTrimmed = trimmed;
    }

    return out.join("\n");
}

/** 変換ミスの疑いを検出 */
const UNSUPPORTED_SYNTAX_MESSAGE =
    "この構文はまだ対応していません。命令の綴りやカッコを確認してください。";

function detectRemainingJapaneseKeywords(body) {
    const warnings = [];
    const checkPattern =
        /(?:続けて表示|表示|入力|もし|そうでなくもし|そうでなければ|整数|小数|文字|乱数初期化|乱数|戻る|繰り返し)\s*\(/;
    let found = false;

    mapOutsideStrings(body, (segment) => {
        if (checkPattern.test(segment)) found = true;
        return segment;
    });

    if (found) {
        warnings.push({ messageJa: UNSUPPORTED_SYNTAX_MESSAGE });
    }
    return warnings;
}

function validateConvertedBody(code) {
    const warnings = [];

    if (/printf\s*\(\s*[^"%',][^,)]*\s*\)/.test(code)) {
        warnings.push({
            messageJa: "表示(変数) の変換に失敗している可能性があります。変数の型（整数・小数・文字）を宣言しているか確認してください。",
        });
    }
    if (/scanf\s*\(\s*[^"%'][^,)]*\s*\)/.test(code)) {
        warnings.push({
            messageJa: "入力(変数) の変換に失敗している可能性があります。変数の型を宣言してから 入力(...) を使ってください。",
        });
    }

    return warnings;
}

function countBracesOutsideStrings(line) {
    let openCount = 0;
    let closeCount = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === "\\") {
                escaped = true;
                continue;
            }
            if (ch === "\"") inString = false;
            continue;
        }
        if (ch === "\"") {
            inString = true;
            continue;
        }
        if (ch === "{") openCount++;
        if (ch === "}") closeCount++;
    }

    return { openCount, closeCount };
}

function reindentCBlock(codeText, baseIndentLevel) {
    const indentSize = 4;
    const lines = codeText.split(/\r?\n/);
    let indentLevel = baseIndentLevel;
    const result = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length === 0) {
            result.push("");
            continue;
        }

        let leadingClose = 0;
        while (leadingClose < trimmed.length && trimmed[leadingClose] === "}") leadingClose++;

        const { openCount, closeCount } = countBracesOutsideStrings(line);
        const remainingClose = Math.max(0, closeCount - leadingClose);

        indentLevel = Math.max(0, indentLevel - leadingClose);
        result.push(" ".repeat(indentLevel * indentSize) + trimmed);
        indentLevel = indentLevel + openCount - remainingClose;
    }

    return result.join("\n").trimEnd();
}

function getCProgramParts(convertedBody) {
    const hasReturn = /\breturn\b/.test(convertedBody);
    const body = convertedBody.trim();

    const includes = ["#include <stdio.h>"];
    if (/\brand\s*\(/.test(body)) {
        includes.push("#include <stdlib.h>");
    }
    if (/\bsrand\s*\(/.test(body) || /\btime\s*\(/.test(body)) {
        includes.push("#include <time.h>");
    }
    if (/\bstrlen\s*\(/.test(body)) {
        includes.push("#include <string.h>");
    }

    const bodyBlock = body.length > 0 ? reindentCBlock(body, 1) : "";
    const bodyLines = bodyBlock.length > 0 ? bodyBlock.split(/\r?\n/) : [];
    const bodyStartLine = includes.length + 5;

    return { includes, bodyBlock, bodyLines, hasReturn, body, bodyStartLine };
}

function buildCProgram(convertedBody) {
    const parts = getCProgramParts(convertedBody);

    let output = `${parts.includes.join("\n")}\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n`;

    if (parts.body.length > 0) {
        output += `${parts.bodyBlock}\n`;
        if (!parts.hasReturn) output += "\n    return 0;\n";
    } else {
        output += "    return 0;\n";
    }

    output += "}";
    return output;
}

function computeCProgramLayout(convertedBody) {
    const parts = getCProgramParts(convertedBody);
    return {
        bodyStartLine: parts.bodyStartLine,
        bodyLineCount: parts.bodyLines.length,
    };
}

function postProcessJapaneseToC(code) {
    let result = fixRandCallSyntax(code);
    result = fixSrandInitSyntax(result);
    const varTypes = extractVariableTypes(result);
    result = fixScanfByVariableTypes(result, varTypes);
    result = fixPrintfByVariableTypes(result, varTypes);
    result = fixPrintfNoNewline(result, varTypes);
    result = removeConsecutiveDuplicateLines(result);
    const warnings = validateConvertedBody(result);
    return { code: result, varTypes, warnings };
}

function convertJapaneseToC(japaneseSource) {
    try {
        const normalized = normalizeJapaneseInput(japaneseSource ?? "");
        const preprocessed = preProcessJapaneseExpressions(normalized);
        const tokens = tokenizeWithDictionary(preprocessed);
        const rawBody = convertTokensToC(tokens);
        const { code: body, varTypes, warnings } = postProcessJapaneseToC(rawBody);
        const layout = computeCProgramLayout(body);
        const program = buildCProgram(body);
        const allWarnings = [...warnings, ...detectRemainingJapaneseKeywords(body)];

        return {
            normalized,
            body,
            program,
            varTypes,
            warnings: allWarnings,
            layout,
        };
    } catch (err) {
        return {
            normalized: normalizeJapaneseInput(japaneseSource ?? ""),
            body: "",
            program: "",
            varTypes: new Map(),
            warnings: [
                {
                    messageJa: UNSUPPORTED_SYNTAX_MESSAGE,
                    messageRaw: String(err?.message ?? err),
                },
            ],
            layout: { bodyStartLine: 1, bodyLineCount: 0 },
        };
    }
}

function detectNeedsStdin(japaneseSource) {
    if (!japaneseSource) return false;
    const normalized = normalizeJapaneseInput(japaneseSource);
    return /入力\s*\(/.test(normalized);
}

const CodeBridgeJp2c = {
    dictionary,
    JAPANESE_COMPARISON_RULES,
    normalizeJapaneseInput,
    preProcessJapaneseExpressions,
    tokenizeWithDictionary,
    convertTokensToC,
    extractVariableTypes,
    postProcessJapaneseToC,
    buildCProgram,
    computeCProgramLayout,
    convertJapaneseToC,
    detectNeedsStdin,
    validateConvertedBody,
    UNSUPPORTED_SYNTAX_MESSAGE,
};

export default CodeBridgeJp2c;
