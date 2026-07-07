import { findUsedMappings } from "./convert.js";
import {
    getLearningEntryByDictKey,
    getLearningEntryById,
    sortLearningEntries,
} from "@shared/learningDictionary.js";

const C_PATTERN_TO_LEARNING_ID = [
    { pattern: />=/g, id: "ge" },
    { pattern: /<=/g, id: "le" },
    { pattern: /!=/g, id: "ne_equal" },
    { pattern: /==/g, id: "eq_equal" },
    { pattern: /&&/g, id: "and" },
    { pattern: /\|\|/g, id: "or" },
    { pattern: /(?<![=!<>])>(?!=)/g, id: "gt" },
    { pattern: /(?<![=!<>])<(?!=)/g, id: "lt" },
];

/** コード解析結果から学習辞書エントリ一覧（重複なし・表示順） */
export function findUsedLearningEntries(source, mode = "jp2c") {
    const mappings = findUsedMappings(source ?? "", mode);
    const seen = new Set();
    const entries = [];

    const addByDictKey = (key) => {
        const entry = getLearningEntryByDictKey(key);
        if (entry && !seen.has(entry.id)) {
            seen.add(entry.id);
            entries.push(entry);
        }
    };

    for (const item of mappings) {
        if (item?.key) addByDictKey(item.key);
    }

    if (mode === "c2jp") {
        const text = source ?? "";
        for (const { pattern, id } of C_PATTERN_TO_LEARNING_ID) {
            pattern.lastIndex = 0;
            if (pattern.test(text)) {
                const entry = getLearningEntryById(id);
                if (entry && !seen.has(entry.id)) {
                    seen.add(entry.id);
                    entries.push(entry);
                }
            }
        }
    }

    return sortLearningEntries(entries);
}

export { getLearningEntryById, getLearningEntryByDictKey };
