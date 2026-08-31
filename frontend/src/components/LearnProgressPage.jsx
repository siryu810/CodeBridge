import { LearnSubNav } from "./LearnSubNav.jsx";
import { ProgressSummary } from "./ProgressSummary.jsx";
import { CategoryProgress } from "./CategoryProgress.jsx";
import { useLearningProgress } from "../hooks/useLearningProgress.js";

export function LearnProgressPage({ onNavigateLearn, onBackEntry, onGoSettings }) {
    const { stats } = useLearningProgress();

    return (
        <main className="home-view learn-page">
            <LearnSubNav
                activeView="learn-progress"
                onNavigate={onNavigateLearn}
                onBackEntry={onBackEntry}
            />

            <section className="panel home-progress-panel">
                <ProgressSummary stats={stats} />
            </section>

            <section className="panel home-section">
                <CategoryProgress byCategory={stats.byCategory} />
            </section>

            <p className="learn-progress-settings-hint">
                進捗のリセットは
                <button
                    type="button"
                    className="learn-inline-link"
                    onClick={onGoSettings}
                >
                    設定
                </button>
                から行えます。
            </p>
        </main>
    );
}
