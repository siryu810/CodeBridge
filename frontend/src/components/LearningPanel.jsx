export function LearningPanel({
    usedEntries,
    algorithmSteps,
    learningGoals,
    isSampleContext,
    mode = "jp2c",
    onSelectEntry,
    embedded = false,
}) {
    const safeEntries = Array.isArray(usedEntries) ? usedEntries : [];
    const steps = Array.isArray(algorithmSteps) ? algorithmSteps : null;
    const goals = Array.isArray(learningGoals) ? learningGoals : null;

    const content = (
        <div className={`learning-log${embedded ? " learning-log--fill" : ""}`}>
                {goals && goals.length > 0 && (
                    <div className="learning-section">
                        <h4 className="learning-section-title">学習目標</h4>
                        <ul className="learning-goals-list">
                            {goals.map((goal, i) => (
                                <li key={i}>{goal}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {steps && steps.length > 0 && (
                    <div className="learning-section">
                        <h4 className="learning-section-title">アルゴリズムの流れ</h4>
                        <ol className="learning-algorithm-steps">
                            {steps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    </div>
                )}

                {!isSampleContext && (
                    <p className="learning-free-note">
                        このコードの自動アルゴリズム解説は未対応です。対応表や命令辞書を使って確認してください。
                    </p>
                )}

                <div className="learning-section">
                    <h4 className="learning-section-title">このコードで使われている命令</h4>
                    {safeEntries.length === 0 ? (
                        <p className="learning-empty">
                            コードを書くと、使った命令がここに表示されます。クリックすると詳しい説明が開きます。
                        </p>
                    ) : (
                        <ul className="learning-command-list">
                            {safeEntries.map((entry) => (
                                <li key={entry.id}>
                                    <button
                                        type="button"
                                        className="learning-command-btn"
                                        onClick={() => onSelectEntry?.(entry)}
                                    >
                                        <span className="learning-command-jp">{entry.jp}</span>
                                        <span className="learning-command-c">
                                            {mode === "c2jp"
                                                ? `${entry.c} → ${entry.jp}`
                                                : `${entry.jp} → ${entry.c}`}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
    );

    if (embedded) return content;

    return (
        <section className="panel">
            <div className="panel-header">⑤ 学習モード</div>
            {content}
        </section>
    );
}
