import { useMemo, useState, useCallback, useEffect } from "react";
import { JapaneseEditor } from "./JapaneseEditor.jsx";
import { CCodePreview } from "./CCodePreview.jsx";
import { RuntimeInput } from "./RuntimeInput.jsx";
import { LearningPanel } from "./LearningPanel.jsx";
import { DictionaryPanel } from "./DictionaryPanel.jsx";
import { CommandDictionaryModal } from "./CommandDictionaryModal.jsx";
import { SampleList } from "./SampleList.jsx";
import { ServerStatusIndicator } from "./ServerStatusIndicator.jsx";
import { IdeSideRail, IdeSlidePanel } from "./IdeSidePanel.jsx";
import { IdeWorkspaceSplit } from "./IdeWorkspaceSplit.jsx";
import { useIdeLayout } from "../hooks/useIdeLayout.js";
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

const DEFAULT_RUN_OUTPUT = "「実行」を押すと、コンソールに出力が表示されます。";
const DEFAULT_ERROR = "エラーがない場合は空です。";

const SIDE_PANEL_TITLES = {
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
    const [stdin, setStdin] = useState("");
    const [runOutput, setRunOutput] = useState(DEFAULT_RUN_OUTPUT);
    const [runError, setRunError] = useState(DEFAULT_ERROR);
    const [errorPanelMode, setErrorPanelMode] = useState("error");
    const [isRunning, setIsRunning] = useState(false);
    const [forceStdinVisible, setForceStdinVisible] = useState(false);
    const [modalEntry, setModalEntry] = useState(null);
    const [sidePanel, setSidePanel] = useState(null);

    const {
        previewVisible,
        setPreviewVisible,
        previewPercent,
        setPreviewPercent,
        togglePreview,
        showPreview,
        hidePreview,
    } = useIdeLayout("beginner");

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

    useEffect(() => {
        document.body.classList.add("body--ide");
        return () => document.body.classList.remove("body--ide");
    }, []);

    const handleSampleSelect = useCallback(
        (sample) => {
            if (sample) onOpenSample?.(sample);
        },
        [onOpenSample]
    );

    const toggleSidePanel = useCallback((id) => {
        setSidePanel((prev) => (prev === id ? null : id));
    }, []);

    const handleRun = useCallback(async () => {
        const isC2jp = editorMode === "c2jp";
        const codeToRun = isC2jp
            ? (cCode ?? "").trim()
            : (jpConversion?.program ?? "").trim();

        if (!codeToRun) {
            setRunOutput("（コードがありません）");
            setRunError(
                isC2jp
                    ? "C言語エディタにコードを書いてください。"
                    : "日本語Cエディタにコードを書くか、サンプルを選んでください。"
            );
            setErrorPanelMode("error");
            setSidePanel("error");
            return;
        }

        if (!isC2jp && (jpConversion?.warnings?.length ?? 0) > 0) {
            setRunOutput("（変換の警告があります — 実行前に確認してください）");
            setRunError(jpConversion.warnings.map((w) => "⚠ " + (w.messageJa ?? "")).join("\n"));
            setErrorPanelMode("error");
            setSidePanel("error");
            return;
        }

        setIsRunning(true);
        setRunOutput("コンパイル・実行中...");
        setRunError("");
        setErrorPanelMode("error");

        try {
            const data = await runCodeOnServer(codeToRun, stdin);
            const parsed = parseRunResponse(
                data,
                isC2jp ? null : jpConversion?.layout,
                jpLines,
                formatErrors
            );
            setRunOutput(parsed.output);
            setRunError(parsed.errorText);
            setErrorPanelMode(parsed.panelMode ?? "error");
            if (parsed.showStdinPanel) setForceStdinVisible(true);
            if (
                parsed.panelMode &&
                parsed.panelMode !== "success" &&
                parsed.errorText &&
                parsed.errorText !== "（エラーなし）"
            ) {
                setSidePanel("error");
            }
        } catch (err) {
            setRunOutput("（通信失敗）");
            setRunError(
                "サーバーと通信できませんでした。\n\n" +
                    String(err.message || err) +
                    "\n\nターミナルで npm run dev を実行してください。"
            );
            setErrorPanelMode("error");
            setSidePanel("error");
        } finally {
            setIsRunning(false);
        }
    }, [editorMode, cCode, jpConversion, stdin, jpLines]);

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
        <div className="ide-shell">
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
                        {projectTitle ? ` — ${projectTitle}` : ""}
                    </span>
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
                    <SampleList onSelect={handleSampleSelect} />
                </div>

                <div className="ide-toolbar-right">
                    <button
                        type="button"
                        className={`ide-toolbar-btn${previewVisible ? " is-active" : ""}`}
                        onClick={togglePreview}
                        title="変換結果パネルの表示・非表示"
                        aria-pressed={previewVisible}
                    >
                        変換結果
                    </button>
                    <ServerStatusIndicator connected={serverConnected} checked={serverChecked} />
                    <button
                        type="button"
                        className="run-button"
                        onClick={handleRun}
                        disabled={isRunning}
                    >
                        ▶ 実行
                    </button>
                </div>
            </header>

            <div className="ide-main">
                <div className="ide-center">
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
                            />
                        }
                        preview={<CCodePreview code={previewCode} />}
                    />

                    <div className="ide-bottom">
                        <section className="console-panel">
                            <div className="panel-header ide-console-header">
                                ③ コンソール
                                {errorBadge && (
                                    <button
                                        type="button"
                                        className="ide-console-error-link"
                                        onClick={() => toggleSidePanel("error")}
                                    >
                                        エラーあり
                                        <span className="ide-rail-badge" />
                                    </button>
                                )}
                            </div>
                            <pre className="run-output run-console console-output">{runOutput}</pre>
                        </section>

                        <RuntimeInput
                            value={stdin}
                            onChange={setStdin}
                            visible={needsStdin}
                            embedded
                        />
                    </div>
                </div>

                <IdeSideRail
                    activePanel={sidePanel}
                    onToggle={toggleSidePanel}
                    hasErrorBadge={errorBadge}
                />

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
            </div>

            <CommandDictionaryModal entry={modalEntry} onClose={() => setModalEntry(null)} />
        </div>
    );
}
