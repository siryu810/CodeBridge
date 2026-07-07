import { useState, useCallback } from "react";

/** 将来の UI モード切替用プリセット（初心者 / 学習 / 開発） */
export const IDE_LAYOUT_PRESETS = {
    beginner: {
        previewVisible: true,
        previewPercent: 30,
    },
    learning: {
        previewVisible: true,
        previewPercent: 35,
    },
    developer: {
        previewVisible: false,
        previewPercent: 25,
    },
};

const DEFAULT_PRESET = IDE_LAYOUT_PRESETS.beginner;

export const PREVIEW_PERCENT_MIN = 15;
export const PREVIEW_PERCENT_MAX = 50;
export const PREVIEW_HIDE_THRESHOLD = 12;

export function useIdeLayout(initialPreset = "beginner") {
    const preset = IDE_LAYOUT_PRESETS[initialPreset] ?? DEFAULT_PRESET;
    const [layoutPreset, setLayoutPreset] = useState(initialPreset);
    const [previewVisible, setPreviewVisible] = useState(preset.previewVisible);
    const [previewPercent, setPreviewPercent] = useState(preset.previewPercent);

    const applyLayoutPreset = useCallback((name) => {
        const next = IDE_LAYOUT_PRESETS[name];
        if (!next) return;
        setLayoutPreset(name);
        setPreviewVisible(next.previewVisible);
        setPreviewPercent(next.previewPercent);
    }, []);

    const togglePreview = useCallback(() => {
        setPreviewVisible((v) => !v);
    }, []);

    const showPreview = useCallback(() => {
        setPreviewVisible(true);
    }, []);

    const hidePreview = useCallback(() => {
        setPreviewVisible(false);
    }, []);

    const setPreviewPercentClamped = useCallback((value) => {
        const n = Number(value);
        if (Number.isNaN(n)) return;
        if (n < PREVIEW_HIDE_THRESHOLD) {
            setPreviewVisible(false);
            return;
        }
        setPreviewVisible(true);
        setPreviewPercent(Math.min(PREVIEW_PERCENT_MAX, Math.max(PREVIEW_PERCENT_MIN, n)));
    }, []);

    return {
        layoutPreset,
        previewVisible,
        setPreviewVisible,
        previewPercent,
        setPreviewPercent: setPreviewPercentClamped,
        togglePreview,
        showPreview,
        hidePreview,
        applyLayoutPreset,
    };
}
