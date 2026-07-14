/**
 * 練習回答の言語判定と命令／構文マッピング
 * @typedef {"japanese" | "c" | "unknown"} PracticeLanguage
 */

/** 日本語命令 → C 構文（検索用パターン） */
export const JP_TO_C_COMMAND = {
    表示: { jp: "表示", cPatterns: [/printf\s*\(/] },
    入力: { jp: "入力", cPatterns: [/scanf\s*\(/] },
    もし: { jp: "もし", cPatterns: [/\bif\s*\(/] },
    そうでなくもし: { jp: "そうでなくもし", cPatterns: [/\belse\s+if\s*\(/] },
    そうでなければ: { jp: "そうでなければ", cPatterns: [/\belse\b(?!\s+if)/] },
    繰り返し: { jp: "繰り返し", cPatterns: [/\bfor\s*\(/] },
    間: { jp: "間", cPatterns: [/\bwhile\s*\(/] },
    乱数: { jp: "乱数", cPatterns: [/\brand\s*\(/] },
    乱数初期化: { jp: "乱数初期化", cPatterns: [/\bsrand\s*\(/] },
    整数: { jp: "整数", cPatterns: [/\bint\b/] },
    小数: { jp: "小数", cPatterns: [/\bdouble\b/] },
    文字: { jp: "文字", cPatterns: [/\bchar\b/] },
};

const JP_SIGNALS = [
    { re: /表示\s*\(/, weight: 3 },
    { re: /入力\s*\(/, weight: 3 },
    { re: /もし\s*\(/, weight: 3 },
    { re: /そうでなくもし/, weight: 4 },
    { re: /そうでなければ/, weight: 3 },
    { re: /繰り返し\s*\(/, weight: 3 },
    { re: /間\s*\(/, weight: 2 },
    { re: /乱数\s*\(/, weight: 2 },
    { re: /乱数初期化/, weight: 3 },
    { re: /整数\b/, weight: 2 },
    { re: /小数\b/, weight: 2 },
    { re: /文字\b/, weight: 1 },
];

const C_SIGNALS = [
    { re: /#\s*include\b/, weight: 4 },
    { re: /\bprintf\s*\(/, weight: 3 },
    { re: /\bscanf\s*\(/, weight: 3 },
    { re: /\belse\s+if\s*\(/, weight: 3 },
    { re: /\bif\s*\(/, weight: 2 },
    { re: /\belse\b/, weight: 1 },
    { re: /\bfor\s*\(/, weight: 2 },
    { re: /\bwhile\s*\(/, weight: 2 },
    { re: /\breturn\b/, weight: 2 },
    { re: /\bint\b/, weight: 1 },
    { re: /\bdouble\b/, weight: 1 },
    { re: /\bchar\b/, weight: 1 },
    { re: /\brand\s*\(/, weight: 2 },
    { re: /\bsrand\s*\(/, weight: 2 },
];

/**
 * @param {string} code
 * @returns {PracticeLanguage}
 */
export function detectPracticeLanguage(code) {
    const source = String(code ?? "");
    if (!source.trim()) return "unknown";

    let jpScore = 0;
    let cScore = 0;

    for (const { re, weight } of JP_SIGNALS) {
        if (re.test(source)) jpScore += weight;
    }
    for (const { re, weight } of C_SIGNALS) {
        if (re.test(source)) cScore += weight;
    }

    if (jpScore === 0 && cScore === 0) return "unknown";
    if (jpScore > cScore) return "japanese";
    if (cScore > jpScore) return "c";
    // 同点のときはより特徴的な記号で優先
    if (/表示\s*\(|もし\s*\(|繰り返し\s*\(/.test(source)) return "japanese";
    if (/printf\s*\(|#\s*include\b|\bscanf\s*\(/.test(source)) return "c";
    return "unknown";
}

/**
 * @param {string} cmd - practice.expectedCommands の日本語命令
 * @param {string} code
 * @param {PracticeLanguage} language
 */
export function codeContainsCommand(cmd, code, language) {
    const source = String(code ?? "");
    const mapping = JP_TO_C_COMMAND[cmd];

    if (language === "c") {
        if (!mapping) return source.includes(cmd);
        return mapping.cPatterns.some((re) => re.test(source));
    }

    // japanese / unknown → 日本語命令を探す
    if (mapping) {
        if (cmd === "乱数") return /乱数\s*\(/.test(source) || source.includes("乱数()");
        if (cmd === "もし") return /もし\s*\(/.test(source);
        if (cmd === "入力") return /入力\s*\(/.test(source);
        if (cmd === "表示") return /表示\s*\(/.test(source);
        if (cmd === "繰り返し") return /繰り返し\s*\(/.test(source);
        if (cmd === "間") return /間\s*\(/.test(source);
        return source.includes(mapping.jp);
    }
    return source.includes(cmd);
}

/**
 * @param {string[]} expectedCommands
 * @param {string} code
 * @param {PracticeLanguage} language
 * @returns {string[]}
 */
export function findMissingCommands(expectedCommands, code, language) {
    return (expectedCommands ?? []).filter(
        (cmd) => !codeContainsCommand(cmd, code, language)
    );
}

/**
 * 言語に応じた模範解答コードを返す
 * @param {{ jpCode?: string, cCode?: string }} sample
 * @param {PracticeLanguage} language
 */
export function getAnswerCodeForLanguage(sample, language) {
    if (language === "c") return sample?.cCode ?? "";
    return sample?.jpCode ?? "";
}
