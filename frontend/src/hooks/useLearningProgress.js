import { useCallback, useEffect, useMemo, useState } from "react";
import { CODEBRIDGE_SAMPLES } from "../data/samples.js";
import {
    computeProgressStats,
    getProgressChangeEventName,
    getSampleProgress,
    loadProgress,
    recordPracticeAttempt,
    recordSamplePlayed,
    resetProgress,
} from "../lib/progress.js";

export function useLearningProgress() {
    const [store, setStore] = useState(() => loadProgress());

    useEffect(() => {
        const eventName = getProgressChangeEventName();
        const refresh = () => setStore(loadProgress());
        window.addEventListener(eventName, refresh);
        return () => window.removeEventListener(eventName, refresh);
    }, []);

    const stats = useMemo(
        () => computeProgressStats(store, CODEBRIDGE_SAMPLES),
        [store]
    );

    const getProgress = useCallback(
        (sampleId) => getSampleProgress(store, sampleId),
        [store]
    );

    const markSamplePlayed = useCallback((sampleId) => {
        recordSamplePlayed(sampleId);
        setStore(loadProgress());
    }, []);

    const markPracticeAttempt = useCallback((sampleId, cleared) => {
        const result = recordPracticeAttempt(sampleId, cleared);
        setStore(loadProgress());
        return result;
    }, []);

    const clearAllProgress = useCallback(() => {
        resetProgress();
        setStore(loadProgress());
    }, []);

    return {
        store,
        stats,
        getProgress,
        markSamplePlayed,
        markPracticeAttempt,
        clearAllProgress,
    };
}
