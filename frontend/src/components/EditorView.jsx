import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { JapaneseEditor } from "./JapaneseEditor.jsx";
import { CCodePreview } from "./CCodePreview.jsx";
import { LearningPanel } from "./LearningPanel.jsx";
import { PracticePanel } from "./PracticePanel.jsx";
import { DictionaryPanel } from "./DictionaryPanel.jsx";
import { CommandDictionaryModal } from "./CommandDictionaryModal.jsx";
import { SampleList } from "./SampleList.jsx";
import { ServerStatusIndicator } from "./ServerStatusIndicator.jsx";
import { IdeSideRail, IdeSlidePanel } from "./IdeSidePanel.jsx";
import { IdeWorkspaceSplit } from "./IdeWorkspaceSplit.jsx";
import { IdeBottomPanel } from "./IdeBottomPanel.jsx";
import { IdeLayout } from "./IdeLayout.jsx";
import { useIdeLayout } from "../hooks/useIdeLayout.js";
import {
    loadBottomPanelState,
} from "../hooks/useBottomPanel.js";
import { CODEBRIDGE_SAMPLES } from "../data/samples.js";
import {
    convertJapaneseSource,
    convertCSource,
    detectNeedsStdin,
    findUsedMappings,
    formatErrors,
} from "../lib/convert.js";
import { findUsedLearningEntries } from "../lib/learning.js";
import { runCodeOnServer, parseRunResponse } from "../lib/runApi.js";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import {
    buildEditorMarkersFromErrors,
    buildEditorMarkersFromWarnings,
} from "../lib/monacoMarkers.js";
import {
    buildRunTerminalLines,
} from "../lib/terminalFormat.js";

const DEFAULT_ERROR = "エラーがない場合は空です。";
const STDIN_STORAGE_KEY = "codebridge-ide-stdin-v1";

const SIDE_PANEL_TITLES = {
    practice: "練習モード",
    learning: "⑤ 学習モード",
    dict: "⑥ 日本語 ⇔ C言語 対応表",
    error: "④ 日本語エラー",
};

function hasActiveError(runError, errorPanelMode) {
    if (!runError || runError === DEFAULT_ERROR) return false;
    if (runError === "（エラーなし）") return false;
    if (errorPanelMode === "success") return false;
    return true;
}

