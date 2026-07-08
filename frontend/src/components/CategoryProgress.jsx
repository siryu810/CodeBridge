const CATEGORY_ORDER = [
    "基本",
    "条件分岐",
    "繰り返し",
    "配列",
    "関数",
    "文字列",
    "計算",
    "乱数",
];

function progressBarBlocks(percent) {
    const filled = Math.round(percent / 10);
    return "█".repeat(filled) + "░".repeat(10 - filled);
}

export function CategoryProgress({ byCategory }) {
    if (!byCategory || Object.keys(byCategory).length === 0) return null;

    const categories = [
        ...CATEGORY_ORDER.filter((name) => byCategory[name]),
        ...Object.keys(byCategory).filter((name) => !CATEGORY_ORDER.includes(name)),
    ];

    return (
        <section className="category-progress">
            <h3 className="category-progress-title">カテゴリ別の進捗</h3>
            <ul className="category-progress-list">
                {categories.map((name) => {
                    const stat = byCategory[name];
                    return (
                        <li key={name} className="category-progress-item">
                            <div className="category-progress-head">
                                <span className="category-progress-name">{name}</span>
                                <span className="category-progress-percent">{stat.percent}%</span>
                            </div>
                            <div
                                className="category-progress-bar"
                                role="progressbar"
                                aria-valuenow={stat.percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${name} ${stat.percent}%`}
                            >
                                <span className="category-progress-bar-text">
                                    {progressBarBlocks(stat.percent)}
                                </span>
                            </div>
                            <p className="category-progress-meta">
                                {stat.cleared} / {stat.total} クリア
                            </p>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
