export function ServerStatusIndicator({ connected, checked }) {
    if (!checked) {
        return (
            <span className="server-status-indicator server-status-checking" role="status">
                サーバー確認中…
            </span>
        );
    }

    if (connected) {
        return (
            <span className="server-status-indicator server-status-ok" role="status" title="実行サーバーに接続済み">
                🟢 接続済み
            </span>
        );
    }

    return (
        <span
            className="server-status-indicator server-status-error"
            role="status"
            title="npm run dev を実行してください"
        >
            🔴 未接続
        </span>
    );
}
