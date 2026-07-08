import { useMemo } from "react";
import { CODEBRIDGE_SAMPLES, HOME_FEATURED_SAMPLE_IDS } from "../data/samples.js";
import { useLearningProgress } from "../hooks/useLearningProgress.js";

function ProgressBadge({ completed }) {
    return (
        <span
            className={`sample-progress-badge${completed ? " is-done" : ""}`}
            aria-label={completed ? "練習クリア済み" : "未完了"}
        >
            {completed ? "✓ 完了" : "○ 未完了"}
        </span>
    );
}

export function SampleList({
    featuredOnly = false,
    showAll = false,
    showProgress = false,
    groupByCategory = false,
    onSelect,
}) {
    const { getProgress } = useLearningProgress();

    const samples = useMemo(() => {
        const all = Array.isArray(CODEBRIDGE_SAMPLES) ? CODEBRIDGE_SAMPLES : [];
        if (showAll || groupByCategory) return all;
        if (featuredOnly) {
            return HOME_FEATURED_SAMPLE_IDS.map((id) => all.find((s) => s?.id === id)).filter(
                Boolean
            );
        }
        return all;
    }, [featuredOnly, showAll, groupByCategory]);

    const grouped = useMemo(() => {
        if (!groupByCategory) return null;
        const map = new Map();
        for (const sample of samples) {
            const cat = sample.category ?? "未分類";
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat).push(sample);
        }
        return map;
    }, [groupByCategory, samples]);

    if (samples.length === 0) {
        return <p className="home-empty">サンプルを読み込めませんでした。</p>;
    }

    const renderCard = (s) => {
        const progress = showProgress ? getProgress(s.id) : null;
        return (
            <button
                key={s.id}
                type="button"
                className="sample-card"
                onClick={() => onSelect?.(s)}
            >
                {showProgress && <ProgressBadge completed={progress.completed} />}
                <span className="sample-card-title">{s.title ?? "サンプル"}</span>
                <span className="sample-card-desc">{s.description ?? ""}</span>
            </button>
        );
    };

    if (groupByCategory && grouped) {
        return (
            <div className="sample-category-groups">
                {[...grouped.entries()].map(([category, items]) => (
                    <div key={category} className="sample-category-group">
                        <h4 className="sample-category-label">{category}</h4>
                        <div className="home-sample-grid">{items.map(renderCard)}</div>
                    </div>
                ))}
            </div>
        );
    }

    if (featuredOnly || showAll) {
        return <div className="home-sample-grid">{samples.map(renderCard)}</div>;
    }

    return (
        <select
            className="sample-select"
            defaultValue=""
            onChange={(e) => {
                const sample = samples.find((s) => s.id === e.target.value);
                if (sample) onSelect?.(sample);
                e.target.value = "";
            }}
            aria-label="サンプル集"
        >
            <option value="">サンプルを選ぶ…</option>
            {samples.map((s) => {
                const progress = showProgress ? getProgress(s.id) : null;
                const prefix = showProgress ? (progress.completed ? "✓ " : "○ ") : "";
                return (
                    <option key={s.id} value={s.id}>
                        {prefix}
                        {s.title} — {s.description}
                    </option>
                );
            })}
        </select>
    );
}

export function useSamples() {
    return useMemo(
        () => (Array.isArray(CODEBRIDGE_SAMPLES) ? CODEBRIDGE_SAMPLES : []),
        []
    );
}
