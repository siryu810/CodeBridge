import { useEffect, useCallback } from "react";

export function CommandDictionaryModal({ entry, onClose }) {
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Escape") onClose?.();
        },
        [onClose]
    );

    useEffect(() => {
        if (!entry) return undefined;
        document.addEventListener("keydown", handleKeyDown);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = prev;
        };
    }, [entry, handleKeyDown]);

    if (!entry) return null;

    const cLabel = entry.displayC ?? entry.c ?? "";

    return (
        <div
            className="dict-modal-overlay"
            role="presentation"
            onClick={() => onClose?.()}
        >
            <div
                className="dict-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dict-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="dict-modal-header">
                    <h3 id="dict-modal-title" className="dict-modal-title">
                        {entry.jp}
                    </h3>
                    <button
                        type="button"
                        className="dict-modal-close"
                        onClick={() => onClose?.()}
                        aria-label="閉じる"
                    >
                        ×
                    </button>
                </div>

                <dl className="dict-modal-body">
                    <div className="dict-modal-row">
                        <dt>日本語命令</dt>
                        <dd>{entry.jp}</dd>
                    </div>
                    <div className="dict-modal-row">
                        <dt>C言語</dt>
                        <dd>
                            <code>{cLabel}</code>
                        </dd>
                    </div>
                    <div className="dict-modal-row">
                        <dt>意味</dt>
                        <dd>{entry.short}</dd>
                    </div>
                    <div className="dict-modal-row">
                        <dt>初心者向け説明</dt>
                        <dd>{entry.beginner}</dd>
                    </div>
                    {Array.isArray(entry.useCases) && entry.useCases.length > 0 && (
                        <div className="dict-modal-row">
                            <dt>使う場面</dt>
                            <dd>
                                <ul className="dict-modal-list">
                                    {entry.useCases.map((u) => (
                                        <li key={u}>{u}</li>
                                    ))}
                                </ul>
                            </dd>
                        </div>
                    )}
                    {Array.isArray(entry.examples) && entry.examples.length > 0 && (
                        <div className="dict-modal-row">
                            <dt>例</dt>
                            <dd>
                                {entry.examples.map((ex, i) => (
                                    <div key={i} className="dict-modal-example">
                                        <pre className="dict-modal-code">{ex.jp}</pre>
                                        <div className="dict-modal-arrow">↓</div>
                                        <pre className="dict-modal-code">{ex.c}</pre>
                                    </div>
                                ))}
                            </dd>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}
