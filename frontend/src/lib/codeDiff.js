/**
 * 練習モード向けコード比較（学習用・採点には使わない）
 * 空白・空行・インデントの違いは「違い」にしない
 */

import { detectPracticeLanguage, getAnswerCodeForLanguage } from "./practiceLanguage.js";

/** @typedef {"same" | "missing" | "extra" | "changed"} DiffRowType */

/**
 * @typedef {object} DiffRow
 * @property {DiffRowType} type
 * @property {number|null} lineNumber
 * @property {string} userLine
 * @property {string} answerLine
 * @property {string} [message]
 * @property {string} [label]
 */

/**
 * @typedef {object} CodeDiffResult
 * @property {DiffRow[]} rows
 * @property {string[]} hints
 * @property {boolean} isExactMatch
 */

function splitLines(text) {
    return String(text ?? "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n");
}

/** 表示用: 行末空白のみ除去 */
function displayLine(line) {
    return String(line ?? "").replace(/[ \t]+$/g, "");
}

/**
 * 比較用キー: 空行無視・インデント/タブ/連続空白を同一視
 * （文字列リテラル内のスペースも潰すため完全ではないが、学習比較用途）
 */
export function normalizeLineForCompare(line) {
    return String(line ?? "")
        .replace(/\t/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
}

function isBlankLine(line) {
    return normalizeLineForCompare(line).length === 0;
}

/** 空行を除いた行配列（元テキストは保持） */
function significantLines(text) {
    return splitLines(text)
        .map(displayLine)
        .filter((line) => !isBlankLine(line));
}

/**
 * @param {string} userLine
 * @param {string} answerLine
 */
function describeLineDifference(userLine, answerLine) {
    const user = normalizeLineForCompare(userLine);
    const answer = normalizeLineForCompare(answerLine);

    if (user === answer) {
        return "内容は同じです（空白の違いは無視しています）。";
    }

    if (user + ";" === answer) {
        return "文末の ; が不足している可能性があります。";
    }
    if (user === answer + ";") {
        return "余分な ; がある可能性があります。";
    }

    if (answer.includes("もし(") && !user.includes("もし(")) {
        return "条件分岐には もし(...) { } を使います。";
    }
    if (answer.includes("そうでなくもし(") && !user.includes("そうでなくもし(")) {
        return "別の条件には そうでなくもし(...) を使います。";
    }
    if (answer.includes("そうでなければ") && !user.includes("そうでなければ")) {
        return "それ以外の処理には そうでなければ { } を使います。";
    }
    if (answer.includes("繰り返し(") && !user.includes("繰り返し(")) {
        return "繰り返し処理には 繰り返し(...) { } を使います。";
    }
    if (answer.includes("間(") && !user.includes("間(")) {
        return "条件が満たされる間は 間(...) { } を使います。";
    }
    if (answer.includes("入力(") && !user.includes("入力(")) {
        return "キーボード入力には 入力(変数); を使います。";
    }
    if (/表示\s*\(/.test(answer) && !/表示\s*\(/.test(user)) {
        return "画面への出力には 表示(...); を使います。";
    }
    if (/整数\s+\w+/.test(answer) && !/整数\s+\w+/.test(user)) {
        return "整数を扱うには 整数 変数名; で変数を宣言します。";
    }

    return "参考コードと異なる行です。動作していればそのままでも大丈夫です。";
}

/** @param {DiffRowType} type */
function labelForType(type) {
    switch (type) {
        case "same":
            return "同じ";
        case "missing":
            return "不足";
        case "extra":
            return "追加";
        case "changed":
            return "違い";
        default:
            return "";
    }
}

/**
 * LCS ベースの行差分（空行除外後）
 * @param {string[]} userLines
 * @param {string[]} answerLines
 */
function buildLineOps(userLines, answerLines) {
    const n = userLines.length;
    const m = answerLines.length;
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (
                normalizeLineForCompare(userLines[i - 1]) ===
                normalizeLineForCompare(answerLines[j - 1])
            ) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    /** @type {Array<{ kind: string, userLine?: string, answerLine?: string, userIndex?: number, answerIndex?: number }>} */
    const raw = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
        if (
            i > 0 &&
            j > 0 &&
            normalizeLineForCompare(userLines[i - 1]) ===
                normalizeLineForCompare(answerLines[j - 1])
        ) {
            raw.unshift({
                kind: "same",
                userLine: userLines[i - 1],
                answerLine: answerLines[j - 1],
                userIndex: i,
                answerIndex: j,
            });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            raw.unshift({
                kind: "missing",
                answerLine: answerLines[j - 1],
                answerIndex: j,
            });
            j--;
        } else if (i > 0) {
            raw.unshift({
                kind: "extra",
                userLine: userLines[i - 1],
                userIndex: i,
            });
            i--;
        }
    }

    /** @type {typeof raw} */
    const merged = [];
    for (let k = 0; k < raw.length; k++) {
        const cur = raw[k];
        const next = raw[k + 1];
        if (cur.kind === "extra" && next?.kind === "missing") {
            merged.push({
                kind: "changed",
                userLine: cur.userLine,
                answerLine: next.answerLine,
                userIndex: cur.userIndex,
                answerIndex: next.answerIndex,
            });
            k++;
            continue;
        }
        if (cur.kind === "missing" && next?.kind === "extra") {
            merged.push({
                kind: "changed",
                userLine: next.userLine,
                answerLine: cur.answerLine,
                userIndex: next.userIndex,
                answerIndex: cur.answerIndex,
            });
            k++;
            continue;
        }
        merged.push(cur);
    }

    return merged;
}

/** @param {ReturnType<typeof buildLineOps>} ops */
function opsToRows(ops) {
    /** @type {DiffRow[]} */
    const rows = [];
    let displayLine = 0;

    for (const op of ops) {
        if (op.kind === "same") {
            displayLine += 1;
            rows.push({
                type: "same",
                lineNumber: displayLine,
                userLine: op.userLine ?? "",
                answerLine: op.answerLine ?? "",
                label: labelForType("same"),
            });
            continue;
        }

        if (op.kind === "missing") {
            displayLine += 1;
            rows.push({
                type: "missing",
                lineNumber: displayLine,
                userLine: "",
                answerLine: op.answerLine ?? "",
                message: `${displayLine}行目付近：参考コードにはこの行があります（必須ではありません）。`,
                label: labelForType("missing"),
            });
            continue;
        }

        if (op.kind === "extra") {
            displayLine += 1;
            rows.push({
                type: "extra",
                lineNumber: displayLine,
                userLine: op.userLine ?? "",
                answerLine: "",
                message: `${displayLine}行目付近：参考コードにはない行です（動作していれば問題ありません）。`,
                label: labelForType("extra"),
            });
            continue;
        }

        if (op.kind === "changed") {
            displayLine += 1;
            const userLine = op.userLine ?? "";
            const answerLine = op.answerLine ?? "";
            rows.push({
                type: "changed",
                lineNumber: displayLine,
                userLine,
                answerLine,
                message: `${displayLine}行目付近：${describeLineDifference(userLine, answerLine)}`,
                label: labelForType("changed"),
            });
        }
    }

    return rows;
}

/** @param {DiffRow[]} rows @param {string} userCode @param {string} answerCode */
function collectHints(rows, userCode, answerCode) {
    /** @type {string[]} */
    const hints = [];
    const add = (text) => {
        if (!hints.includes(text)) hints.push(text);
    };

    const user = String(userCode ?? "").trim();
    const answer = String(answerCode ?? "").trim();

    add("この比較は学習用です。書き方が違っても、正しく動作すれば正解です。");

    if (!user) {
        add("まずは1行から書き始めましょう。参考コードの流れを参考にしてください。");
        return hints;
    }

    if (!answer) {
        add("参考コードが設定されていません。");
        return hints;
    }

    for (const row of rows) {
        if (row.type === "changed" && row.message) {
            const msg = row.message.replace(/^\d+行目付近：/, "");
            if (
                msg &&
                !msg.includes("参考コードと異なる行") &&
                !msg.includes("空白の違い")
            ) {
                add(msg);
            }
        }
    }

    const hasMissingSemicolon = rows.some(
        (r) =>
            r.type === "changed" &&
            normalizeLineForCompare(r.userLine) + ";" ===
                normalizeLineForCompare(r.answerLine)
    );
    if (hasMissingSemicolon) {
        add("文の最後には ; が必要です。");
    }

    if (rows.some((r) => r.type === "missing")) {
        add("足りない処理がないか、アルゴリズムの流れを見直してみましょう。");
    }

    if (rows.some((r) => r.type === "extra")) {
        add("余分な処理があっても、テストに通っていれば問題ありません。");
    }

    if (/表示\s*\([^"]*"/.test(answer) || answer.includes('表示("')) {
        add('表示したい文字は " " で囲みます。');
    }

    if (answer.includes("もし(")) {
        add("条件式には もし(...) { } を使います。");
    }

    if (answer.includes("入力(")) {
        add("入力した値を使うには、先に 整数 や 小数 などの変数を用意します。");
    }

    if (answer.includes("繰り返し(") || answer.includes("間(")) {
        add("繰り返しには { } で囲んだ処理を書きます。");
    }

    if (hints.length <= 1 && rows.some((r) => r.type !== "same")) {
        add("参考コードと見比べながら、処理の流れを確認してみましょう。");
    }

    return hints;
}

/**
 * @param {string} userCode
 * @param {string} answerCode
 * @returns {CodeDiffResult}
 */
export function compareCodeLines(userCode, answerCode) {
    const userTrimmed = String(userCode ?? "").trim();
    const answerTrimmed = String(answerCode ?? "").trim();

    if (!userTrimmed && !answerTrimmed) {
        return {
            rows: [],
            hints: ["コードが空です。問題文を読んで書き始めましょう。"],
            isExactMatch: true,
            language: "unknown",
        };
    }

    if (!userTrimmed) {
        const answerLines = significantLines(answerCode);
        const rows = answerLines.map((line, index) => ({
            type: /** @type {const} */ ("missing"),
            lineNumber: index + 1,
            userLine: "",
            answerLine: line,
            message: `${index + 1}行目：この行が参考コードにあります。`,
            label: labelForType("missing"),
        }));
        return {
            rows,
            hints: collectHints(rows, userCode, answerCode),
            isExactMatch: false,
            language: "unknown",
        };
    }

    if (!answerTrimmed) {
        const userLines = significantLines(userCode);
        const rows = userLines.map((line, index) => ({
            type: /** @type {const} */ ("extra"),
            lineNumber: index + 1,
            userLine: line,
            answerLine: "",
            message: `${index + 1}行目：参考コードにない行です。`,
            label: labelForType("extra"),
        }));
        return {
            rows,
            hints: ["参考コードが設定されていません。"],
            isExactMatch: false,
            language: "unknown",
        };
    }

    const userLines = significantLines(userCode);
    const answerLines = significantLines(answerCode);

    const ops = buildLineOps(userLines, answerLines);
    const rows = opsToRows(ops);
    const isExactMatch = rows.length === 0 || rows.every((r) => r.type === "same");

    return {
        rows,
        hints: isExactMatch
            ? [
                  "この比較は学習用です。書き方が違っても、正しく動作すれば正解です。",
                  "参考コードと同じ流れになっています。",
              ]
            : collectHints(rows, userCode, answerCode),
        isExactMatch,
        language: "unknown",
    };
}

/** @deprecated compareCodeLines を使用。互換のため残す */
export function compareJapaneseCode(userCode, answerCode) {
    return compareCodeLines(userCode, answerCode);
}

/**
 * 回答言語に合った参考コードと比較する（採点外）
 * @param {string} userCode
 * @param {{ jpCode?: string, cCode?: string }} sample
 * @param {"japanese"|"c"|"unknown"|"auto"} [language]
 */
export function comparePracticeCode(userCode, sample, language = "auto") {
    /** @type {"japanese"|"c"|"unknown"} */
    let lang =
        language && language !== "auto" ? language : detectPracticeLanguage(userCode);
    if (lang === "unknown") lang = "japanese";

    const answerCode = getAnswerCodeForLanguage(sample, lang);
    const result = compareCodeLines(userCode, answerCode);
    return {
        ...result,
        language: lang,
        answerCode,
    };
}
