import { useCallback, useEffect, useState } from "react";

/**
 * 参考コード用ドロワー（右 / 狭い画面では下）
 * 回答欄へは自動反映しない（コピーはクリップボードのみ）
 */
export function PracticeReferenceDrawer({
    open,
    onClose,
    code,
    language = "japanese",
    onLanguageChange,
}) {
    const [copyState, setCopyState] = useState(/** @type {"idle"|"ok"|"err"} */ ("idle"));

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) setCopyState("idle");
    }, [open]);

    const handleCopy = useCallback(async () => {
        const text = String(code ?? "");
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopyState("ok");
            window.setTimeout(() => setCopyState("idle"), 1600);
        } catch {
            setCopyState("err");
            window.setTimeout(() => setCopyState("idle"), 1600);
        }
    }, [code]);

    return (
        <>
            <button
                type="button"
                className={`practice-ref-drawer-backdrop${open ? " is-open" : ""}`}
                aria-label="参考コードを閉じる"
                tabIndex={open ? 0 : -1}
                onClick={onClose}
            />
            <aside
                className={`practice-ref-drawer${open ? " is-open" : ""}`}
                aria-hidden={!open}
                aria-label="参考コード"
            >
                <header className="practice-ref-drawer-header">
                    <h3 className="practice-ref-drawer-title">参考コード</h3>
                    <div className="practice-ref-drawer-actions">
                        <button
                            type="button"
                            className="practice-btn practice-ref-copy-btn"
                            onClick={handleCopy}
                            disabled={!open || !String(code ?? "").trim()}
                        >
                            {copyState === "ok"
                                ? "コピー済み"
                                : copyState === "err"
                                  ? "コピー失敗"
                                  : "コピー"}
                        </button>
                        <button
                            type="button"
                            className="practice-ref-drawer-close"
                            onClick={onClose}
                            aria-label="閉じる"
                        >
                            ×
                        </button>
                    </div>
                </header>
                <p className="practice-ref-drawer-note">
                    唯一の正解ではありません。読みやすい書き方の一例です。クリップボードへコピーできます（回答欄には自動では入りません）。
                </p>
                <div
                    className="practice-lang-switch"
                    role="group"
                    aria-label="参考コードの言語"
                >
                    <button
                        type="button"
                        className={`practice-lang-btn${language === "japanese" ? " is-active" : ""}`}
                        onClick={() => onLanguageChange?.("japanese")}
                    >
                        日本語
                    </button>
                    <button
                        type="button"
                        className={`practice-lang-btn${language === "c" ? " is-active" : ""}`}
                        onClick={() => onLanguageChange?.("c")}
                    >
                        C言語
                    </button>
                </div>
                <pre className="practice-ref-drawer-code">{code}</pre>
            </aside>
        </>
    );
}
