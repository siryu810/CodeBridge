const LEARN_NAV_ITEMS = [
    { view: "learn", label: "学習ホーム" },
    { view: "learn-roadmap", label: "ロードマップ" },
    { view: "learn-samples", label: "サンプル" },
    { view: "learn-progress", label: "進捗" },
];

/**
 * 学習系画面のコンパクトなサブナビ。
 */
export function LearnSubNav({ activeView, onNavigate, onBackEntry }) {
    return (
        <div className="learn-subnav">
            <button type="button" className="learn-subnav-back" onClick={onBackEntry}>
                ← ホーム
            </button>
            <nav className="learn-subnav-links" aria-label="学習メニュー">
                {LEARN_NAV_ITEMS.map((item) => (
                    <button
                        key={item.view}
                        type="button"
                        className={`learn-subnav-link${activeView === item.view ? " is-active" : ""}`}
                        onClick={() => onNavigate?.(item.view)}
                        aria-current={activeView === item.view ? "page" : undefined}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
