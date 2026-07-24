/**
 * IDE 下部パネルの高さ・開閉状態（localStorage 永続化）
 */

const STORAGE_KEY = "codebridge-bottom-panel-v1";

export const BOTTOM_PANEL_MIN_PX = 80;
export const BOTTOM_PANEL_COLLAPSED_PX = 36;
/** 通常時の画面高さに対する割合 */
export const BOTTOM_PANEL_DEFAULT_RATIO = 0.28;
export const BOTTOM_PANEL_MAX_RATIO = 0.8;

function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}

/** 旧タブ名（terminal / problems）を新仕様へ移行 */
function normalizeActiveTab(tab) {
    if (tab === "input") return "input";
    if (tab === "output" || tab === "terminal") return "output";
    return "output";
}

export function getDefaultBottomPanelHeight(viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800) {
    const maxPx = Math.floor(viewportHeight * BOTTOM_PANEL_MAX_RATIO);
    const preferred = Math.floor(viewportHeight * BOTTOM_PANEL_DEFAULT_RATIO);
    return clamp(preferred, BOTTOM_PANEL_MIN_PX, maxPx);
}

export function loadBottomPanelState() {
    const fallback = {
        height: getDefaultBottomPanelHeight(),
        open: true,
        collapsed: false,
        maximized: false,
        activeTab: "output",
    };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        const vh = typeof window !== "undefined" ? window.innerHeight : 800;
        const maxPx = Math.floor(vh * BOTTOM_PANEL_MAX_RATIO);
        return {
            height: clamp(
                Number(parsed.height) || fallback.height,
                BOTTOM_PANEL_MIN_PX,
                maxPx
            ),
            open: parsed.open !== false,
            collapsed: Boolean(parsed.collapsed),
            maximized: Boolean(parsed.maximized),
            activeTab: normalizeActiveTab(parsed.activeTab),
        };
    } catch {
        return fallback;
    }
}

export function saveBottomPanelState(state) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                height: state.height,
                open: state.open,
                collapsed: state.collapsed,
                maximized: state.maximized,
                activeTab: state.activeTab,
            })
        );
    } catch {
        /* ignore */
    }
}
