export function NextLearnCard({ nextChapter, nextSample, onStart }) {
    if (!nextChapter) {
        return (
            <section className="panel home-section home-next-learn home-next-learn--complete">
                <h3 className="home-section-title">次に学ぶ</h3>
                <p className="home-section-desc">
                    おめでとうございます！ すべての章をクリアしました。
                </p>
            </section>
        );
    }

    const { chapter } = nextChapter;

    return (
        <section className="panel home-section home-next-learn">
            <h3 className="home-section-title">次に学ぶ</h3>
            <p className="home-next-learn-lead">
                次は <strong>第{chapter.chapterNumber}章 {chapter.title}</strong>{" "}
                を学びましょう。
            </p>
            {nextSample && (
                <p className="home-section-desc">
                    おすすめ: 「{nextSample.title}」から始めるとスムーズです。
                </p>
            )}
            <button
                type="button"
                className="home-continue-btn"
                onClick={() => onStart?.(nextSample)}
            >
                開始する →
            </button>
        </section>
    );
}
