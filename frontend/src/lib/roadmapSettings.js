/**
 * ロードマップ設定 — localStorage
 * 将来: XP / バッジ等は extensions に追加
 */

const ROADMAP_SETTINGS_KEY = "codebridge-roadmap-settings-v1";
const SETTINGS_CHANGE_EVENT = "codebridge-roadmap-settings-change";

/** @returns {{ unlockAll: boolean, extensions: object }} */
export function loadRoadmapSettings() {
    try {
        const raw = localStorage.getItem(ROADMAP_SETTINGS_KEY);
        if (!raw) return { unlockAll: false, extensions: {} };
        const parsed = JSON.parse(raw);
        return {
            unlockAll: Boolean(parsed?.unlockAll),
            extensions:
                parsed?.extensions && typeof parsed.extensions === "object"
                    ? parsed.extensions
                    : {},
        };
    } catch {
        return { unlockAll: false, extensions: {} };
    }
}

/** @param {{ unlockAll?: boolean, extensions?: object }} settings */
export function saveRoadmapSettings(settings) {
    try {
        localStorage.setItem(
            ROADMAP_SETTINGS_KEY,
            JSON.stringify({
                unlockAll: Boolean(settings?.unlockAll),
                extensions: settings?.extensions ?? {},
            })
        );
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));
    } catch {
        /* ignore */
    }
}

export function getRoadmapSettingsChangeEventName() {
    return SETTINGS_CHANGE_EVENT;
}

export function setUnlockAll(unlockAll) {
    const current = loadRoadmapSettings();
    saveRoadmapSettings({ ...current, unlockAll });
}
