import { useCallback, useEffect, useMemo, useState } from "react";
import { LEARNING_ROADMAP } from "@shared/learningRoadmap.js";
import { getRoadmapState } from "@shared/roadmapManager.js";
import { CODEBRIDGE_SAMPLES } from "../data/samples.js";
import { getSampleProgress } from "../lib/progress.js";
import { useLearningProgress } from "./useLearningProgress.js";
import {
    getRoadmapSettingsChangeEventName,
    loadRoadmapSettings,
    setUnlockAll as persistUnlockAll,
} from "../lib/roadmapSettings.js";

export function useLearningRoadmap() {
    const { store } = useLearningProgress();
    const [settings, setSettings] = useState(() => loadRoadmapSettings());

    useEffect(() => {
        const eventName = getRoadmapSettingsChangeEventName();
        const refresh = () => setSettings(loadRoadmapSettings());
        window.addEventListener(eventName, refresh);
        return () => window.removeEventListener(eventName, refresh);
    }, []);

    const sampleLookup = useMemo(() => {
        const map = new Map();
        for (const sample of CODEBRIDGE_SAMPLES) {
            map.set(sample.id, { id: sample.id, title: sample.title });
        }
        return map;
    }, []);

    const roadmapState = useMemo(
        () =>
            getRoadmapState({
                store,
                roadmap: LEARNING_ROADMAP,
                unlockAll: settings.unlockAll,
                sampleLookup,
                getSampleProgress,
            }),
        [store, settings.unlockAll, sampleLookup]
    );

    const setUnlockAll = useCallback((unlockAll) => {
        persistUnlockAll(unlockAll);
        setSettings(loadRoadmapSettings());
    }, []);

    const getSampleById = useCallback(
        (id) => CODEBRIDGE_SAMPLES.find((s) => s.id === id) ?? null,
        []
    );

    return {
        settings,
        setUnlockAll,
        roadmapState,
        getSampleById,
        chapters: roadmapState.chapters,
        nextChapter: roadmapState.nextChapter,
        nextSampleId: roadmapState.nextSampleId,
    };
}
