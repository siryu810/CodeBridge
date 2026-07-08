/**
 * CodeBridge 学習進捗 — localStorage 永続化
 * 将来の level / xp / badges / おすすめ / 苦手分析は meta.extensions に追加予定
 */

const PROGRESS_STORAGE_KEY = "codebridge-progress-v1";
const PROGRESS_VERSION = 1;
const PROGRESS_CHANGE_EVENT = "codebridge-progress-change";

/** @typedef {{ completed: boolean, attempts: number, lastPlayed: string|null }} SampleProgressEntry */

/**
 * @typedef {object} LearningProgressStore
 * @property {number} version
 * @property {Record<string, SampleProgressEntry>} samples
 * @property {object} meta
 * @property {string|null} meta.lastSampleId
 * @property {object} [meta.extensions]
 */

export function todayDateString() {
    return new Date().toISOString().slice(0, 10);
}

/** @returns {LearningProgressStore} */
export function createEmptyProgress() {
    return {
        version: PROGRESS_VERSION,
        samples: {},
        meta: {
            lastSampleId: null,
            extensions: {},
        },
    };
}

function sanitizeEntry(raw) {
    if (!raw || typeof raw !== "object") {
        return { completed: false, attempts: 0, lastPlayed: null };
    }
    return {
        completed: Boolean(raw.completed),
        attempts: Math.max(0, Number(raw.attempts) || 0),
        lastPlayed: typeof raw.lastPlayed === "string" ? raw.lastPlayed : null,
    };
}

/** @returns {LearningProgressStore} */
export function loadProgress() {
    try {
        const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (!raw) return createEmptyProgress();
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return createEmptyProgress();

        const samples = {};
        if (parsed.samples && typeof parsed.samples === "object") {
            for (const [id, entry] of Object.entries(parsed.samples)) {
                samples[id] = sanitizeEntry(entry);
            }
        }

        return {
            version: PROGRESS_VERSION,
            samples,
            meta: {
                lastSampleId:
                    typeof parsed.meta?.lastSampleId === "string"
                        ? parsed.meta.lastSampleId
                        : null,
                extensions:
                    parsed.meta?.extensions && typeof parsed.meta.extensions === "object"
                        ? parsed.meta.extensions
                        : {},
            },
        };
    } catch {
        return createEmptyProgress();
    }
}

/** @param {LearningProgressStore} store */
export function saveProgress(store) {
    try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(store));
        notifyProgressChange();
    } catch {
        /* ignore */
    }
}

export function notifyProgressChange() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT));
    }
}

export function getProgressChangeEventName() {
    return PROGRESS_CHANGE_EVENT;
}

/** @param {LearningProgressStore} store @param {string} sampleId */
export function getSampleProgress(store, sampleId) {
    if (!sampleId) return sanitizeEntry(null);
    return sanitizeEntry(store.samples[sampleId]);
}

/**
 * サンプルを開いたとき（学習開始）
 * @param {string} sampleId
 */
export function recordSamplePlayed(sampleId) {
    if (!sampleId) return loadProgress();
    const store = loadProgress();
    const entry = getSampleProgress(store, sampleId);
    entry.lastPlayed = todayDateString();
    store.samples[sampleId] = entry;
    store.meta.lastSampleId = sampleId;
    saveProgress(store);
    return store;
}

/**
 * 練習の実行結果を記録
 * @param {string} sampleId
 * @param {boolean} cleared
 */
export function recordPracticeAttempt(sampleId, cleared) {
    if (!sampleId) {
        return { attempts: 0, completed: false, isFirstClear: false, isRetry: false };
    }

    const store = loadProgress();
    const entry = getSampleProgress(store, sampleId);
    const wasCompleted = entry.completed;

    entry.attempts += 1;
    entry.lastPlayed = todayDateString();
    if (cleared) entry.completed = true;

    store.samples[sampleId] = entry;
    store.meta.lastSampleId = sampleId;
    saveProgress(store);

    return {
        attempts: entry.attempts,
        completed: entry.completed,
        isFirstClear: cleared && !wasCompleted,
        isRetry: cleared && wasCompleted,
    };
}

export function resetProgress() {
    const empty = createEmptyProgress();
    saveProgress(empty);
    return empty;
}

/**
 * @param {LearningProgressStore} store
 * @param {Array<{ id: string, category?: string }>} allSamples
 */
export function computeProgressStats(store, allSamples) {
    const samples = Array.isArray(allSamples) ? allSamples : [];
    const totalSamples = samples.length;

    let samplesPlayed = 0;
    let practiceCleared = 0;

    for (const sample of samples) {
        const entry = getSampleProgress(store, sample.id);
        if (entry.lastPlayed) samplesPlayed += 1;
        if (entry.completed) practiceCleared += 1;
    }

    const achievementRate =
        totalSamples > 0 ? Math.round((practiceCleared / totalSamples) * 100) : 0;

    /** @type {Record<string, { total: number, cleared: number, percent: number }>} */
    const byCategory = {};

    for (const sample of samples) {
        const category = sample.category ?? "未分類";
        if (!byCategory[category]) {
            byCategory[category] = { total: 0, cleared: 0, percent: 0 };
        }
        byCategory[category].total += 1;
        if (getSampleProgress(store, sample.id).completed) {
            byCategory[category].cleared += 1;
        }
    }

    for (const stat of Object.values(byCategory)) {
        stat.percent =
            stat.total > 0 ? Math.round((stat.cleared / stat.total) * 100) : 0;
    }

    return {
        totalSamples,
        samplesPlayed,
        practiceCleared,
        achievementRate,
        byCategory,
        lastSampleId: store.meta?.lastSampleId ?? null,
    };
}
