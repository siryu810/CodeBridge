/**
 * Monaco 用 codebridge-jp 言語定義
 * @param {import("monaco-editor").editor.IStandaloneCodeEditor | typeof import("monaco-editor")} monacoOrEditor
 *   beforeMount では monaco 本体が渡る
 */
const CODEBRIDGE_JP_ID = "codebridge-jp";

/** 長いもの優先（Monaco monarch の keywords マッチ用） */
const KEYWORDS = [
    "そうでなくもし",
    "そうでなければ",
    "続けて表示",
    "乱数初期化",
    "繰り返し",
    "表示",
    "入力",
    "整数",
    "小数",
    "文字列",
    "文字",
    "もし",
    "間",
    "戻る",
    "乱数",
];

const OPERATORS = [
    "と等しくない",
    "と等しい",
    "より大きい",
    "より小さい",
    "以上",
    "以下",
    "かつ",
    "または",
];

let registered = false;

/**
 * @param {typeof import("monaco-editor")} monaco
 */
export function ensureCodebridgeJpLanguage(monaco) {
    if (!monaco || registered) return;
    const exists = monaco.languages
        .getLanguages()
        .some((lang) => lang.id === CODEBRIDGE_JP_ID);
    if (exists) {
        registered = true;
        return;
    }

    monaco.languages.register({ id: CODEBRIDGE_JP_ID });

    monaco.languages.setMonarchTokensProvider(CODEBRIDGE_JP_ID, {
        defaultToken: "",
        keywords: KEYWORDS,
        operators: OPERATORS,
        tokenizer: {
            root: [
                [/\/\/.*$/, "comment"],
                [/\/\*/, "comment", "@comment"],
                [/"([^"\\]|\\.)*$/, "string.invalid"],
                [/"/, "string", "@string_double"],
                [/'([^'\\]|\\.)*$/, "string.invalid"],
                [/'/, "string", "@string_single"],
                [/\d+\.\d+([eE][+-]?\d+)?/, "number.float"],
                [/\d+/, "number"],
                [
                    /そうでなくもし|そうでなければ|続けて表示|乱数初期化|繰り返し|文字列/,
                    "keyword",
                ],
                [/と等しくない|と等しい|より大きい|より小さい|以上|以下|かつ|または/, "operator"],
                [/表示|入力|整数|小数|文字|もし|間|戻る|乱数/, "keyword"],
                [/[{}()\[\]]/, "delimiter.bracket"],
                [/[;,.]/, "delimiter"],
                [/[+\-*/%=<>!&|]+/, "operator"],
                [
                    /[a-zA-Z_\u3040-\u30ff\u3400-\u9fff\uff66-\uff9d][\w\u3040-\u30ff\u3400-\u9fff\uff66-\uff9d]*/,
                    {
                        cases: {
                            "@keywords": "keyword",
                            "@operators": "operator",
                            "@default": "identifier",
                        },
                    },
                ],
            ],
            comment: [
                [/[^/*]+/, "comment"],
                [/\*\//, "comment", "@pop"],
                [/[/*]/, "comment"],
            ],
            string_double: [
                [/[^\\"]+/, "string"],
                [/\\./, "string.escape"],
                [/"/, "string", "@pop"],
            ],
            string_single: [
                [/[^\\']+/, "string"],
                [/\\./, "string.escape"],
                [/'/, "string", "@pop"],
            ],
        },
    });

    monaco.languages.setLanguageConfiguration(CODEBRIDGE_JP_ID, {
        comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
        },
        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
        indentationRules: {
            increaseIndentPattern: /\{[^}"']*$/,
            decreaseIndentPattern: /^\s*\}/,
        },
        wordPattern:
            /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    });

    registered = true;
}

export const CODEBRIDGE_JP_LANGUAGE_ID = CODEBRIDGE_JP_ID;

export function resetCodebridgeJpRegistrationForTests() {
    registered = false;
}
