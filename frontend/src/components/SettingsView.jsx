import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { useLearningRoadmap } from "../hooks/useLearningRoadmap.js";

/**
 * CodeBridge 全体の設定（学習進捗・章開放など）。
 */
export function SettingsView({ onBackEntry }) {
    const { clearAllProgress } = useLearningProgress();
    const { settings, setUnlockAll } = useLearningRoadmap();

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
        <main className="home-view settings-view">
            <div className="home-back-entry">
                <button type="button" className="home-back-entry-btn" onClick={onBackEntry}>
                    ← CodeBridge ホーム
                </button>
            </div>

            <section className="panel home-section home-settings">
                <h2 className="home-section-title">設定</h2>
                <p className="home-section-desc">
                    学習の章開放と進捗リセットなど、アプリ全体の設定です。
                </p>

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
