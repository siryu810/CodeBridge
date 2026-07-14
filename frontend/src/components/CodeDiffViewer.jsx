import { useMemo, useEffect, useCallback } from "react";
import { compareJapaneseCode } from "../lib/codeDiff.js";

function DiffLine({ row }) {
    const { type, lineNumber, userLine, answerLine, message, label } = row;

    if (type === "same") {
        return (
            <div className="code-diff-line code-diff-line--same">
                <span className="code-diff-label">{label}</span>
                <span className="code-diff-prefix"> </span>
                <code className="code-diff-text">{answerLine || userLine}</code>
            </div>
        );
    }

    return (
        <div className={`code-diff-block code-diff-block--${type}`}>
            <div className="code-diff-block-head">
                <span className="code-diff-label">{label}</span>
                {lineNumber != null && (
                    <span className="code-diff-line-no">{lineNumber}行目</span>
                )}
            </div>
            {userLine && (
                <div className="code-diff-line code-diff-line--user">
                    <span className="code-diff-prefix">-</span>
                    <code className="code-diff-text">{userLine}</code>
                </div>
            )}
            {answerLine && (
                <div className="code-diff-line code-diff-line--answer">
                    <span className="code-diff-prefix">+</span>
                    <code className="code-diff-text">{answerLine}</code>
                </div>
            )}
            {message && <p className="code-diff-message">{message}</p>}
        </div>
    );
}

export function CodeDiffViewer({ userCode, answerCode, result: resultProp }) {
    const result = useMemo(() => {
        if (resultProp) return resultProp;
        return compareJapaneseCode(userCode, answerCode);
    }, [userCode, answerCode, resultProp]);

    return (
        <div className="code-diff-viewer">
            {result.isExactMatch && result.rows.length === 0 && (
                <p className="code-diff-match-all">模範解答と一致しています。</p>
            )}

            {result.isExactMatch && result.rows.length > 0 && (
                <p className="code-diff-match-all">すべての行が一致しています。</p>
            )}

            <div className="code-diff-rows">
                {result.rows.map((row, index) => (
                    <DiffLine key={`${row.type}-${row.lineNumber}-${index}`} row={row} />
                ))}
            </div>

            {result.hints.length > 0 && (
                <section className="code-diff-hints">
                    <h4 className="code-diff-hints-title">ヒント</h4>
                    <ul className="code-diff-hints-list">
                        {result.hints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

export function CodeCompareModal({
    open,
    onClose,
    userCode,
    answerCode,
    sampleTitle,
    language = "japanese",
}) {
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Escape") onClose?.();
        },
        [onClose]
    );

    useEffect(() => {
        if (!open) return undefined;
        document.addEventListener("keydown", handleKeyDown);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = prev;
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
        <div
            className="code-diff-modal-overlay"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="code-diff-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="code-diff-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="code-diff-modal-header">
                    <h3 id="code-diff-modal-title" className="code-diff-modal-title">
                        模範解答と比較
                        {sampleTitle ? ` — ${sampleTitle}` : ""}
                        {!sampleTitle && language === "c" ? " — C言語" : ""}
                        {!sampleTitle && language === "japanese" ? " — 日本語" : ""}
                    </h3>
                    <button
                        type="button"
                        className="code-diff-modal-close"
                        onClick={onClose}
                        aria-label="閉じる"
                    >
                        ×
                    </button>
                </header>
                <div className="code-diff-modal-body">
                    <CodeDiffViewer userCode={userCode} answerCode={answerCode} />
                </div>
            </div>
        </div>
    );
}
