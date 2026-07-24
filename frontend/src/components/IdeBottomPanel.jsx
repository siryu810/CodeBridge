import { useCallback, useEffect, useRef, useState } from "react";
import {
    BOTTOM_PANEL_COLLAPSED_PX,
    BOTTOM_PANEL_MAX_RATIO,
    BOTTOM_PANEL_MIN_PX,
    saveBottomPanelState,
} from "../hooks/useBottomPanel.js";

const TABS = [
    { id: "output", label: "実行結果" },
    { id: "input", label: "入力" },
];

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {number} props.height
 * @param {(h: number) => void} props.onHeightChange
 * @param {boolean} props.collapsed
 * @param {boolean} props.maximized
 * @param {() => void} props.onToggleCollapse
 * @param {() => void} props.onToggleMaximize
 * @param {() => void} props.onClose
 * @param {() => void} props.onClearOutput
 * @param {"output"|"input"} props.activeTab
 * @param {(tab: string) => void} props.onTabChange
 * @param {"idle"|"running"|"waiting"|"ready"|"error"} props.outputStatus
 * @param {Array<{ kind: string, text: string }>} props.outputLines
 * @param {string} props.stdin
 * @param {(v: string) => void} props.onStdinChange
 * @param {() => void} props.onStdinClear
 * @param {() => void} [props.onStdinSave]
 * @param {boolean} props.needsStdin
 * @param {import("react").RefObject<HTMLTextAreaElement|null>} [props.inputRef]
 */
