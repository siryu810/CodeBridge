// =========================================================
// CodeBridge: 学習用コードエディタ（IDE風の入力支援）
// Tab / 自動インデント / 波括弧補完 / 行番号
// =========================================================

const EDITOR_TAB = "    "; // 半角スペース4つ（C言語でよく使うインデント幅）

function getInputTextarea() {
    return document.getElementById("inputCode");
}

function getLineNumbersEl() {
    return document.getElementById("lineNumbers");
}

/** カーソル位置に文字列を挿入する（Tab などで使用） */
function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    textarea.value = before + text + after;
    const pos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
}

/** 現在行の先頭から続く空白（インデント）を取得 */
function getLineIndent(lineText) {
    const match = lineText.match(/^\s*/);
    return match ? match[0] : "";
}

/** 行番号ガターを更新（行数に合わせて 1, 2, 3...） */
function updateLineNumbers() {
    const textarea = getInputTextarea();
    const gutter = getLineNumbersEl();
    if (!textarea || !gutter) return;

    const lineCount = textarea.value.split("\n").length;
    const numbers = [];
    for (let i = 1; i <= lineCount; i++) {
        numbers.push(String(i));
    }
    gutter.textContent = numbers.join("\n");
}

/** 行番号と textarea の縦スクロールを同期 */
function syncGutterScroll() {
    const textarea = getInputTextarea();
    const gutter = getLineNumbersEl();
    if (textarea && gutter) {
        gutter.scrollTop = textarea.scrollTop;
    }
}

/** Tab キー: フォーカス移動ではなくスペース4つを挿入 */
function handleTabKey(textarea, event) {
    event.preventDefault();
    insertAtCursor(textarea, EDITOR_TAB);
}

/**
 * Enter キー:
 * - 前の行のインデントを引き継ぐ
 * - 直前が「{」なら波括弧ブロックを自動生成
 */
function handleEnterKey(textarea, event) {
    event.preventDefault();

    const value = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);

    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.substring(lineStart);
    const indent = getLineIndent(currentLine);

    const charBefore = before.length > 0 ? before[before.length - 1] : "";

    let insertText;
    let cursorOffset;

    // 「{」の直後で Enter → ブロックを展開
    if (charBefore === "{") {
        insertText = "\n" + indent + EDITOR_TAB + "\n" + indent + "}";
        cursorOffset = 1 + indent.length + EDITOR_TAB.length;
    } else {
        insertText = "\n" + indent;
        cursorOffset = insertText.length;
    }

    textarea.value = before + insertText + after;
    const newPos = start + cursorOffset;
    textarea.selectionStart = textarea.selectionEnd = newPos;
}

function setupCodeEditor() {
    const textarea = getInputTextarea();
    if (!textarea) return;

    // 入力のたびに変換と行番号を更新
    textarea.addEventListener("input", () => {
        updateLineNumbers();
        syncGutterScroll();
        if (typeof window.convertCode === "function") {
            window.convertCode();
        }
    });

    textarea.addEventListener("scroll", syncGutterScroll);

    textarea.addEventListener("keydown", (event) => {
        if (event.key === "Tab") {
            handleTabKey(textarea, event);
            updateLineNumbers();
            if (typeof window.convertCode === "function") {
                window.convertCode();
            }
            return;
        }

        if (event.key === "Enter") {
            handleEnterKey(textarea, event);
            updateLineNumbers();
            syncGutterScroll();
            if (typeof window.convertCode === "function") {
                window.convertCode();
            }
        }
    });

    updateLineNumbers();
}

window.setupCodeEditor = setupCodeEditor;
