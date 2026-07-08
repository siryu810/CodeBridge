function progressBarBlocks(percent) {
    const filled = Math.round(percent / 10);
    return "█".repeat(filled) + "░".repeat(10 - filled);
}

export function LearningRoadmap({ chapters, onOpenSample, unlockAll, onUnlockAllChange }) {
    return (
        <section className="learning-roadmap">
            <div className="learning-roadmap-head">
                <h3 className="learning-roadmap-title">学習ロードマップ</h3>
                <label className="roadmap-unlock-all">
                    <input
                        type="checkbox"
                        checked={unlockAll}
                        onChange={(e) => onUnlockAllChange?.(e.target.checked)}
                    />
                    すべて開放
                </label>
            </div>
            <p className="learning-roadmap-desc">
                章を順番に進めましょう。前の章をすべてクリアすると次の章が開放されます。
            </p>

            <ol className="roadmap-chapter-list">
                {chapters.map((state) => {
                    const { chapter, progress, unlocked, samples } = state;
                    return (
                        <li
                            key={chapter.id}
                            className={`roadmap-chapter${unlocked ? "" : " is-locked"}${progress.isCleared ? " is-cleared" : ""}`}
                        >
                            <div className="roadmap-chapter-header">
                                <div className="roadmap-chapter-heading">
                                    <span className="roadmap-chapter-num">
                                        第{chapter.chapterNumber}章
                                    </span>
                                    <h4 className="roadmap-chapter-name">{chapter.title}</h4>
                                    {!unlocked && (
                                        <span className="roadmap-lock-badge" aria-label="未開放">
                                            🔒
                                        </span>
                                    )}
                                    {progress.isCleared && (
                                        <span className="roadmap-clear-badge">
                                            ✓ 第{chapter.chapterNumber}章クリア
                                        </span>
                                    )}
                                </div>
                                <span className="roadmap-chapter-time">
                                    推定 {chapter.estimatedMinutes}分
                                </span>
                            </div>

                            <p className="roadmap-chapter-description">{chapter.description}</p>

                            <div className="roadmap-chapter-topics">
                                <span className="roadmap-label">学ぶこと</span>
                                <ul>
                                    {chapter.topics.map((topic) => (
                                        <li key={topic}>{topic}</li>
                                    ))}
                                </ul>
                            </div>

                            {unlocked && (
                                <>
                                    <div
                                        className="roadmap-chapter-progress"
                                        role="progressbar"
                                        aria-valuenow={progress.percent}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label={`第${chapter.chapterNumber}章 ${progress.percent}%`}
                                    >
                                        <span className="roadmap-progress-bar">
                                            {progressBarBlocks(progress.percent)}
                                        </span>
                                        <span className="roadmap-progress-percent">
                                            {progress.percent}%
                                        </span>
                                    </div>

                                    <div className="roadmap-samples">
                                        <span className="roadmap-label">サンプル</span>
                                        <ul className="roadmap-sample-list">
                                            {samples.map((sample) => (
                                                <li key={sample.id}>
                                                    <button
                                                        type="button"
                                                        className={`roadmap-sample-btn${sample.completed ? " is-done" : ""}`}
                                                        onClick={() => onOpenSample?.(sample.id)}
                                                        disabled={!unlocked}
                                                    >
                                                        <span className="roadmap-sample-status">
                                                            {sample.completed ? "✓" : "○"}
                                                        </span>
                                                        {sample.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}

                            {!unlocked && (
                                <p className="roadmap-locked-note">
                                    前の章をすべてクリアすると開放されます。
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
