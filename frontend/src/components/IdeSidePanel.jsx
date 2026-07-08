const PANEL_LABELS = {
    practice: "練習",
    learning: "学習",
    dict: "対応表",
    error: "エラー",
};

export function IdeSideRail({ activePanel, onToggle, hasErrorBadge, showPractice = false }) {
    const panelIds = showPractice
        ? ["practice", "learning", "dict", "error"]
        : ["learning", "dict", "error"];

    return (
        <aside className="ide-rail" aria-label="サイドパネル">
            {panelIds.map((id) => (
                <button
                    key={id}
                    type="button"
                    className={`ide-rail-btn${activePanel === id ? " is-active" : ""}`}
                    onClick={() => onToggle(id)}
                    aria-pressed={activePanel === id}
                    aria-label={PANEL_LABELS[id]}
                    title={PANEL_LABELS[id]}
                >
                    <span className="ide-rail-btn-label">{PANEL_LABELS[id]}</span>
                    {id === "error" && hasErrorBadge && (
                        <span className="ide-rail-badge" aria-hidden="true" />
                    )}
                </button>
            ))}
        </aside>
    );
}

export function IdeSlidePanel({ open, title, onClose, children }) {
    return (
        <aside
            className={`ide-slide-panel${open ? " is-open" : ""}`}
            aria-hidden={!open}
        >
            <div className="ide-slide-panel-header">
                <h2 className="ide-slide-panel-title">{title}</h2>
                <button
                    type="button"
                    className="ide-slide-panel-close"
                    onClick={onClose}
                    aria-label="パネルを閉じる"
                >
                    ×
                </button>
            </div>
            <div className="ide-slide-panel-body">{children}</div>
        </aside>
    );
}
