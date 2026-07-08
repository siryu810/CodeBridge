import { useState, useEffect, useMemo } from "react";
import { SampleList } from "./SampleList.jsx";
import { ProgressSummary } from "./ProgressSummary.jsx";
import { CategoryProgress } from "./CategoryProgress.jsx";
import { LearningRoadmap } from "./LearningRoadmap.jsx";
import { NextLearnCard } from "./NextLearnCard.jsx";
import { getRecentList, formatRecentDate } from "../lib/recent.js";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { useLearningRoadmap } from "../hooks/useLearningRoadmap.js";
import { CODEBRIDGE_SAMPLES } from "../data/samples.js";

export function HomeView({ onNewProject, onOpenSample, onOpenRecent }) {
    const [recent, setRecent] = useState([]);
    const { stats, clearAllProgress } = useLearningProgress();
    const {
        chapters,
        nextChapter,
        nextSampleId,
        getSampleById,
        settings,
        setUnlockAll,
    } = useLearningRoadmap();

    useEffect(() => {
        setRecent(getRecentList());
    }, []);

    const continueSample = useMemo(() => {
        if (!stats.lastSampleId) return null;
        return CODEBRIDGE_SAMPLES.find((s) => s.id === stats.lastSampleId) ?? null;
    }, [stats.lastSampleId]);

    const nextSample = useMemo(
        () => (nextSampleId ? getSampleById(nextSampleId) : null),
        [nextSampleId, getSampleById]
    );

    const handleOpenSampleId = (sampleId) => {
        const sample = getSampleById(sampleId);
        if (sample) onOpenSample?.(sample);
    };

    const handleResetProgress = () => {
        if (
            window.confirm(
                "学習進捗をすべてリセットしますか？\n（練習のクリア状況と挑戦回数が消えます）"
            )
        ) {
            clearAllProgress();
        }
    };

    return (
        <main className="home-view">
            <section className="panel home-progress-panel">
                <ProgressSummary stats={stats} />
            </section>

            <NextLearnCard
                nextChapter={nextChapter}
                nextSample={nextSample}
                onStart={(sample) => sample && onOpenSample?.(sample)}
            />

            {continueSample && (
                <section className="panel home-section home-continue">
                    <h3 className="home-section-title">続きから学習</h3>
                    <p className="home-section-desc">
                        前回のサンプル「{continueSample.title}」から再開できます。
                    </p>
                    <button
                        type="button"
                        className="home-continue-btn"
                        onClick={() => onOpenSample?.(continueSample)}
                    >
                        続きから学習 →
                    </button>
                </section>
            )}

            <section className="panel home-section home-roadmap-panel">
                <LearningRoadmap
                    chapters={chapters}
                    unlockAll={settings.unlockAll}
                    onUnlockAllChange={setUnlockAll}
                    onOpenSample={handleOpenSampleId}
                />
            </section>

            <section className="panel home-section">
                <CategoryProgress byCategory={stats.byCategory} />
            </section>

            <section className="home-hero panel">
                <h2 className="home-hero-title">CodeBridge へようこそ</h2>
                <p className="home-hero-text">
                    CodeBridge は「C言語を日本語に翻訳するツール」ではなく、
                    <strong>プログラミングの考え方を日本語で学べる学習IDE</strong> です。
                    日本語でコードを書き、C言語への変換・実行・エラーの日本語説明を通して理解を深めます。
                </p>
                <ul className="home-features">
                    <li>日本語命令（表示・もし・入力 など）でコードが書ける</li>
                    <li>リアルタイムで C 言語に変換され、意味も学べる</li>
                    <li>実行結果とエラーを分けて、初心者向けに表示</li>
                </ul>
                <p className="home-future-note">※ 将来は .c / .cb ファイルの保存・読み込みにも対応予定です。</p>
            </section>

            <div className="home-actions">
                <section className="panel home-section">
                    <h3 className="home-section-title">新規作成</h3>
                    <p className="home-section-desc">空のエディタから、自分のコードを書き始めます。</p>
                    <button type="button" className="home-primary-btn" onClick={onNewProject}>
                        ＋ 新規作成
                    </button>
                </section>

                <section className="panel home-section">
                    <h3 className="home-section-title">おすすめサンプル</h3>
                    <p className="home-section-desc">
                        人気の題材から始められます。カード右上の ✓ は練習クリア済みです。
                    </p>
                    <SampleList
                        featuredOnly
                        showProgress
                        onSelect={(s) => s && onOpenSample(s)}
                    />
                </section>
            </div>

            <section className="panel home-section">
                <h3 className="home-section-title">すべてのサンプル</h3>
                <p className="home-section-desc">
                    カテゴリ別に並んでいます。練習をクリアすると ✓ 完了 になります。
                </p>
                <SampleList
                    groupByCategory
                    showProgress
                    onSelect={(s) => s && onOpenSample(s)}
                />
            </section>

            <section className="panel home-section home-recent">
                <h3 className="home-section-title">最近使ったコード</h3>
                <div className="recent-list">
                    {recent.length === 0 ? (
                        <p className="home-empty">
                            まだ履歴がありません。新規作成またはサンプルから始めてください。
                        </p>
                    ) : (
                        recent.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className="recent-item"
                                onClick={() => onOpenRecent(item.code, item.title)}
                            >
                                <span className="recent-title">{item.title}</span>
                                <span className="recent-meta">{formatRecentDate(item.updatedAt)}</span>
                            </button>
                        ))
                    )}
                </div>
            </section>

            <section className="panel home-section home-settings">
                <h3 className="home-section-title">設定</h3>
                <label className="roadmap-unlock-all roadmap-unlock-all--settings">
                    <input
                        type="checkbox"
                        checked={settings.unlockAll}
                        onChange={(e) => setUnlockAll(e.target.checked)}
                    />
                    すべての章を開放する
                </label>
                <button
                    type="button"
                    className="home-reset-btn"
                    onClick={handleResetProgress}
                >
                    学習進捗をリセット
                </button>
            </section>
        </main>
    );
}
