// 後方互換 — 新規コードは shared/sampleManager.js を使用してください

export {
    REQUIRED_SAMPLE_FIELDS,
    countJapaneseInputs,
    countNonEmptyStdinLines,
    pickRunOutputText,
    normalizeExpectedOutput,
} from "./sampleManager.js";
