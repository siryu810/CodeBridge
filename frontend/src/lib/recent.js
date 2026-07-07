const RECENT_STORAGE_KEY = "codebridge-recent-v1";
const RECENT_MAX = 5;

function sanitizeRecentItem(item) {
    if (!item || typeof item !== "object") return null;
    const code = typeof item.code === "string" ? item.code : "";
    if (!code.trim()) return null;
    return {
        id: typeof item.id === "string" ? item.id : `recent-${Date.now()}`,
        title: typeof item.title === "string" && item.title.trim() ? item.title : "無題のコード",
        code,
        updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : new Date().toISOString(),
    };
}

export function getRecentList() {
    try {
        const raw = localStorage.getItem(RECENT_STORAGE_KEY);
        const list = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(list)) return [];
        return list.map(sanitizeRecentItem).filter(Boolean);
    } catch {
        return [];
    }
}

function saveRecentList(list) {
    try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
    } catch {
        /* ignore */
    }
}

export function addToRecent(title, code) {
    const trimmed = (code ?? "").trim();
    if (!trimmed) return getRecentList();

    const entry = {
        id: "recent-" + Date.now(),
        title: title || "無題のコード",
        code,
        updatedAt: new Date().toISOString(),
    };

    let list = getRecentList().filter((item) => item.code !== code);
    list.unshift(entry);
    saveRecentList(list);
    return list;
}

export function formatRecentDate(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleString("ja-JP", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
}
