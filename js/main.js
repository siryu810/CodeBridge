// =========================================================
// CodeBridge: 学習用の双方向変換（日本語 ⇔ C言語）
// 日本語→C の変換本体は js/jp2c.js
// =========================================================

const categoryOrder = [
    "出力",
    "入力",
    "条件分岐",
    "繰り返し",
    "型",
    "制御",
    "比較",
    "論理",
    "その他",
];

const dictionary = window.CodeBridgeJp2c?.dictionary ?? [];

const dictionaryForCConvert = dictionary
    .filter((d) => d.convertible)
    .sort((a, b) => b.c.length - a.c.length);

const dictionaryForJpDetect = [...dictionary].sort((a, b) => b.jp.length - a.jp.length);

const dictionaryForCDetect = dictionary
    .filter((d) => d.convertible)
    .sort((a, b) => b.c.length - a.c.length);

let currentInputMode = "jp2c";
let lastCProgramLayout = null;
let lastConversionWarnings = [];
let storedJpCode = "";
let storedCCode = "";

function syncEditorToBuffers() {
    const inputEl = document.getElementById("inputCode");
    if (!inputEl) return;
    if (getInputMode() === "c2jp") storedCCode = inputEl.value ?? "";
    else storedJpCode = inputEl.value ?? "";
}

function syncBuffersToEditor() {
    const inputEl = document.getElementById("inputCode");
    if (!inputEl) return;
    inputEl.value = getInputMode() === "c2jp" ? storedCCode : storedJpCode;
    inputEl.dispatchEvent(new Event("input"));
}

function loadEditorBuffers(jpCode, cCode) {
    storedJpCode = jpCode ?? "";
    storedCCode = cCode ?? "";
    syncBuffersToEditor();
    convertCode();
}

function loadSampleIntoEditor(sample) {
    if (!sample) return;
    const jp = sample.jpCode ?? sample.code ?? "";
    const c = sample.cCode ?? "";
    loadEditorBuffers(jp, c);
    if (typeof window.addToRecent === "function") {
        window.addToRecent(sample.title, jp);
    }
    if (typeof window.showEditorView === "function") {
        window.showEditorView();
    }
}

function getDisplayC(item) {
    return item.displayC ?? item.c;
}

function isIdentifierChar(ch) {
    return /[A-Za-z0-9_]/.test(ch);
}

function isJpBoundary(ch) {
    if (ch === "") return true;
    return /[\s(){}\[\];,=<>!&|+\-*/%]/.test(ch);
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

function getInputMode() {
    const checked = document.querySelector('input[name="inputMode"]:checked');
    return checked?.value ?? currentInputMode;
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
            } else {
                if (!isCBoundary(before) || !isCBoundary(after)) continue;
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
            const item = dictionary.find((d) => d.key === token.key);
            return item ? item.jp : token.value;
        })
        .join("");
}

function collectComparisonPhraseMappings(text, usedKeys, usedList) {
    for (const rule of window.CodeBridgeJp2c.JAPANESE_COMPARISON_RULES) {
        if (usedKeys.has(rule.key)) continue;
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(text)) {
            usedKeys.add(rule.key);
            const item = dictionary.find((d) => d.key === rule.key);
            if (item) usedList.push(item);
        }
    }
}

