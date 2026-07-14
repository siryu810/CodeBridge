/**
 * @deprecated UI では未使用（Monaco 標準機能を優先）
 *
 * エディタ補助（括弧補完・閉じスキップ・スマート Enter・インデント・対応括弧）
 * — React 版本体は Monaco Editor（ローカルバンドル）へ移行済み。
 * — このモジュールは test-editor-assist.mjs 互換のため残置。
 * — 将来: Monaco 向け E2E が充実したら削除候補。
 */

export const EDITOR_TAB = "    ";

const PAIR_OPEN = {
    "(": ")",
    "[": "]",
    "{": "}",
    '"': '"',
    "'": "'",
};

const PAIR_CLOSE = new Set([")", "]", "}", '"', "'"]);

const BRACKET_PAIRS = {
    "(": ")",
    "[": "]",
    "{": "}",
    ")": "(",
    "]": "[",
    "}": "{",
};

/**
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} insert
 * @param {number} cursorOffset - insert 先頭からのカーソル位置
 */
export function applyEdit(value, start, end, insert, cursorOffset) {
    const before = value.substring(0, start);
    const after = value.substring(end);
    const nextValue = before + insert + after;
    const cursor = start + cursorOffset;
    return { value: nextValue, cursor, selectionEnd: cursor };
}

/**
 * 開き記号の直後に既に閉じがあるか
 * @param {string} afterCursor
 * @param {string} closer
 */
export function shouldSkipPairInsert(afterCursor, closer) {
    return afterCursor.startsWith(closer);
}

/**
 * 閉じ記号入力時にスキップしてよいか
 * @param {string} afterCursor
 * @param {string} closer
 */
export function shouldSkipClosing(afterCursor, closer) {
    return afterCursor.startsWith(closer);
}

/**
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} openChar
 * @returns {{ value: string, cursor: number, selectionEnd: number } | null}
 */
export function handleAutoPair(value, start, end, openChar) {
    const closer = PAIR_OPEN[openChar];
    if (!closer) return null;

    const selected = value.substring(start, end);
    if (selected.length > 0) {
        // 選択範囲を括弧で囲む
        return applyEdit(value, start, end, openChar + selected + closer, 1 + selected.length);
    }

    const after = value.substring(end);
    // " や ' で既に同じ記号が直後ならスキップ寄り（閉じ扱い）
    if ((openChar === '"' || openChar === "'") && shouldSkipClosing(after, closer)) {
        return applyEdit(value, start, end, "", 1);
    }

    if (shouldSkipPairInsert(after, closer)) {
        // 既に閉じがある場合は開きだけ挿入し、カーソルは開き直後へ
        return applyEdit(value, start, end, openChar, 1);
    }

    return applyEdit(value, start, end, openChar + closer, 1);
}

/**
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} closeChar
 * @returns {{ value: string, cursor: number, selectionEnd: number } | null}
 */
export function handleClosingSkip(value, start, end, closeChar) {
    if (!PAIR_CLOSE.has(closeChar)) return null;
    if (start !== end) return null;

    const after = value.substring(end);
    if (!shouldSkipClosing(after, closeChar)) return null;

    // 挿入せずカーソルだけ右へ
    return applyEdit(value, start, end, "", 1);
}

/**
 * 前の行のインデントを取得
 * @param {string} lineText
 */
export function getLineIndent(lineText) {
    const match = String(lineText ?? "").match(/^\s*/);
    return match ? match[0] : "";
}

/**
 * 対応する } が直後付近にあるか（スマート Enter の重複防止）
 * @param {string} after
 * @param {string} indent
 */
export function hasMatchingCloseSoon(after, indent) {
    const trimmedStart = after.replace(/^\s*/, "");
    if (trimmedStart.startsWith("}")) return true;
    // 次の非空行が同じインデントの } なら重複追加しない
    const lines = after.split("\n");
    for (let i = 0; i < Math.min(lines.length, 4); i++) {
        const line = lines[i];
        if (line.trim() === "") continue;
        if (line === indent + "}" || line.trim() === "}") return true;
        break;
    }
    return false;
}

/**
 * Enter 押下時の挿入（スマート括弧 + インデント継承）
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} [tab=EDITOR_TAB]
 */
