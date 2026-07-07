import { useWorkspaceResize } from "../hooks/useWorkspaceResize.js";

export function IdeWorkspaceSplit({
    editorTitle,
    previewTitle,
    editor,
    preview,
    previewVisible,
    previewPercent,
    onHidePreview,
    onShowPreview,
    setPreviewPercent,
    setPreviewVisible,
}) {
    const { workspaceRef, onSplitterMouseDown } = useWorkspaceResize({
        previewPercent,
        setPreviewPercent,
        setPreviewVisible,
    });

    return (
        <div
            ref={workspaceRef}
            className={`ide-workspace${previewVisible ? "" : " ide-workspace--editor-only"}`}
            style={
                previewVisible
                    ? { "--preview-width": `${previewPercent}%` }
                    : undefined
            }
        >
            <section className="panel panel-editor ide-pane ide-pane--editor editor-pane">
                <div className="panel-header panel-header-with-action">
                    <span>{editorTitle}</span>
                    {!previewVisible && (
                        <button
                            type="button"
                            className="ide-panel-toggle"
                            onClick={onShowPreview}
                            title="変換結果パネルを表示"
                        >
                            変換結果を表示
                        </button>
                    )}
                </div>
                {editor}
            </section>

            {previewVisible && (
                <>
                    <div
                        className="ide-splitter"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="エディタと変換結果の幅を調整"
                        onMouseDown={onSplitterMouseDown}
                    />
                    <section className="panel panel-c-output ide-pane ide-pane--preview preview-pane">
                        <div className="panel-header panel-header-with-action">
                            <span>{previewTitle}</span>
                            <button
                                type="button"
                                className="ide-panel-toggle ide-panel-toggle--close"
                                onClick={onHidePreview}
                                title="変換結果パネルを非表示"
                                aria-label="変換結果を非表示"
                            >
                                非表示
                            </button>
                        </div>
                        {preview}
                    </section>
                </>
            )}
        </div>
    );
}
