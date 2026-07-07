// 実行サーバー (port 3000) と Vite (port 5173) を同時起動 — node scripts/dev.mjs
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const children = [];

function spawnDev(command, args, label) {
    const child = spawn(command, args, {
        cwd: root,
        stdio: "inherit",
        shell: true,
        env: process.env,
    });

    child.on("exit", (code, signal) => {
        if (signal) return;
        console.error(`[dev] ${label} が終了しました (exit ${code})`);
        for (const proc of children) {
            if (proc !== child && !proc.killed) {
                proc.kill("SIGTERM");
            }
        }
        process.exit(code ?? 1);
    });

    children.push(child);
    return child;
}

console.log("[dev] 実行サーバーと Vite を起動します…");
console.log("[dev]   API: http://localhost:3000");
console.log("[dev]   UI:  http://localhost:5173\n");

spawnDev("node", ["server.js"], "server");
spawnDev("npm", ["run", "dev", "--prefix", "frontend"], "vite");

function shutdown() {
    for (const proc of children) {
        if (!proc.killed) proc.kill("SIGTERM");
    }
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
