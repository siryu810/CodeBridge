export function ServerStatusBanner({ connected, checked }) {
    if (!checked) return null;

    return (
        <div
            className={`server-status-banner ${connected ? "server-status-ok" : "server-status-error"}`}
            role="status"
            aria-live="polite"
        >
            {connected ? (
                <span className="server-status-text">🟢 実行サーバー：接続済み</span>
            ) : (
                <div className="server-status-error-body">
                    <span className="server-status-text">🔴 実行サーバーに接続できません</span>
                    <span className="server-status-hint">「npm run dev」を実行してください</span>
                </div>
            )}
        </div>
    );
}
