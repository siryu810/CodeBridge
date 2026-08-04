// =========================================================
// CodeBridge ホーム画面
//
// 起動時はホームを表示し、新規作成・サンプル・最近のコードから
// エディタ画面へ遷移する。
// （将来: .c / .cb ファイルの読み込み・保存）
// =========================================================

const RECENT_STORAGE_KEY = "codebridge-recent-v1";
const RECENT_MAX = 5;

/** ホームに並べるサンプル（7月発表向け） */
const HOME_FEATURED_SAMPLE_IDS = ["janken", "bmi", "grade", "omikuji"];

const NEW_PROJECT_JP_CODE = `表示("Hello, CodeBridge!");

`;

const NEW_PROJECT_C_CODE = `#include <stdio.h>

int main(void) {
    setbuf(stdout, NULL);

    printf("Hello, CodeBridge!\\n");

    return 0;
}`;

let homeInitialized = false;

function getCodeBridgeSamples() {
    return Array.isArray(window.CODEBRIDGE_SAMPLES) ? window.CODEBRIDGE_SAMPLES : [];
}
function getRecentList() {
    try {
        const raw = localStorage.getItem(RECENT_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function saveRecentList(list) {
    try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
    } catch {
        /* 保存できない環境では無視 */
    }
}

/** 最近使ったコードに追加（先頭に、同名は上書き） */
function addToRecent(title, code) {
    const trimmed = (code ?? "").trim();
    if (!trimmed) return;

    const entry = {
        id: "recent-" + Date.now(),
        title: title || "無題のコード",
        code: code,
        updatedAt: new Date().toISOString(),
    };

    let list = getRecentList().filter((item) => item.code !== code);
    list.unshift(entry);
    saveRecentList(list);
    renderRecentList();
}

function showHomeView() {
    const home = document.getElementById("homeView");
    const editor = document.getElementById("editorView");
    const backBtn = document.getElementById("btnBackHome");
    if (home) home.classList.remove("is-hidden");
    if (editor) editor.classList.add("is-hidden");
    if (backBtn) backBtn.classList.add("is-hidden");
    renderRecentList();
}

function showEditorView() {
    const home = document.getElementById("homeView");
    const editor = document.getElementById("editorView");
    const backBtn = document.getElementById("btnBackHome");
    if (home) home.classList.add("is-hidden");
    if (editor) editor.classList.remove("is-hidden");
    if (backBtn) backBtn.classList.remove("is-hidden");

    if (typeof window.convertCode === "function") {
        window.convertCode();
    }
    if (typeof window.setupCodeEditor === "function") {
        /* 行番号を最新化 */
        const textarea = document.getElementById("inputCode");
        if (textarea) {
            textarea.dispatchEvent(new Event("input"));
        }
    }
}

/** エディタにコードを読み込んで画面遷移（最近履歴は日本語版を保存） */
function loadCodeIntoEditor(code, recentTitle) {
    const jp = code ?? "";
    addToRecent(recentTitle, jp);
    const converted = window.CodeBridgeJp2c?.convertJapaneseToC(jp);
    const cProgram = converted?.program ?? "";

    if (typeof window.loadEditorBuffers === "function") {
        window.loadEditorBuffers(jp, cProgram);
        showEditorView();
        return;
    }

    const inputEl = document.getElementById("inputCode");
    if (!inputEl) return;
    inputEl.value = jp;
    showEditorView();
}

function openNewProject() {
    if (typeof window.loadEditorBuffers === "function") {
        window.loadEditorBuffers(NEW_PROJECT_JP_CODE, NEW_PROJECT_C_CODE);
        addToRecent("新規プロジェクト", NEW_PROJECT_JP_CODE);
        showEditorView();
        return;
    }
    loadCodeIntoEditor(NEW_PROJECT_JP_CODE, "新規プロジェクト");
}

function openSampleById(sampleId) {
    const samples = getCodeBridgeSamples();
    const sample = samples.find((s) => s.id === sampleId);
    if (!sample) return;

    const select = document.getElementById("sampleSelect");
    if (select) select.value = sampleId;

    if (typeof window.loadSampleIntoEditor === "function") {
        window.loadSampleIntoEditor(sample);
        return;
    }

    const mode =
        typeof window.getInputMode === "function" ? window.getInputMode() : "jp2c";
    const code =
        typeof window.getSampleEditorCode === "function"
            ? window.getSampleEditorCode(sample, mode)
            : sample.jpCode ?? sample.code;
    loadCodeIntoEditor(code, sample.title);
}

function openRecentById(recentId) {
    const item = getRecentList().find((r) => r.id === recentId);
    if (!item) return;
    loadCodeIntoEditor(item.code, item.title);
}

function renderRecentList() {
    const container = document.getElementById("recentList");
    if (!container) return;

    const list = getRecentList();
    if (list.length === 0) {
        container.innerHTML =
            '<p class="home-empty">まだ履歴がありません。新規作成またはサンプルから始めてください。</p>';
        return;
    }

    container.innerHTML = list
        .map(
            (item) => `
        <button type="button" class="recent-item" data-recent-id="${item.id}">
            <span class="recent-title">${escapeHomeHtml(item.title)}</span>
            <span class="recent-meta">${formatRecentDate(item.updatedAt)}</span>
        </button>
    `
        )
        .join("");

    container.querySelectorAll("[data-recent-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            openRecentById(btn.getAttribute("data-recent-id"));
        });
    });
}

function renderHomeSamples() {
    const container = document.getElementById("homeSampleList");
    if (!container) return;

    const samples = getCodeBridgeSamples();
    const featured = HOME_FEATURED_SAMPLE_IDS.map((id) => samples.find((s) => s.id === id)).filter(
        Boolean
    );

    if (featured.length === 0) {
        container.innerHTML =
            '<p class="home-empty">サンプルを読み込めませんでした。ページを再読み込みしてください。</p>';
        return;
    }

    container.innerHTML = featured
        .map(
            (s) => `
        <button type="button" class="sample-card" data-sample-id="${s.id}">
            <span class="sample-card-title">${escapeHomeHtml(s.title)}</span>
            <span class="sample-card-desc">${escapeHomeHtml(s.description)}</span>
        </button>
    `
        )
        .join("");

    container.querySelectorAll("[data-sample-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            openSampleById(btn.getAttribute("data-sample-id"));
        });
    });
}

function escapeHomeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function formatRecentDate(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

function setupHome() {
    if (homeInitialized) return;
    homeInitialized = true;

    renderHomeSamples();
    renderRecentList();

    const btnNew = document.getElementById("btnNewProject");
    const btnBack = document.getElementById("btnBackHome");

    if (btnNew) {
        btnNew.addEventListener("click", openNewProject);
    } else {
        console.warn("home.js: #btnNewProject が見つかりません");
    }

    if (btnBack) {
        btnBack.addEventListener("click", showHomeView);
    }

    showHomeView();
}

window.setupHome = setupHome;
window.showHomeView = showHomeView;
window.showEditorView = showEditorView;
window.openSampleById = openSampleById;
window.loadCodeIntoEditor = loadCodeIntoEditor;
window.addToRecent = addToRecent;

function initHomeWhenReady() {
    if (typeof window.setupHome === "function") {
        window.setupHome();
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomeWhenReady);
} else {
    initHomeWhenReady();
}
