import { useMemo } from "react";
import { getChapterForSampleId } from "@shared/learningRoadmap.js";
import { LearnSubNav } from "./LearnSubNav.jsx";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { useLearningRoadmap } from "../hooks/useLearningRoadmap.js";
import { CODEBRIDGE_SAMPLES } from "../data/samples.js";

/**
 * 学習ホーム — 「今、何を学べばいいか」と主要メニューだけを表示。
 */
export function LearnHomeView({
    onOpenSample,
    onNavigateLearn,
    onBackEntry,
}) {
    const { stats } = useLearningProgress();
    const { nextChapter, nextSampleId, getSampleById } = useLearningRoadmap();

    const continueSample = useMemo(() => {
        if (!stats.lastSampleId) return null;
        return CODEBRIDGE_SAMPLES.find((s) => s.id === stats.lastSampleId) ?? null;
    }, [stats.lastSampleId]);

    const continueChapter = useMemo(
        () => (continueSample ? getChapterForSampleId(continueSample.id) : null),
        [continueSample]
    );

    const nextSample = useMemo(
        () => (nextSampleId ? getSampleById(nextSampleId) : null),
        [nextSampleId, getSampleById]
    );

    const hero = continueSample
        ? {
              kind: "continue",
              title: "続きから学習",
              chapterLabel: continueChapter
                  ? `第${continueChapter.chapterNumber}章　${continueChapter.title}`
                  : null,
              sampleTitle: continueSample.title,
              desc: "前回の続きから再開できます。",
              cta: "続ける →",
              sample: continueSample,
          }
        : nextChapter
          ? {
                kind: "next",
                title: "次に学ぶ",
                chapterLabel: `第${nextChapter.chapter.chapterNumber}章　${nextChapter.chapter.title}`,
                sampleTitle: nextSample?.title ?? null,
                desc: nextSample
                    ? `「${nextSample.title}」から始めるとスムーズです。`
                    : "次の章を学びましょう。",
                cta: "開始する →",
                sample: nextSample,
            }
          : {
                kind: "complete",
                title: "学習ホーム",
                chapterLabel: null,
                sampleTitle: null,
                desc: "おめでとうございます！ すべての章をクリアしました。",
                cta: null,
                sample: null,
            };

    return (
        <main className="home-view learn-home-view">
            <LearnSubNav
                activeView="learn"
                onNavigate={onNavigateLearn}
                onBackEntry={onBackEntry}
            />

            <section className="panel learn-continue-hero">
                <h2 className="learn-continue-hero-label">{hero.title}</h2>
                {hero.chapterLabel && (
                    <p className="learn-continue-hero-chapter">{hero.chapterLabel}</p>
                )}
                {hero.sampleTitle && (
                    <p className="learn-continue-hero-sample">「{hero.sampleTitle}」</p>
                )}
                <p className="learn-continue-hero-desc">{hero.desc}</p>
                {hero.cta && hero.sample && (
                    <button
                        type="button"
                        className="home-continue-btn learn-continue-hero-btn"
                        onClick={() => onOpenSample?.(hero.sample)}
                    >
                        {hero.cta}
                    </button>
                )}
            </section>

            <div className="learn-menu-grid" role="navigation" aria-label="学習機能">
                <button
                    type="button"
                    className="panel learn-menu-card"
                    onClick={() => onNavigateLearn?.("learn-roadmap")}
                >
                    <span className="learn-menu-card-title">ロードマップ</span>
                    <span className="learn-menu-card-desc">基礎から順番に学習する</span>
                    <span className="learn-menu-card-cta">開く →</span>
                </button>

                <button
                    type="button"
                    className="panel learn-menu-card"
                    onClick={() => onNavigateLearn?.("learn-samples")}
                >
                    <span className="learn-menu-card-title">サンプル</span>
                    <span className="learn-menu-card-desc">
                        {stats.totalSamples}種類から選んで学ぶ
                    </span>
                    <span className="learn-menu-card-cta">開く →</span>
                </button>

                <button
                    type="button"
                    className="panel learn-menu-card"
                    onClick={() => onNavigateLearn?.("learn-progress")}
                >
                    <span className="learn-menu-card-title">学習進捗</span>
                    <span className="learn-menu-card-desc">
                        達成率 {stats.achievementRate}%
                        <br />
                        {stats.practiceCleared} / {stats.totalSamples} 練習
                    </span>
                    <span className="learn-menu-card-cta">詳細 →</span>
                </button>
            </div>
        </main>
    );
}