export function handleSmartEnter(value, start, end, tab = EDITOR_TAB) {
    const before = value.substring(0, start);
    const after = value.substring(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.substring(lineStart);
    const indent = getLineIndent(currentLine);
    const trimmedRight = currentLine.replace(/\s+$/, "");
    const endsWithOpenBrace = /\{\s*$/.test(trimmedRight);

    if (endsWithOpenBrace) {
        if (hasMatchingCloseSoon(after, indent)) {
            const insert = "\n" + indent + tab;
            return applyEdit(value, start, end, insert, insert.length);
        }
        const insert = "\n" + indent + tab + "\n" + indent + "}";
        const cursorOffset = 1 + indent.length + tab.length;
        return applyEdit(value, start, end, insert, cursorOffset);
    }

    const insert = "\n" + indent;
    return applyEdit(value, start, end, insert, insert.length);
}

/**
 * } 入力時に行頭インデントを1段戻す（空行インデント過ぎの場合）
 * @param {string} value
 * @param {number} start
 * @param {number} end
 * @param {string} [tab=EDITOR_TAB]
 */
export function handleClosingBraceIndent(value, start, end, tab = EDITOR_TAB) {
    if (start !== end) return null;
    const before = value.substring(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const lineBeforeCursor = before.substring(lineStart);
    // 行が空白のみで、タブ分余っているときに減らす
    if (!/^\s+$/.test(lineBeforeCursor) && lineBeforeCursor !== "") {
        // 空白の途中でない通常の } 挿入
        return applyEdit(value, start, end, "}", 1);
    }

    let indent = lineBeforeCursor;
    if (indent.endsWith(tab)) {
        indent = indent.slice(0, -tab.length);
    } else if (indent.endsWith("\t")) {
        indent = indent.slice(0, -1);
    } else if (indent.length >= 4 && /^\s+$/.test(indent)) {
        indent = indent.slice(0, -4);
    }

    const beforeLine = value.substring(0, lineStart);
    const after = value.substring(end);
    const nextValue = beforeLine + indent + "}" + after;
    const cursor = lineStart + indent.length + 1;
    return { value: nextValue, cursor, selectionEnd: cursor };
}

/**
 * @param {string} text
 * @param {number} index - 括弧の位置
 * @param {1|-1} direction
 */
export function findMatchingBracket(text, index, direction) {
    const ch = text[index];
    if (!ch || !(ch in BRACKET_PAIRS)) return -1;

    const match = BRACKET_PAIRS[ch];
    const isOpen = direction === 1;
    let depth = 0;
    let i = index;

    while (i >= 0 && i < text.length) {
        const c = text[i];
        // 簡易: 文字列リテラル内はざっくりスキップ（"..." と '...'）
        if (c === '"' || c === "'") {
            const quote = c;
            i += direction;
            while (i >= 0 && i < text.length) {
                if (text[i] === "\\" && direction === 1) {
                    i += 2;
                    continue;
                }
                if (text[i] === "\\" && direction === -1) {
                    i -= 2;
                    continue;
                }
                if (text[i] === quote) break;
                i += direction;
            }
            i += direction;
            continue;
        }

        if (c === ch) depth += 1;
        else if (c === match) {
            depth -= 1;
            if (depth === 0) return i;
        }
        i += direction;
    }
    return -1;
}

/**
 * カーソル位置から強調すべき括弧ペアのインデックスを返す
 * @param {string} value
 * @param {number} cursor
 * @returns {{ open: number, close: number } | null}
 */
export function getBracketMatchAtCursor(value, cursor) {
    if (!value || cursor < 0) return null;
    const len = value.length;

    // カーソル直後が開き、または直前が閉じ
    const candidates = [];
    if (cursor < len && "([{".includes(value[cursor])) {
        candidates.push({ index: cursor, direction: 1 });
    }
    if (cursor > 0 && ")]}".includes(value[cursor - 1])) {
        candidates.push({ index: cursor - 1, direction: -1 });
    }
    // カーソル直前が開き（打ち終わった直後）
    if (cursor > 0 && "([{".includes(value[cursor - 1])) {
        candidates.push({ index: cursor - 1, direction: 1 });
    }
    // カーソル直後が閉じ
    if (cursor < len && ")]}".includes(value[cursor])) {
        candidates.push({ index: cursor, direction: -1 });
    }

    for (const { index, direction } of candidates) {
        const match = findMatchingBracket(value, index, direction);
        if (match >= 0) {
            const open = direction === 1 ? index : match;
            const close = direction === 1 ? match : index;
            return { open, close };
        }
    }
    return null;
}

/**
 * keydown をまとめて処理。処理した場合は edit 結果を返す。
 * @param {KeyboardEvent | { key: string, preventDefault?: Function, shiftKey?: boolean }} event
 * @param {{ value: string, selectionStart: number, selectionEnd: number }} state
 * @returns {{ value: string, cursor: number, selectionEnd: number } | null}
 */
export function handleEditorKeyDown(event, state) {
    const { value, selectionStart: start, selectionEnd: end } = state;
    const key = event.key;

    if (key === "Tab") {
        event.preventDefault?.();
        if (event.shiftKey) {
            const lineStart = value.lastIndexOf("\n", start - 1) + 1;
            if (value.startsWith(EDITOR_TAB, lineStart)) {
                const next = value.slice(0, lineStart) + value.slice(lineStart + EDITOR_TAB.length);
                const cursor = Math.max(lineStart, start - EDITOR_TAB.length);
                return { value: next, cursor, selectionEnd: Math.max(lineStart, end - EDITOR_TAB.length) };
            }
            return null;
        }
        return applyEdit(value, start, end, EDITOR_TAB, EDITOR_TAB.length);
    }

    if (key === "Enter") {
        event.preventDefault?.();
        return handleSmartEnter(value, start, end);
    }

    if (key === "}") {
        // 閉じスキップが先
        const skip = handleClosingSkip(value, start, end, "}");
        if (skip) {
            event.preventDefault?.();
            return skip;
        }
        event.preventDefault?.();
        return handleClosingBraceIndent(value, start, end);
    }

    if (PAIR_CLOSE.has(key) && key !== "}") {
        const skip = handleClosingSkip(value, start, end, key);
        if (skip) {
            event.preventDefault?.();
            return skip;
        }
    }

    if (key in PAIR_OPEN) {
        const paired = handleAutoPair(value, start, end, key);
        if (paired) {
            event.preventDefault?.();
            return paired;
        }
    }

    return null;
}
