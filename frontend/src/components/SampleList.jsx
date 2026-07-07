import { useMemo } from "react";
import { CODEBRIDGE_SAMPLES, HOME_FEATURED_SAMPLE_IDS } from "../data/samples.js";

export function SampleList({ featuredOnly = false, onSelect }) {
    const samples = useMemo(() => {
        const all = Array.isArray(CODEBRIDGE_SAMPLES) ? CODEBRIDGE_SAMPLES : [];
        if (featuredOnly) {
            return HOME_FEATURED_SAMPLE_IDS.map((id) => all.find((s) => s?.id === id)).filter(
                Boolean
            );
        }
        return all;
    }, [featuredOnly]);

    if (samples.length === 0) {
        return <p className="home-empty">サンプルを読み込めませんでした。</p>;
    }

    if (featuredOnly) {
        return (
            <div className="home-sample-grid">
                {samples.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        className="sample-card"
                        onClick={() => onSelect?.(s)}
                    >
                        <span className="sample-card-title">{s.title ?? "サンプル"}</span>
                        <span className="sample-card-desc">{s.description ?? ""}</span>
                    </button>
                ))}
            </div>
        );
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
            {samples.map((s) => (
                <option key={s.id} value={s.id}>
                    {s.title} — {s.description}
                </option>
            ))}
        </select>
    );
}

export function useSamples() {
    return useMemo(
        () => (Array.isArray(CODEBRIDGE_SAMPLES) ? CODEBRIDGE_SAMPLES : []),
        []
    );
}