function loadSavedStdin() {
    try {
        return localStorage.getItem(STDIN_STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
}

export function EditorView({
    jpCode,
    cCode,
    onJpCodeChange,
    onCCodeChange,
    onOpenSample,
    onBackHome,
    projectTitle = "",
    sampleId = null,
    serverConnected = false,
    serverChecked = false,
}) {
    const [editorMode, setEditorMode] = useState("jp2c");
    const [stdin, setStdin] = useState(() => loadSavedStdin());
    const [runError, setRunError] = useState(DEFAULT_ERROR);
    const [errorPanelMode, setErrorPanelMode] = useState("error");
    const [isRunning, setIsRunning] = useState(false);
    const [forceStdinVisible, setForceStdinVisible] = useState(false);
    const [modalEntry, setModalEntry] = useState(null);
    const [sidePanel, setSidePanel] = useState(null);
    const [runErrorMarkers, setRunErrorMarkers] = useState([]);

    const initialBottom = useMemo(() => loadBottomPanelState(), []);
    const [bottomOpen, setBottomOpen] = useState(initialBottom.open);
    const [bottomCollapsed, setBottomCollapsed] = useState(initialBottom.collapsed);
    const [bottomMaximized, setBottomMaximized] = useState(initialBottom.maximized);
    const [bottomHeight, setBottomHeight] = useState(initialBottom.height);
    const [bottomTab, setBottomTab] = useState(initialBottom.activeTab);
    const [outputLines, setOutputLines] = useState(
        /** @type {Array<{ kind: string, text: string }>} */ ([])
    );
    const [outputStatus, setOutputStatus] = useState(
        /** @type {"idle"|"running"|"waiting"|"ready"|"error"} */ ("idle")
    );

    const editorApiRef = useRef(null);
    const stdinInputRef = useRef(null);
    const { stats } = useLearningProgress();

    const {
        previewVisible,
        setPreviewVisible,
        previewPercent,
        setPreviewPercent,
        togglePreview,
        showPreview,
        hidePreview,
    } = useIdeLayout("beginner");

    const [practiceVisibility, setPracticeVisibility] = useState(
        /** @type {"guided" | "blind"} */ ("guided")
    );
    const bottomBeforeBlindRef = useRef(true);
    const bottomOpenRef = useRef(bottomOpen);
    bottomOpenRef.current = bottomOpen;

    const handlePracticeVisibilityChange = useCallback(
        (mode) => {
            setPracticeVisibility(mode);
            if (mode === "blind") {
                hidePreview();
                bottomBeforeBlindRef.current = bottomOpenRef.current;
                setBottomOpen(false);
                setBottomMaximized(false);
                setSidePanel((prev) => (prev === "practice" ? null : prev));
            } else {
                showPreview();
                setBottomOpen(bottomBeforeBlindRef.current);
                setSidePanel("practice");
            }
        },
        [hidePreview, showPreview]
    );

    const isBlindPractice = Boolean(sampleId) && practiceVisibility === "blind";

    const editorCode = editorMode === "jp2c" ? jpCode : cCode;
    const onEditorCodeChange = editorMode === "jp2c" ? onJpCodeChange : onCCodeChange;

    const jpConversion = useMemo(
        () => convertJapaneseSource(jpCode ?? ""),
        [jpCode]
    );

    const cConversion = useMemo(
        () => convertCSource(cCode ?? ""),
        [cCode]
    );

    const needsStdin =
        detectNeedsStdin(editorCode, editorMode) ||
        (editorMode === "jp2c" && forceStdinVisible);

    const mappingSource =
        editorMode === "c2jp" ? editorCode : (jpConversion?.normalized ?? jpCode ?? "");

    const mappings = useMemo(
        () => findUsedMappings(mappingSource, editorMode),
        [mappingSource, editorMode]
    );

    const usedKeys = useMemo(() => new Set(mappings.map((m) => m.key)), [mappings]);

    const usedLearningEntries = useMemo(
        () => findUsedLearningEntries(mappingSource, editorMode),
        [mappingSource, editorMode]
    );

    const activeSample = useMemo(
        () => (sampleId ? CODEBRIDGE_SAMPLES.find((s) => s.id === sampleId) : null),
        [sampleId]
    );

    const algorithmSteps = activeSample?.algorithmSteps ?? null;
    const learningGoals = activeSample?.learningGoals ?? null;
    const isSampleContext = Boolean(activeSample);

    const jpLines = useMemo(() => (jpCode ?? "").split(/\r?\n/), [jpCode]);

    const errorBadge = useMemo(
        () => hasActiveError(runError, errorPanelMode),
        [runError, errorPanelMode]
    );

    const errorPanelTitle =
        errorPanelMode === "input_wait" ? "④ 入力待ち" : SIDE_PANEL_TITLES.error;

    const errorClassName = errorPanelMode === "input_wait" ? "run-input-wait" : "run-error";

    const editorMarkers = useMemo(() => {
        if (editorMode === "jp2c") {
            const warnMarkers = buildEditorMarkersFromWarnings(jpConversion?.warnings);
            return [...warnMarkers, ...runErrorMarkers];
        }
        return runErrorMarkers;
    }, [editorMode, jpConversion?.warnings, runErrorMarkers]);

    useEffect(() => {
        document.body.classList.add("body--ide");
        return () => document.body.classList.remove("body--ide");
    }, []);

    // 新規作成・サンプル・再入場のいずれでも、同じ Bottom Panel を開いた状態で開始
    useEffect(() => {
        setBottomOpen(true);
        setBottomCollapsed(false);
    }, [sampleId, projectTitle]);

    useEffect(() => {
        if (sampleId) setSidePanel("practice");
        else {
            setSidePanel(null);
            setPracticeVisibility("guided");
            showPreview();
        }
    }, [sampleId, showPreview]);

    useEffect(() => {
        setRunErrorMarkers([]);
    }, [editorMode]);

    useEffect(() => {
        if (serverConnected) {
            setOutputStatus((prev) => (prev === "idle" || prev === "ready" ? "ready" : prev));
        }
    }, [serverConnected]);

    useEffect(() => {
        const onResize = () => {
            const max = Math.floor(window.innerHeight * 0.8);
            setBottomHeight((h) => Math.min(h, Math.max(80, max)));
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const previewLanguage = editorMode === "c2jp" ? "japanese" : "c";
    const inputLanguage = editorMode === "c2jp" ? "c" : "japanese";

    const openBottomForRun = useCallback(() => {
        setBottomOpen(true);
        setBottomCollapsed(false);
        setBottomTab("output");
    }, []);

    const handleSampleSelect = useCallback(
        (sample) => {
            if (sample) {
                onOpenSample?.(sample);
                setSidePanel("practice");
            }
        },
        [onOpenSample]
    );

    const toggleSidePanel = useCallback(
        (id) => {
            if (id === "practice" && practiceVisibility === "blind") {
                handlePracticeVisibilityChange("guided");
                return;
            }
            setSidePanel((prev) => (prev === id ? null : id));
        },
        [practiceVisibility, handlePracticeVisibilityChange]
    );

    const handleClearOutput = useCallback(() => {
        setOutputLines([]);
        setOutputStatus(serverConnected ? "ready" : "idle");
    }, [serverConnected]);

    const handleStdinSave = useCallback(() => {
        try {
            localStorage.setItem(STDIN_STORAGE_KEY, stdin);
        } catch {
            /* ignore */
        }
    }, [stdin]);

    const handleStdinClear = useCallback(() => {
        setStdin("");
        try {
            localStorage.removeItem(STDIN_STORAGE_KEY);
        } catch {
            /* ignore */
        }
    }, []);

    const openSideError = useCallback(() => {
        setSidePanel("error");
    }, []);

    const handleRun = useCallback(async () => {
        const isC2jp = editorMode === "c2jp";
        const codeToRun = isC2jp
            ? (cCode ?? "").trim()
            : (jpConversion?.program ?? "").trim();

        openBottomForRun();

        if (!codeToRun) {
            setOutputLines([
                { kind: "error", text: "（コードがありません）" },
                {
                    kind: "meta",
                    text: isC2jp
                        ? "C言語エディタにコードを書いてください。"
                        : "日本語Cエディタにコードを書くか、サンプルを選んでください。",
                },
            ]);
            setRunError(
                isC2jp
                    ? "C言語エディタにコードを書いてください。"
                    : "日本語Cエディタにコードを書くか、サンプルを選んでください。"
            );
            setErrorPanelMode("error");
            setOutputStatus("error");
            setBottomTab("output");
            setRunErrorMarkers([]);
            openSideError();
            return;
        }

        if (!isC2jp && (jpConversion?.warnings?.length ?? 0) > 0) {
            const warnText = jpConversion.warnings
                .map((w) => "⚠ " + (w.messageJa ?? ""))
                .join("\n");
            setOutputLines([
                { kind: "meta", text: "実行開始..." },
                { kind: "error", text: "（変換の警告があります — 実行前に確認してください）" },
                ...warnText.split("\n").map((t) => ({ kind: "error", text: t })),
            ]);
            setRunError(warnText);
            setErrorPanelMode("error");
            setOutputStatus("error");
            setBottomTab("output");
            setRunErrorMarkers(buildEditorMarkersFromWarnings(jpConversion.warnings));
            openSideError();
            return;
        }

        setIsRunning(true);
        setOutputStatus("running");
        setOutputLines(buildRunTerminalLines({ isStart: true }));
        setRunError("");
        setErrorPanelMode("error");

        const startedAt = performance.now();

        try {
            const data = await runCodeOnServer(codeToRun, stdin);
            const elapsedMs = Math.round(performance.now() - startedAt);
            const parsed = parseRunResponse(
                data,
                isC2jp ? null : jpConversion?.layout,
                jpLines,
                formatErrors
            );

            const consoleText =
                data?.consoleOutput != null && String(data.consoleOutput).length > 0
                    ? String(data.consoleOutput)
                    : parsed.output;

            setOutputLines(
                buildRunTerminalLines({
                    consoleText,
                    status: data?.status ?? parsed.panelMode,
                    exitCode: data?.exitCode ?? null,
                    elapsedMs,
                    errorText: parsed.errorText,
                })
            );

            setRunError(parsed.errorText);
            setErrorPanelMode(parsed.panelMode ?? "error");
            setRunErrorMarkers(
                buildEditorMarkersFromErrors(
                    data?.errors,
                    isC2jp ? null : jpConversion?.layout
                )
            );

            if (parsed.showStdinPanel) {
                setForceStdinVisible(true);
                setOutputStatus("waiting");
                setBottomTab("input");
                window.setTimeout(() => stdinInputRef.current?.focus?.(), 50);
            } else if (
                parsed.panelMode &&
                parsed.panelMode !== "success" &&
                parsed.errorText &&
                parsed.errorText !== "（エラーなし）"
            ) {
                setOutputStatus("error");
                setBottomTab("output");
                openSideError();
            } else {
                setOutputStatus("ready");
                setBottomTab("output");
            }
        } catch (err) {
            const msg =
                "サーバーと通信できませんでした。\n\n" +
                String(err.message || err) +
                "\n\nターミナルで npm run dev を実行してください。";
            setOutputLines([
                { kind: "meta", text: "実行開始..." },
                { kind: "error", text: "（通信失敗）" },
                ...msg.split("\n").map((t) => ({ kind: "error", text: t })),
            ]);
            setRunError(msg);
            setErrorPanelMode("error");
            setOutputStatus("error");
            setBottomTab("output");
            openSideError();
        } finally {
            setIsRunning(false);
        }
    }, [editorMode, cCode, jpConversion, stdin, jpLines, openBottomForRun, openSideError]);

    const inputTitle = editorMode === "c2jp" ? "C言語エディタ" : "日本語Cエディタ";
    const outputTitle =
        editorMode === "c2jp" ? "日本語変換結果" : "C言語変換結果";
    const inputPlaceholder =
        editorMode === "c2jp"
            ? 'printf("合格\\n");\nif(score >= 60){\n    printf("合格\\n");\n}'
            : '表示("合格");\nもし(scoreが60以上){\n    表示("合格");\n}';
    const previewCode =
        editorMode === "c2jp" ? (cConversion?.program ?? "") : (jpConversion?.program ?? "");

    return (
        <IdeLayout
            bottomMaximized={bottomMaximized}
            bottomOpen={bottomOpen}
            toolbar={
            <header className="ide-toolbar">
                <div className="ide-toolbar-left">
                    <button
                        type="button"
                        className="btn-back-home"
                        onClick={onBackHome}
                        aria-label="ホームへ戻る"
                    >
                        ← ホーム
                    </button>
                    <span className="ide-toolbar-title">
                        CodeBridge
                        <span className="app-version"> v0.9.0-rc.1</span>
                        {projectTitle ? ` — ${projectTitle}` : ""}
                    </span>
                    {isSampleContext && (
                        <span className="ide-toolbar-progress" title="練習クリア達成率">
                            達成率 {stats.achievementRate}%
                        </span>
                    )}
                </div>

                <div className="ide-toolbar-center">
                    <div className="mode-switch">
                        <label className="mode-option">
                            <input
                                type="radio"
                                name="editorMode"
                                value="jp2c"
                                checked={editorMode === "jp2c"}
                                onChange={() => setEditorMode("jp2c")}
                            />
                            日本語 → C言語
                        </label>
                        <label className="mode-option">
                            <input
                                type="radio"
                                name="editorMode"
                                value="c2jp"
                                checked={editorMode === "c2jp"}
                                onChange={() => setEditorMode("c2jp")}
                            />
                            C言語 → 日本語
                        </label>
                    </div>
                    <SampleList showProgress onSelect={handleSampleSelect} />
                    {isSampleContext && (
                        <button
                            type="button"
                            className={`ide-toolbar-btn ide-toolbar-btn--practice${
                                sidePanel === "practice" || isBlindPractice ? " is-active" : ""
                            }`}
                            onClick={() => toggleSidePanel("practice")}
                            title={
                                isBlindPractice
                                    ? "見ながら練習に戻る"
                                    : "練習モードを開く"
                            }
                            aria-pressed={sidePanel === "practice" || isBlindPractice}
                        >
                            練習
                        </button>
                    )}
                </div>

                <div className="ide-toolbar-right">
                    {!isBlindPractice && (
                        <button
                            type="button"
                            className={`ide-toolbar-btn${previewVisible ? " is-active" : ""}`}
                            onClick={togglePreview}
                            title="変換結果パネルの表示・非表示"
                            aria-pressed={previewVisible}
                        >
                            変換結果
                        </button>
                    )}
                    {!bottomOpen && !isBlindPractice && (
                        <button
                            type="button"
                            className="ide-toolbar-btn"
                            onClick={() => {
                                setBottomOpen(true);
                                setBottomCollapsed(false);
                            }}
                            title="実行パネルを表示"
                        >
                            パネル
                        </button>
                    )}
                    <ServerStatusIndicator connected={serverConnected} checked={serverChecked} />
                    {!isBlindPractice && (
                        <button
                            type="button"
                            className="run-button"
                            onClick={handleRun}
                            disabled={isRunning}
                        >
                            ▶ 実行
                        </button>
                    )}
                </div>
            </header>
            }
            sideBackdrop={
                sidePanel ? (
                    <button
                        type="button"
                        className="ide-slide-backdrop"
                        aria-label="パネルを閉じる"
                        onClick={() => setSidePanel(null)}
                    />
                ) : null
            }
            centerCollapsed={isBlindPractice}
            workspace={
                <IdeWorkspaceSplit
                    editorTitle={inputTitle}
                    previewTitle={outputTitle}
                    previewVisible={previewVisible}
                    previewPercent={previewPercent}
                    setPreviewPercent={setPreviewPercent}
                    setPreviewVisible={setPreviewVisible}
                    onHidePreview={hidePreview}
                    onShowPreview={showPreview}
                    editor={
                        <JapaneseEditor
                            value={editorCode}
                            onChange={onEditorCodeChange}
                            placeholder={inputPlaceholder}
                            language={inputLanguage}
                            markers={editorMarkers}
                            editorApiRef={editorApiRef}
                            path={
                                editorMode === "jp2c"
                                    ? "codebridge-editor.cbjp"
                                    : "codebridge-editor.c"
                            }
                        />
                    }
                    preview={
                        <CCodePreview code={previewCode} language={previewLanguage} />
                    }
                />
            }
            bottomPanel={
                isBlindPractice ? null : (
                <IdeBottomPanel
                    open={bottomOpen}
                    height={bottomHeight}
                    onHeightChange={setBottomHeight}
                    collapsed={bottomCollapsed}
                    maximized={bottomMaximized}
                    onToggleCollapse={() => {
                        setBottomCollapsed((v) => !v);
                        if (bottomMaximized) setBottomMaximized(false);
                    }}
                    onToggleMaximize={() => {
                        setBottomMaximized((v) => !v);
                        setBottomCollapsed(false);
                        setBottomOpen(true);
                    }}
                    onClose={() => {
                        setBottomOpen(false);
                        setBottomMaximized(false);
                    }}
                    onClearOutput={handleClearOutput}
                    activeTab={bottomTab}
                    onTabChange={setBottomTab}
                    outputStatus={
                        isRunning
                            ? "running"
                            : outputStatus === "idle" && serverConnected
                              ? "ready"
                              : outputStatus
                    }
                    outputLines={outputLines}
                    stdin={stdin}
                    onStdinChange={setStdin}
                    onStdinClear={handleStdinClear}
                    onStdinSave={handleStdinSave}
                    needsStdin={needsStdin}
                    inputRef={stdinInputRef}
                />
                )
            }
            practiceHost={
                isSampleContext ? (
                    <div
                        className={`practice-host${
                            isBlindPractice
                                ? " practice-host--focus"
                                : " practice-host--slide"
                        }${
                            isBlindPractice || sidePanel === "practice" ? " is-open" : ""
                        }`}
                    >
                        {!isBlindPractice && (
                            <div className="practice-host-header">
                                <h2 className="practice-host-title">
                                    {SIDE_PANEL_TITLES.practice}
                                </h2>
                                <button
                                    type="button"
                                    className="practice-host-close"
                                    onClick={() => setSidePanel(null)}
                                    aria-label="パネルを閉じる"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        <div className="practice-host-body">
                            <PracticePanel
                                embedded
                                layout={isBlindPractice ? "focus" : "side"}
                                activeSample={activeSample}
                                onVisibilityModeChange={handlePracticeVisibilityChange}
                            />
                        </div>
                    </div>
                ) : null
            }
            sideRail={
                <IdeSideRail
                    activePanel={isBlindPractice ? "practice" : sidePanel}
                    onToggle={toggleSidePanel}
                    hasErrorBadge={errorBadge}
                    showPractice={isSampleContext}
                />
            }
            sidePanels={
                <>
                <IdeSlidePanel
                    open={sidePanel === "learning"}
                    title={SIDE_PANEL_TITLES.learning}
                    onClose={() => setSidePanel(null)}
                >
                    <LearningPanel
                        embedded
                        usedEntries={usedLearningEntries}
                        algorithmSteps={algorithmSteps}
                        learningGoals={learningGoals}
                        isSampleContext={isSampleContext}
                        mode={editorMode}
                        onSelectEntry={setModalEntry}
                    />
                </IdeSlidePanel>

                <IdeSlidePanel
                    open={sidePanel === "dict"}
                    title={SIDE_PANEL_TITLES.dict}
                    onClose={() => setSidePanel(null)}
                >
                    <DictionaryPanel
                        embedded
                        usedKeys={usedKeys}
                        onSelectEntry={setModalEntry}
                    />
                </IdeSlidePanel>

                <IdeSlidePanel
                    open={sidePanel === "error"}
                    title={errorPanelTitle}
                    onClose={() => setSidePanel(null)}
                >
                    <pre className={`ide-slide-error ${errorClassName}`}>{runError}</pre>
                </IdeSlidePanel>

                <CommandDictionaryModal entry={modalEntry} onClose={() => setModalEntry(null)} />
                </>
            }
        />
    );
}
