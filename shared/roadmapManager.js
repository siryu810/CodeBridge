// CodeBridge 学習ロードマップ — 検証・進捗計算

import { LEARNING_ROADMAP } from "./learningRoadmap.js";

/** @typedef {"error" | "warning"} RoadmapIssueLevel */

/**
 * @typedef {object} RoadmapIssue
 * @property {RoadmapIssueLevel} level
 * @property {string} message
 * @property {string} [chapterId]
 */

/**
 * @typedef {object} ChapterProgress
 * @property {number} total
 * @property {number} cleared
 * @property {number} percent
 * @property {boolean} isCleared
 */

/**
 * @typedef {object} ChapterState
 * @property {import("./learningRoadmap.js").LearningChapter} chapter
 * @property {ChapterProgress} progress
 * @property {boolean} unlocked
 * @property {Array<{ id: string, title: string, completed: boolean }>} samples
 */

/**
 * @param {import("./learningRoadmap.js").LearningChapter[]} roadmap
 * @param {Set<string>|string[]} allSampleIds
 * @returns {RoadmapIssue[]}
 */
export function validateRoadmap(roadmap = LEARNING_ROADMAP, allSampleIds) {
    const issues = [];
    const idSet = new Set(Array.isArray(allSampleIds) ? allSampleIds : [...allSampleIds]);
    const chapterIds = new Set();
    const usedSampleIds = new Set();

    if (!Array.isArray(roadmap) || roadmap.length === 0) {
        issues.push({ level: "error", message: "ロードマップが空です" });
        return issues;
    }

    for (const chapter of roadmap) {
        const cid = chapter.id ?? "(idなし)";

        if (!chapter.id?.trim()) {
            issues.push({ level: "error", message: "章 id が空です", chapterId: cid });
        } else if (chapterIds.has(chapter.id)) {
            issues.push({
                level: "error",
                message: `章 id が重複しています: ${chapter.id}`,
                chapterId: cid,
            });
        } else {
            chapterIds.add(chapter.id);
        }

        if (!chapter.title?.trim()) {
            issues.push({ level: "error", message: "章 title が空です", chapterId: cid });
        }

        if (!Array.isArray(chapter.sampleIds) || chapter.sampleIds.length === 0) {
            issues.push({
                level: "error",
                message: "sampleIds が空です",
                chapterId: cid,
            });
            continue;
        }

        for (const sampleId of chapter.sampleIds) {
            if (!idSet.has(sampleId)) {
                issues.push({
                    level: "error",
                    message: `存在しない sampleId: ${sampleId}`,
                    chapterId: cid,
                });
            }
            if (usedSampleIds.has(sampleId)) {
                issues.push({
                    level: "error",
                    message: `sampleId が複数章に登録されています: ${sampleId}`,
                    chapterId: cid,
                });
            }
            usedSampleIds.add(sampleId);
        }
    }

    for (const sampleId of idSet) {
        if (!usedSampleIds.has(sampleId)) {
            issues.push({
                level: "warning",
                message: `ロードマップ未登録のサンプル: ${sampleId}`,
            });
        }
    }

    return issues;
}

/**
 * @param {object} store
 * @param {string[]} sampleIds
 * @param {(store: object, sampleId: string) => { completed: boolean }} getSampleProgress
 * @returns {ChapterProgress}
 */
export function computeChapterProgress(store, sampleIds, getSampleProgress) {
    const ids = Array.isArray(sampleIds) ? sampleIds : [];
    const total = ids.length;
    let cleared = 0;

    for (const sampleId of ids) {
        if (getSampleProgress(store, sampleId).completed) cleared += 1;
    }

    return {
        total,
        cleared,
        percent: total > 0 ? Math.round((cleared / total) * 100) : 0,
        isCleared: total > 0 && cleared === total,
    };
}

/**
 * @param {object} params
 * @param {object} params.store
 * @param {import("./learningRoadmap.js").LearningChapter[]} [params.roadmap]
 * @param {boolean} [params.unlockAll]
 * @param {Map<string, { id: string, title: string }>|Record<string, { title?: string }>} [params.sampleLookup]
 * @param {(store: object, sampleId: string) => { completed: boolean }} params.getSampleProgress
 * @returns {{ chapters: ChapterState[], nextChapter: ChapterState|null, nextSampleId: string|null }}
 */
export function getRoadmapState({
    store,
    roadmap = LEARNING_ROADMAP,
    unlockAll = false,
    sampleLookup = {},
    getSampleProgress,
}) {
    const lookup =
        sampleLookup instanceof Map
            ? sampleLookup
            : new Map(Object.entries(sampleLookup).map(([id, v]) => [id, { id, title: v?.title ?? id }]));

    /** @type {ChapterState[]} */
    const chapters = roadmap.map((chapter) => {
        const progress = computeChapterProgress(store, chapter.sampleIds, getSampleProgress);
        const samples = chapter.sampleIds.map((id) => ({
            id,
            title: lookup.get(id)?.title ?? id,
            completed: getSampleProgress(store, id).completed,
        }));
        return {
            chapter,
            progress,
            unlocked: false,
            samples,
        };
    });

    for (let i = 0; i < chapters.length; i++) {
        if (unlockAll) {
            chapters[i].unlocked = true;
        } else if (i === 0) {
            chapters[i].unlocked = true;
        } else {
            chapters[i].unlocked = chapters[i - 1].progress.isCleared;
        }
    }

    let nextChapter = null;
    let nextSampleId = null;

    for (const state of chapters) {
        if (!state.unlocked) break;
        if (!state.progress.isCleared) {
            nextChapter = state;
            nextSampleId =
                state.samples.find((s) => !s.completed)?.id ?? state.samples[0]?.id ?? null;
            break;
        }
    }

    return { chapters, nextChapter, nextSampleId };
}

export function getRoadmapIssueCounts(issues) {
    return {
        errors: issues.filter((i) => i.level === "error").length,
        warnings: issues.filter((i) => i.level === "warning").length,
    };
}

const RoadmapManager = {
    LEARNING_ROADMAP,
    validateRoadmap,
    computeChapterProgress,
    getRoadmapState,
    getRoadmapIssueCounts,
};

export default RoadmapManager;
