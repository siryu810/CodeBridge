// CodeBridge 学習ロードマップ検証 — node test-roadmap.mjs

import { CODEBRIDGE_SAMPLES } from "./shared/samples.js";
import { LEARNING_ROADMAP } from "./shared/learningRoadmap.js";
import RoadmapManager, {
    validateRoadmap,
    computeChapterProgress,
    getRoadmapState,
    getRoadmapIssueCounts,
} from "./shared/roadmapManager.js";
import { createEmptyProgress, getSampleProgress } from "./frontend/src/lib/progress.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (err) {
        console.error(`✗ ${name}`);
        console.error(`  ${err.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

console.log("=== 学習ロードマップ検証 ===\n");

test("ロードマップが9章ある", () => {
    assert(LEARNING_ROADMAP.length === 9, `章数が不正: ${LEARNING_ROADMAP.length}`);
});

test("章 id が重複していない", () => {
    const ids = LEARNING_ROADMAP.map((ch) => ch.id);
    assert(new Set(ids).size === ids.length, "章 id が重複しています");
});

test("sampleId がすべて存在する", () => {
    const sampleIds = new Set(CODEBRIDGE_SAMPLES.map((s) => s.id));
    const issues = validateRoadmap(LEARNING_ROADMAP, sampleIds);
    const unknown = issues.filter((i) => i.message.includes("存在しない sampleId"));
    assert(unknown.length === 0, unknown.map((i) => i.message).join("; "));
});

test("sampleId が章間で重複していない", () => {
    const issues = validateRoadmap(
        LEARNING_ROADMAP,
        CODEBRIDGE_SAMPLES.map((s) => s.id)
    );
    const dup = issues.filter((i) => i.message.includes("複数章に登録"));
    assert(dup.length === 0, dup.map((i) => i.message).join("; "));
});

test("全サンプルがロードマップに登録されている", () => {
    const issues = validateRoadmap(
        LEARNING_ROADMAP,
        CODEBRIDGE_SAMPLES.map((s) => s.id)
    );
    const unregistered = issues.filter((i) => i.message.includes("未登録"));
    assert(unregistered.length === 0, unregistered.map((i) => i.message).join("; "));
});

test("検証でエラー0・警告0", () => {
    const issues = validateRoadmap(
        LEARNING_ROADMAP,
        CODEBRIDGE_SAMPLES.map((s) => s.id)
    );
    const counts = getRoadmapIssueCounts(issues);
    if (counts.errors > 0 || counts.warnings > 0) {
        throw new Error(
            `issues: ${issues.map((i) => i.message).join(" / ")}`
        );
    }
});

test("第1章のみ初期開放", () => {
    const store = createEmptyProgress();
    const { chapters } = getRoadmapState({
        store,
        unlockAll: false,
        getSampleProgress,
    });
    assert(chapters[0].unlocked, "第1章が開放されていません");
    assert(!chapters[1].unlocked, "第2章が開放されています");
});

test("第1章クリアで第2章開放", () => {
    const store = createEmptyProgress();
    for (const sid of LEARNING_ROADMAP[0].sampleIds) {
        store.samples[sid] = { completed: true, attempts: 1, lastPlayed: "2026-07-08" };
    }
    const { chapters } = getRoadmapState({
        store,
        unlockAll: false,
        getSampleProgress,
    });
    assert(chapters[0].progress.isCleared, "第1章がクリアになっていません");
    assert(chapters[1].unlocked, "第2章が開放されていません");
});

test("すべて開放設定", () => {
    const store = createEmptyProgress();
    const { chapters } = getRoadmapState({
        store,
        unlockAll: true,
        getSampleProgress,
    });
    assert(chapters.every((c) => c.unlocked), "すべての章が開放されていません");
});

test("章進捗を計算できる", () => {
    const store = createEmptyProgress();
    store.samples.hello = { completed: true, attempts: 1, lastPlayed: "2026-07-08" };
    const progress = computeChapterProgress(
        store,
        LEARNING_ROADMAP[0].sampleIds,
        getSampleProgress
    );
    assert(progress.percent === 100, `percent: ${progress.percent}`);
    assert(progress.isCleared, "isCleared が true ではありません");
});

test("RoadmapManager をエクスポートしている", () => {
    assert(RoadmapManager.validateRoadmap === validateRoadmap, "validateRoadmap");
});

console.log(`\n結果: ${passed} 成功, ${failed} 失敗`);
process.exit(failed > 0 ? 1 : 0);
