// CodeBridge Feature Freeze 検査 — node scripts/feature-freeze-check.mjs
// npm run freeze:check
// ※ このスクリプト自身を再帰呼び出ししない

import { spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

let failed = 0;
let warnings = 0;
let manualChecks = 0;

function section(title) {
    console.log(`\n========== ${title} ==========`);
}

function pass(msg) {
    console.log(`✓ ${msg}`);
}

function fail(msg) {
    console.error(`✗ ${msg}`);
    failed++;
}

function warn(msg) {
    console.warn(`⚠ ${msg}`);
    warnings++;
}

function run(command, args, label) {
    section(label);
    const result = spawnSync(command, args, {
        cwd: root,
        stdio: "inherit",
        shell: true,
        env: process.env,
    });
    if (result.status !== 0) {
        fail(`${label} が失敗しました (exit ${result.status ?? "?"})`);
        return false;
    }
    pass(`${label} 完了`);
    return true;
}

function existsRel(rel) {
    return fs.existsSync(path.join(root, rel));
}

function readRel(rel) {
    return fs.readFileSync(path.join(root, rel), "utf8");
}

const REQUIRED_FILES = [
    "docs/feature-freeze-checklist.md",
    "docs/manual-qa-guide.md",
    "docs/known-limitations.md",
    "docs/offline-test.md",
    "docs/final-demo-check.md",
    "docs/demo.md",
    "docs/release-checklist.md",
    "docs/images/README.md",
    "frontend/src/lib/monacoSetup.js",
    "frontend/src/components/CodeBridgeMonaco.jsx",
    "scripts/final-check.mjs",
    "package.json",
    "README.md",
];

function parseChecklist(md) {
    const lines = md.split(/\r?\n/);
    /** @type {{ text: string, checked: boolean, note: string }[]} */
    const items = [];
    let pending = null;

    for (const line of lines) {
        const m = line.match(/^- \[([ xX])\]\s+(.+)$/);
        if (m) {
            if (pending) items.push(pending);
            pending = {
                text: m[2].trim(),
                checked: m[1].toLowerCase() === "x",
                note: "",
            };
            continue;
        }
        const note = line.match(/^\s+-\s+(.+)$/);
        if (note && pending) {
            pending.note = (pending.note ? pending.note + " " : "") + note[1].trim();
        }
    }
    if (pending) items.push(pending);
    return items;
}

async function verifyHealth() {
    const port = String(process.env.FREEZE_HEALTH_PORT || "3099");
    const child = spawn(process.execPath, [path.join(root, "server.js")], {
        cwd: root,
        env: { ...process.env, PORT: port },
        stdio: ["ignore", "pipe", "pipe"],
        shell: false,
    });

    let settled = false;
    const killChild = () => {
        if (settled) return;
        settled = true;
        try {
            child.kill();
        } catch {
            /* ignore */
        }
    };

    try {
        const deadline = Date.now() + 15000;
        let ok = false;
        let lastErr = "";
        while (Date.now() < deadline) {
            if (child.exitCode != null) {
                lastErr = `server exited early (${child.exitCode})`;
                break;
            }
            try {
                const res = await fetch(`http://127.0.0.1:${port}/health`);
                if (res.status === 200) {
                    const body = await res.json();
                    if (body?.status === "ok") {
                        ok = true;
                        break;
                    }
                    lastErr = `unexpected body: ${JSON.stringify(body)}`;
                } else {
                    lastErr = `status ${res.status}`;
                }
            } catch (err) {
                lastErr = err.message;
            }
            await new Promise((r) => setTimeout(r, 300));
        }
        if (ok) {
            pass(`npm start 相当起動 + GET /health → 200 (port ${port})`);
        } else {
            fail(`/health 確認失敗: ${lastErr}`);
        }
    } finally {
        killChild();
    }
}

async function main() {
    console.log("=== CodeBridge freeze:check ===");
    console.log(`root: ${root}`);

    // 1) npm run check
    run("npm", ["run", "check"], "npm run check");

    // 2) npm run final:check（内部で check/build と重複し得るが提出前の再利用）
    run("npm", ["run", "final:check"], "npm run final:check");

    // 3) npm run build（明示再確認）
    run("npm", ["run", "build"], "npm run build（再確認）");

    // 4) 必須ファイル
    section("必須ファイル存在確認");
    for (const rel of REQUIRED_FILES) {
        if (existsRel(rel)) pass(rel);
        else fail(`必須ファイルがありません: ${rel}`);
    }

    // 5) version
    section("version 確認");
    try {
        const pkg = JSON.parse(readRel("package.json"));
        const fe = JSON.parse(readRel("frontend/package.json"));
        if (!pkg.version) fail("package.json に version がありません");
        else pass(`root version = ${pkg.version}`);
        if (fe.version !== pkg.version) {
            warn(`frontend version (${fe.version}) が root (${pkg.version}) と異なります`);
        } else {
            pass(`frontend version = ${fe.version}`);
        }
        if (!String(pkg.version).includes("rc") && pkg.version !== "0.9.0-rc.1") {
            // RC 推奨だが厳密失敗にはしない
            warn(`提出 RC 形式の確認: 現在 ${pkg.version}`);
        }
        const readme = readRel("README.md");
        if (!readme.includes(pkg.version)) {
            fail(`README に version ${pkg.version} の記載がありません`);
        } else {
            pass("README にバージョン記載あり");
        }
    } catch (err) {
        fail(`version 確認失敗: ${err.message}`);
    }

    // 6) サンプル 24 件（明示）
    section("サンプル 24 件確認");
    const samples = spawnSync("node", ["scripts/validate-samples.mjs"], {
        cwd: root,
        stdio: "inherit",
        shell: true,
    });
    if (samples.status !== 0) fail("サンプル検証失敗");
    else pass("サンプル検証 OK");

    // 7) CDN 設定なし
    section("CDN 設定検査");
    const cdn = spawnSync("node", ["test-monaco-offline.mjs"], {
        cwd: root,
        stdio: "inherit",
        shell: true,
    });
    if (cdn.status !== 0) fail("CDN / Monaco オフライン検査失敗");
    else pass("CDN 非依存 OK");

    // ソースに CDN loader paths がないこと（追加ガード）
    const setup = readRel("frontend/src/lib/monacoSetup.js");
    if (/cdn\.jsdelivr\.net|unpkg\.com/i.test(setup)) {
        fail("monacoSetup.js に CDN URL があります");
    } else {
        pass("monacoSetup.js に CDN URL なし");
    }

    // Express 起動 + /health
    section("npm start 相当 + /health");
    await verifyHealth();

    // 8–9) Feature Freeze checklist 集計
    section("Feature Freeze checklist 集計");
    const checklistPath = "docs/feature-freeze-checklist.md";
    if (!existsRel(checklistPath)) {
        fail(`${checklistPath} がありません`);
    } else {
        const items = parseChecklist(readRel(checklistPath));
        const checked = items.filter((i) => i.checked);
        const unchecked = items.filter((i) => !i.checked);
        manualChecks = unchecked.length;
        console.log(`チェック項目合計: ${items.length}`);
        console.log(`完了 [x]: ${checked.length}`);
        console.log(`未完了 [ ]: ${unchecked.length}`);
        if (items.length === 0) fail("チェック項目が1件もありません");
        else pass(`チェックリストを読み込みました（${items.length} 項目）`);

        console.log("\n--- 手動確認が残っている項目 ---");
        if (unchecked.length === 0) {
            console.log("（なし）");
        } else {
            for (const item of unchecked) {
                console.log(`- [ ] ${item.text}`);
                if (item.note) console.log(`      ${item.note}`);
            }
        }
        // 手動残りは Failed にしない
        if (unchecked.length > 0) {
            warn(`手動確認項目が ${unchecked.length} 件残っています（失敗にはしません）`);
        }
    }

    // 10) Git
    section("Git 変更・未追跡");
    const git = spawnSync("git", ["status", "--porcelain"], {
        cwd: root,
        encoding: "utf8",
        shell: true,
    });
    if (git.error || git.status !== 0) {
        warn("git status を取得できませんでした");
    } else {
        const lines = String(git.stdout ?? "")
            .split(/\r?\n/)
            .map((l) => l.trimEnd())
            .filter(Boolean);
        const untracked = lines.filter((l) => l.startsWith("??"));
        const modified = lines.filter((l) => !l.startsWith("??"));
        if (lines.length === 0) pass("作業ツリーはクリーンです");
        else {
            if (untracked.length > 0) {
                warn(`未追跡: ${untracked.length} 件`);
                for (const line of untracked.slice(0, 25)) console.warn(`  ${line}`);
            }
            if (modified.length > 0) {
                warn(`変更・ステージ: ${modified.length} 件`);
            }
        }
    }

    console.log("\n==============================");
    console.log(`freeze:check 結果`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Warnings: ${warnings}`);
    console.log(`  Manual checks: ${manualChecks}`);
    console.log("==============================\n");

    process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
