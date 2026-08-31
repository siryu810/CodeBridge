import { LearnSubNav } from "./LearnSubNav.jsx";
import { SampleList } from "./SampleList.jsx";

export function LearnSamplesPage({ onOpenSample, onNavigateLearn, onBackEntry }) {
    return (
        <main className="home-view learn-page">
            <LearnSubNav
                activeView="learn-samples"
                onNavigate={onNavigateLearn}
                onBackEntry={onBackEntry}
            />

            <section className="panel home-section">
                <h3 className="home-section-title">おすすめサンプル</h3>
                <p className="home-section-desc">
                    人気の題材から始められます。カード右上の ✓ は練習クリア済みです。
                </p>
                <SampleList
                    featuredOnly
                    showProgress
                    onSelect={(s) => s && onOpenSample?.(s)}
                />
            </section>

            <section className="panel home-section">
                <h3 className="home-section-title">すべてのサンプル</h3>
                <p className="home-section-desc">
                    カテゴリ別に並んでいます。練習をクリアすると ✓ 完了 になります。
                </p>
                <SampleList
                    groupByCategory
                    showProgress
                    onSelect={(s) => s && onOpenSample?.(s)}
                />
            </section>
        </main>
    );
}
