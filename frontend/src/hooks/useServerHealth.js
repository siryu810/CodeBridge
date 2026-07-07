import { useEffect, useState } from "react";
import { checkServerHealth } from "../lib/serverHealth.js";

const POLL_INTERVAL_MS = 10_000;

export function useServerHealth(intervalMs = POLL_INTERVAL_MS) {
    const [connected, setConnected] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function poll() {
            const ok = await checkServerHealth();
            if (!cancelled) {
                setConnected(ok);
                setChecked(true);
            }
        }

        poll();
        const timerId = setInterval(poll, intervalMs);

        return () => {
            cancelled = true;
            clearInterval(timerId);
        };
    }, [intervalMs]);

    return { connected, checked };
}