export function IdeBottomPanel({
    open,
    height,
    onHeightChange,
    collapsed,
    maximized,
    onToggleCollapse,
    onToggleMaximize,
    onClose,
    onClearOutput,
    activeTab,
    onTabChange,
    outputStatus,
    outputLines,
    stdin,
    onStdinChange,
    onStdinClear,
    onStdinSave,
    needsStdin,
    inputRef,
}) {
    const panelRef = useRef(/** @type {HTMLDivElement|null} */ (null));
    const outputBodyRef = useRef(/** @type {HTMLPreElement|null} */ (null));
    const stickToBottomRef = useRef(true);
    const [savedHint, setSavedHint] = useState("");

    useEffect(() => {
        if (!open) return;
        saveBottomPanelState({
            height,
            open,
            collapsed,
            maximized,
            activeTab,
        });
    }, [height, open, collapsed, maximized, activeTab]);

    useEffect(() => {
        const el = outputBodyRef.current;
        if (!el || activeTab !== "output") return;
        if (stickToBottomRef.current) {
            el.scrollTop = el.scrollHeight;
        }
    }, [outputLines, activeTab]);

    const onOutputScroll = useCallback(() => {
        const el = outputBodyRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        stickToBottomRef.current = distance < 48;
    }, []);

    const onResizeMouseDown = useCallback(
        (event) => {
            if (collapsed || maximized || !open) return;
            event.preventDefault();
            const startY = event.clientY;
            const startHeight = height;
            const center = panelRef.current?.parentElement;
            const centerHeight = center?.clientHeight ?? window.innerHeight;
            const maxPx = Math.floor(centerHeight * BOTTOM_PANEL_MAX_RATIO);

            const onMove = (moveEvent) => {
                const delta = startY - moveEvent.clientY;
                const next = Math.min(
                    maxPx,
                    Math.max(BOTTOM_PANEL_MIN_PX, startHeight + delta)
                );
                onHeightChange(next);
            };

            const onUp = () => {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                document.body.classList.remove("body--resizing-row");
            };

            document.body.classList.add("body--resizing-row");
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        },
        [collapsed, maximized, open, height, onHeightChange]
    );

    const handleSaveInput = useCallback(() => {
        onStdinSave?.();
        setSavedHint("入力を保存しました");
        window.setTimeout(() => setSavedHint(""), 1600);
    }, [onStdinSave]);

    if (!open) return null;

    const displayHeight = collapsed
        ? BOTTOM_PANEL_COLLAPSED_PX
        : maximized
          ? undefined
          : height;

    const statusLabel =
        outputStatus === "running"
            ? "実行中"
            : outputStatus === "waiting"
              ? "入力待ち"
              : outputStatus === "error"
                ? "エラー"
                : outputStatus === "ready"
                  ? "接続済み"
                  : "待機中";

    const statusClass =
        outputStatus === "running"
            ? "is-running"
            : outputStatus === "waiting"
              ? "is-waiting"
              : outputStatus === "error"
                ? "is-error"
                : outputStatus === "ready"
                  ? "is-ready"
                  : "is-idle";

    return (
        <div
            ref={panelRef}
            className={`ide-bottom-panel${collapsed ? " is-collapsed" : ""}${
                maximized ? " is-maximized" : ""
            }`}
            style={
                maximized
                    ? undefined
                    : { height: displayHeight, flexBasis: displayHeight }
            }
        >
            {!collapsed && !maximized && (
                <div
                    className="ide-bottom-splitter"
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label="実行パネルの高さを変更"
                    onMouseDown={onResizeMouseDown}
                />
            )}

            <div className="ide-bottom-toolbar">
                <div className="ide-bottom-tabs" role="tablist" aria-label="実行パネル">
                    {TABS.map((tab) => {
                        const badge = tab.id === "input" && needsStdin ? "●" : null;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                className={`ide-bottom-tab${
                                    activeTab === tab.id ? " is-active" : ""
                                }`}
                                onClick={() => {
                                    onTabChange(tab.id);
                                    if (collapsed) onToggleCollapse();
                                }}
                            >
                                {tab.label}
                                {badge != null && (
                                    <span className="ide-bottom-tab-badge">{badge}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="ide-bottom-actions">
                    <span className={`ide-bottom-status ${statusClass}`} title="実行ステータス">
                        <span className="ide-bottom-status-dot" />
                        {statusLabel}
                    </span>
                    <button
                        type="button"
                        className="ide-bottom-action"
                        onClick={onClearOutput}
                        title="実行結果をクリア"
                    >
                        クリア
                    </button>
                    <button
                        type="button"
                        className="ide-bottom-action"
                        onClick={onToggleCollapse}
                        title={collapsed ? "展開" : "折りたたみ"}
                    >
                        {collapsed ? "展開" : "折りたたみ"}
                    </button>
                    <button
                        type="button"
                        className="ide-bottom-action"
                        onClick={onToggleMaximize}
                        title={maximized ? "元のサイズ" : "最大化"}
                    >
                        {maximized ? "復元" : "最大化"}
                    </button>
                    <button
                        type="button"
                        className="ide-bottom-action"
                        onClick={onClose}
                        title="パネルを閉じる（実行で再表示）"
                    >
                        閉じる
                    </button>
                </div>
            </div>

            {!collapsed && (
                <div className="ide-bottom-body">
                    {activeTab === "output" && (
                        <div className="ide-terminal" role="tabpanel">
                            <div className="ide-terminal-header">
                                <span className="ide-terminal-title">実行結果</span>
                                <span className={`ide-terminal-chip ${statusClass}`}>
                                    {statusLabel}
                                </span>
                            </div>
                            <pre
                                ref={outputBodyRef}
                                className="ide-terminal-body"
                                onScroll={onOutputScroll}
                                tabIndex={0}
                                aria-label="実行結果"
                            >
                                {(outputLines ?? []).length === 0 ? (
                                    <span className="ide-term-line ide-term-line--dim">
                                        「実行」を押すとここに結果が表示されます。
                                        {"\n"}
                                        入力は <span className="ide-term-line--input">&gt; 値</span>{" "}
                                        、プログラムの出力は通常の色で区別されます。
                                    </span>
                                ) : (
                                    (outputLines ?? []).map((line, i) => (
                                        <span
                                            key={`${i}-${line.kind}-${line.text.slice(0, 24)}`}
                                            className={`ide-term-line ide-term-line--${line.kind}`}
                                        >
                                            {line.text || " "}
                                            {"\n"}
                                        </span>
                                    ))
                                )}
                                {outputStatus === "running" && (
                                    <span className="ide-term-cursor" aria-hidden>
                                        ▍
                                    </span>
                                )}
                            </pre>
                        </div>
                    )}

                    {activeTab === "input" && (
                        <div className="ide-input-tab" role="tabpanel">
                            <div className="ide-input-tab-toolbar">
                                <p className="ide-input-tab-hint">
                                    実行前に渡す標準入力です。複数の値は1行に1つ書いてください。
                                    実行結果の表示とは別です。
                                </p>
                                <div className="ide-input-tab-actions">
                                    {savedHint && (
                                        <span className="ide-input-saved">{savedHint}</span>
                                    )}
                                    <button
                                        type="button"
                                        className="ide-bottom-action"
                                        onClick={handleSaveInput}
                                    >
                                        入力を保存
                                    </button>
                                    <button
                                        type="button"
                                        className="ide-bottom-action"
                                        onClick={onStdinClear}
                                    >
                                        入力をクリア
                                    </button>
                                </div>
                            </div>
                            <textarea
                                ref={inputRef}
                                className="ide-input-tab-textarea"
                                value={stdin}
                                onChange={(e) => onStdinChange(e.target.value)}
                                spellCheck={false}
                                placeholder={"例:\n10\n20\n30"}
                                aria-label="標準入力"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