function findUsedMappingsInText(text) {
    const usedKeys = new Set();
    const usedList = [];
    let i = 0;

    while (i < text.length) {
        if (text[i] === "\"") {
            i = skipStringLiteral(text, i);
            continue;
        }

        let matched = false;
        for (const item of dictionaryForJpDetect) {
            if (!text.startsWith(item.jp, i)) continue;

            const before = text[i - 1] ?? "";
            const after = text[i + item.jp.length] ?? "";
            if (!isJpBoundary(before) || !isJpBoundary(after)) continue;

            if (item.requiresParen) {
                const next = nextNonWhitespace(text, i + item.jp.length);
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

    collectComparisonPhraseMappings(text, usedKeys, usedList);

    return usedList;
}

function findUsedMappingsInCText(text) {
    const usedKeys = new Set();
    const usedList = [];
    let i = 0;

    while (i < text.length) {
        if (text[i] === "\"") {
            i = skipStringLiteral(text, i);
            continue;
        }
        if (text[i] === "'") {
            i = skipCharLiteral(text, i);
            continue;
        }

        let matched = false;
        for (const item of dictionaryForCDetect) {
            if (!text.startsWith(item.c, i)) continue;

            const before = text[i - 1] ?? "";
            const after = text[i + item.c.length] ?? "";

            if (isCKeywordToken(item.c)) {
                if (isIdentifierChar(before) || isIdentifierChar(after)) continue;
                if (item.requiresParen) {
                    const next = nextNonWhitespace(text, i + item.c.length);
                    if (next !== "(") continue;
                }
            } else {
                if (!isCBoundary(before) || !isCBoundary(after)) continue;
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

    return usedList;
}

function mapCompileErrorToJapanese(cLine) {
    const inputEl = document.getElementById("inputCode");
    const jpLines = (inputEl?.value ?? "").split(/\r?\n/);

    if (cLine == null || !lastCProgramLayout || lastCProgramLayout.bodyLineCount === 0) {
        return {
            prefix: cLine != null ? `[生成後Cコードの${cLine}行目] ` : "",
            jpLineText: null,
        };
    }

    const jpLine = cLine - lastCProgramLayout.bodyStartLine + 1;
    if (jpLine >= 1 && jpLine <= lastCProgramLayout.bodyLineCount) {
        const jpLineText = jpLines[jpLine - 1]?.trim() || null;
        return { prefix: `[${jpLine}行目] `, jpLineText };
    }

    return {
        prefix: `[生成後Cコードの${cLine}行目] `,
        jpLineText: null,
    };
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}

function renderDictionaryPanel() {
    const container = document.getElementById("dictScroll");
    if (!container) return;

    let html = "";
    const julyItems = dictionary.filter((d) => d.july);

    for (const category of categoryOrder) {
        const items = julyItems.filter((d) => d.category === category);
        if (items.length === 0) continue;

        html += `<div class="dict-category">${escapeHtml(category)}</div>`;

        for (const item of items) {
            const cLabel = getDisplayC(item);
            html += `
                <div id="dict-card-${item.key}" data-dict-key="${item.key}" class="dict-card">
                    <div class="dict-main">${escapeHtml(item.jp)} ⇔ ${escapeHtml(cLabel)}</div>
                    <div class="dict-desc">${escapeHtml(item.description)}</div>
                </div>
            `;
        }
    }

    container.innerHTML = html;
}

function detectNeedsStdin(japaneseSource) {
    return window.CodeBridgeJp2c.detectNeedsStdin(japaneseSource);
}

function updateStdinPanel() {
    const panel = document.getElementById("stdinPanel");
    const inputEl = document.getElementById("inputCode");
    if (!panel || !inputEl) return;

    const mode = getInputMode();
    const needs =
        mode === "c2jp"
            ? /\bscanf\s*\(/.test(inputEl.value ?? "")
            : detectNeedsStdin(inputEl.value ?? "");
    panel.classList.toggle("is-hidden", !needs);
}

function renderLearningPanel(usedMappings, mode) {
    const panelEl = document.getElementById("learningPanel");
    if (!panelEl) return;

    if (usedMappings.length === 0) {
        panelEl.innerHTML =
            '<p class="learning-empty">コードを書くと、使った命令の意味がここに表示されます。サンプル集から題材を選ぶこともできます。</p>';
        return;
    }

    panelEl.innerHTML = usedMappings
        .map((item) => {
            const cLabel = getDisplayC(item);
            const arrow =
                mode === "c2jp"
                    ? `${escapeHtml(cLabel)} → ${escapeHtml(item.jp)}`
                    : `${escapeHtml(item.jp)} → ${escapeHtml(cLabel)}`;
            return `
                <div class="learning-item">
                    <div class="learning-keyword">${arrow}</div>
                    <div class="learning-text">${escapeHtml(item.description)}</div>
                </div>
            `;
        })
        .join("");
}

function markUsedDictionary(usedMappings) {
    const usedKeys = new Set((usedMappings ?? []).map((m) => m.key));

    document.querySelectorAll(".dict-card[data-dict-key]").forEach((el) => {
        el.classList.remove("used");
    });

    for (const key of usedKeys) {
        const card = document.getElementById("dict-card-" + key);
        if (card) card.classList.add("used");
    }
}

function updatePanelLabels(mode) {
    const inputTitle = document.getElementById("inputPanelTitle");
    const outputTitle = document.getElementById("outputPanelTitle");
    const learningTitle = document.getElementById("learningPanelTitle");
    const inputEl = document.getElementById("inputCode");

    if (mode === "c2jp") {
        if (inputTitle) inputTitle.textContent = "① C言語コード";
        if (outputTitle) outputTitle.textContent = "② 日本語コード（読みやすい形）";
        if (learningTitle) learningTitle.textContent = "⑤ 学習モード — Cコードで使った命令";
        if (inputEl) {
            inputEl.placeholder = 'printf("合格");\nif(score >= 60){\n    printf("合格");\n}';
        }
    } else {
        if (inputTitle) inputTitle.textContent = "① 日本語Cエディタ";
        if (outputTitle) outputTitle.textContent = "② C言語変換結果";
        if (learningTitle) learningTitle.textContent = "⑤ 学習モード — 使った命令の意味";
        if (inputEl) {
            inputEl.placeholder =
                '表示("合格");\nもし(scoreが60以上){\n    表示("合格");\n}';
        }
    }
}

function setInputMode(mode) {
    syncEditorToBuffers();
    currentInputMode = mode;
    updatePanelLabels(mode);
    syncBuffersToEditor();
    convertCode();
}

function convertCode() {
    const inputEl = document.getElementById("inputCode");
    const outputEl = document.getElementById("outputCode");
    if (!inputEl || !outputEl) return;

    const mode = getInputMode();
    currentInputMode = mode;

    if (mode === "c2jp") {
        const source = inputEl.value ?? "";
        const result = window.CodeBridgeC2jp.convertCToJapanese(source);
        outputEl.textContent = result.program;
        lastCProgramLayout = null;
        lastConversionWarnings = [];

        const usedMappings = window.CodeBridgeC2jp.findUsedMappingsInC(source);
        renderLearningPanel(usedMappings, "c2jp");
        markUsedDictionary(usedMappings);
        updateStdinPanel();
        return;
    }

    const result = window.CodeBridgeJp2c.convertJapaneseToC(inputEl.value ?? "");
    lastCProgramLayout = result.layout;
    lastConversionWarnings = result.warnings;
    outputEl.textContent = result.program;

    const usedMappings = findUsedMappingsInText(result.normalized);
    renderLearningPanel(usedMappings, "jp2c");
    markUsedDictionary(usedMappings);
    updateStdinPanel();
}

function getConvertedCCode() {
    const outputEl = document.getElementById("outputCode");
    return outputEl ? outputEl.textContent : "";
}

function getConversionWarnings() {
    return lastConversionWarnings;
}

function initCodeBridge() {
    if (typeof window.setupHome === "function") {
        window.setupHome();
    }
    renderDictionaryPanel();
    updatePanelLabels(currentInputMode);
    if (typeof window.setupCodeEditor === "function") {
        window.setupCodeEditor();
    }
    if (typeof window.setupRunButton === "function") {
        window.setupRunButton();
    }
    if (typeof window.setupSampleSelector === "function") {
        window.setupSampleSelector();
    } else if (typeof window.setupHome !== "function") {
        convertCode();
    }
}

window.convertCode = convertCode;
window.getInputMode = getInputMode;
window.setInputMode = setInputMode;
window.loadEditorBuffers = loadEditorBuffers;
window.loadSampleIntoEditor = loadSampleIntoEditor;
window.initCodeBridge = initCodeBridge;
window.updateStdinPanel = updateStdinPanel;
window.getConvertedCCode = getConvertedCCode;
window.detectNeedsStdin = detectNeedsStdin;
window.mapCompileErrorToJapanese = mapCompileErrorToJapanese;
window.getConversionWarnings = getConversionWarnings;
