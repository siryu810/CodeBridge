import { useMemo } from "react";
import { getRecentList, formatRecentDate } from "../lib/recent.js";

/**
 * アプリ起動直後の入口ホーム。
 * 学習ホーム（LearnHomeView）とは別画面。
 */
export function EntryHomeView({ onNewProject, onGoLearn, onOpenRecent, onGoSettings }) {
    const recentList = useMemo(() => getRecentList(), []);
    const latestRecent = recentList.length > 0 ? recentList[0] : null;
    const extraRecent = recentList.slice(1, 4);

    return (
        <main className="entry-home">
            <div className="entry-home-inner">
                <header className="entry-home-brand">
                    <h1 className="entry-home-title">
                        CodeBridge{" "}
                        <span className="app-version" title="Release Candidate">
                            v0.9.0-rc.1
                        </span>
                    </h1>
                    {onGoSettings && (
                        <button
                            type="button"
                            className="entry-home-settings-btn"
                            onClick={onGoSettings}
                            aria-label="設定"
                        >
                            設定
                        </button>
                    )}
                </header>

                <section className="entry-home-hero">
                    <h2 className="entry-home-headline">日本語で、プログラムを書く。</h2>
                    <p className="entry-home-lead">
                        プログラミングの考えを、日本語のままコードにして実行できる開発・学習環境
                    </p>
                </section>

                <div className="entry-home-choices" role="group" aria-label="使い方を選ぶ">
                    <button
                        type="button"
                        className="entry-choice-card entry-choice-card--create"
                        onClick={onNewProject}
                    >
                        <span className="entry-choice-label">＋ 新しく作る</span>
                        <span className="entry-choice-desc">日本語でコードを書いて、プログラムを作る</span>
                    </button>

                    <button
                        type="button"
                        className="entry-choice-card entry-choice-card--learn"
                        onClick={onGoLearn}
                    >
                        <span className="entry-choice-label">学習する →</span>
                        <span className="entry-choice-desc">サンプルと練習から、プログラミングの考え方を学ぶ</span>
                    </button>
                </div>

                {latestRecent && (
                    <div className="entry-home-continue">
                        <p className="entry-home-continue-primary">
                            <button
                                type="button"
                                className="entry-home-continue-btn"
                                onClick={() => onOpenRecent?.(latestRecent.code, latestRecent.title)}
                            >
                                続きから開く — {latestRecent.title}
                            </button>
                        </p>
                        {extraRecent.length > 0 && (
                            <ul className="entry-home-recent-list">
                                {extraRecent.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            className="entry-home-recent-item"
                                            onClick={() => onOpenRecent?.(item.code, item.title)}
                                        >
                                            <span className="entry-home-recent-title">{item.title}</span>
                                            <span className="entry-home-recent-meta">
                                                {formatRecentDate(item.updatedAt)}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
