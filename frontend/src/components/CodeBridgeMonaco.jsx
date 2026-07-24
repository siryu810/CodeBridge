import { Component, useRef, useEffect, useCallback, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import {
    ensureCodebridgeJpLanguage,
    CODEBRIDGE_JP_LANGUAGE_ID,
} from "../lib/monacoCodebridgeJp.js";
import "../lib/monacoSetup.js";

const DEFAULT_OPTIONS = {
    minimap: { enabled: false },
    automaticLayout: true,
    fontSize: 15,
    fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineNumbers: "on",
    tabSize: 4,
    insertSpaces: true,
    autoClosingBrackets: "languageDefined",
    autoClosingQuotes: "languageDefined",
    matchBrackets: "always",
    autoIndent: "full",
    renderLineHighlight: "line",
    scrollBeyondLastLine: false,
    wordWrap: "off",
    padding: { top: 8, bottom: 8 },
    scrollbar: {
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
    },
};

/**
 * @typedef {{ line: number, message: string, severity?: "error"|"warning"|"info" }} EditorMarker
 */

class MonacoErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error("[CodeBridgeMonaco]", error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

function MonacoTextareaFallback({
    value,
    onChange,
    readOnly,
    className,
    placeholder,
}) {
    return (
        <div className={`cb-monaco-fallback${className ? ` ${className}` : ""}`}>
            <p className="cb-monaco-fallback-msg" role="alert">
                コードエディタの読み込みに失敗しました。
                <br />
                ページを再読み込みしてください。
                <br />
                <span className="cb-monaco-fallback-hint">
                    （暫定的に簡易テキスト欄で編集・コピーできます）
                </span>
            </p>
            <textarea
                className="cb-monaco-fallback-textarea"
                value={value ?? ""}
                readOnly={readOnly}
                spellCheck={false}
                wrap="off"
                placeholder={placeholder}
                onChange={(e) => {
                    if (!readOnly && onChange) onChange(e.target.value);
                }}
            />
        </div>
    );
}

/**
 * @param {object} props
 * @param {string} props.value
 * @param {(next: string) => void} [props.onChange]
 * @param {"c"|typeof CODEBRIDGE_JP_LANGUAGE_ID|string} props.language
 * @param {boolean} [props.readOnly]
 * @param {string} [props.className]
 * @param {string} [props.path]
 * @param {EditorMarker[]} [props.markers]
 * @param {number} [props.fontSize]
 * @param {boolean} [props.showLineNumbers]
 * @param {import("@monaco-editor/react").EditorProps["options"]} [props.options]
 * @param {import("react").MutableRefObject<{ revealLine: (line: number) => void, focus: () => void }|null>} [props.editorApiRef]
 */
export function CodeBridgeMonaco({
    value,
    onChange,
    language = "c",
    readOnly = false,
    className = "",
    path,
    markers = [],
    fontSize = 15,
    showLineNumbers = true,
    options = {},
    editorApiRef,
}) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        loader.init().catch((err) => {
            console.error("[CodeBridgeMonaco] loader.init failed", err);
            if (!cancelled) setLoadFailed(true);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const handleBeforeMount = useCallback((monacoInstance) => {
        ensureCodebridgeJpLanguage(monacoInstance);
    }, []);

    const applyMarkers = useCallback((monacoInstance, editor, nextMarkers) => {
        if (!monacoInstance || !editor) return;
        const model = editor.getModel();
        if (!model) return;
        const sev = monacoInstance.MarkerSeverity;
        const mapped = (nextMarkers ?? [])
            .filter((m) => m && Number(m.line) >= 1)
            .map((m) => ({
                startLineNumber: Number(m.line),
                startColumn: 1,
                endLineNumber: Number(m.line),
                endColumn: 1000,
                message: String(m.message ?? "エラー"),
                severity:
                    m.severity === "warning"
                        ? sev.Warning
                        : m.severity === "info"
                          ? sev.Info
                          : sev.Error,
            }));
        monacoInstance.editor.setModelMarkers(model, "codebridge", mapped);
    }, []);

    const handleMount = useCallback(
        (editor, monacoInstance) => {
            editorRef.current = editor;
            monacoRef.current = monacoInstance;
            ensureCodebridgeJpLanguage(monacoInstance);
            applyMarkers(monacoInstance, editor, markers);
            if (editorApiRef) {
                editorApiRef.current = {
                    revealLine(line) {
                        const n = Number(line);
                        if (!Number.isFinite(n) || n < 1) return;
                        editor.revealLineInCenter(n);
                        editor.setPosition({ lineNumber: n, column: 1 });
                        editor.focus();
                    },
                    focus() {
                        editor.focus();
                    },
                };
            }
        },
        [applyMarkers, markers, editorApiRef]
    );

    useEffect(() => {
        return () => {
            if (editorApiRef) editorApiRef.current = null;
        };
    }, [editorApiRef]);

    useEffect(() => {
        applyMarkers(monacoRef.current, editorRef.current, markers);
    }, [markers, applyMarkers]);

    useEffect(() => {
        const monacoInstance = monacoRef.current;
        const editor = editorRef.current;
        if (!monacoInstance || !editor) return;
        const model = editor.getModel();
        if (!model) return;
        if (model.getLanguageId() !== language) {
            monacoInstance.editor.setModelLanguage(model, language);
        }
    }, [language]);

    const ariaPlaceholder =
        typeof options?.ariaLabel === "string" ? options.ariaLabel : "コードエディタ";

    const fallback = (
        <MonacoTextareaFallback
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={className}
            placeholder={ariaPlaceholder}
        />
    );

    if (loadFailed) {
        return fallback;
    }

    return (
        <MonacoErrorBoundary
            fallback={fallback}
        >
            <div className={`cb-monaco${className ? ` ${className}` : ""}`}>
                <Editor
                    height="100%"
                    width="100%"
                    language={language}
                    theme="vs-dark"
                    value={value ?? ""}
                    path={path}
                    beforeMount={handleBeforeMount}
                    onMount={handleMount}
                    onChange={(next) => {
                        if (!readOnly && onChange) onChange(next ?? "");
                    }}
                    onValidate={() => {
                        /* markers は別経路で管理 */
                    }}
                    loading={
                        <div className="cb-monaco-loading">エディタを読み込み中…</div>
                    }
                    options={{
                        ...DEFAULT_OPTIONS,
                        fontSize,
                        lineNumbers: showLineNumbers ? "on" : "off",
                        readOnly,
                        domReadOnly: readOnly,
                        ...options,
                    }}
                />
            </div>
        </MonacoErrorBoundary>
    );
}

export { CODEBRIDGE_JP_LANGUAGE_ID };
