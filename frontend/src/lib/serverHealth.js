/** 実行サーバー (port 3000) の生存確認 — GET /health */
export async function checkServerHealth() {
    try {
        const response = await fetch("/health", { method: "GET" });
        if (!response.ok) return false;
        const data = await response.json();
        return data?.status === "ok";
    } catch {
        return false;
    }
}
