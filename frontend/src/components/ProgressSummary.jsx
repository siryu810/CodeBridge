export function ProgressSummary({ stats, compact = false }) {
    if (!stats) return null;

    return (
        <section className={`progress-summary${compact ? " progress-summary--compact" : ""}`}>
            <h3 className="progress-summary-title">学習進捗</h3>
            <dl className="progress-summary-stats">
                <div className="progress-summary-row">
                    <dt>サンプル</dt>
                    <dd>
                        {stats.samplesPlayed} / {stats.totalSamples} サンプル
                    </dd>
                </div>
                <div className="progress-summary-row">
                    <dt>練習クリア</dt>
                    <dd>
                        {stats.practiceCleared} / {stats.totalSamples} 練習クリア
                    </dd>
                </div>
                <div className="progress-summary-row progress-summary-row--highlight">
                    <dt>達成率</dt>
                    <dd>{stats.achievementRate}%</dd>
                </div>
            </dl>
        </section>
    );
}
