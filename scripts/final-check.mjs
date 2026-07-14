// CodeBridge 提出前最終チェック — node scripts/final-check.mjs
// npm run final:check

import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

let failed = 0;
let warnings = 0;

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
        fail(`${label} が失敗しました (exit ${result.status})`);
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

/** README が参照すべき docs */
const REQUIRED_DOC_LINKS = [
    "docs/demo.md",
    "docs/offline-test.md",
    "docs/final-demo-check.md",
    "docs/images/",
];

const REQUIRED_DOC_FILES = [
    "docs/demo.md",
    "docs/offline-test.md",
    "docs/final-demo-check.md",
    "docs/release-checklist.md",
    "docs/images/README.md",
    "docs/images/.gitkeep",
];

async function main() {
    console.log("=== CodeBridge final:check ===");
    console.log(`root: ${root}`);

    // 1) npm run check（test + syntax + build）
    if (!run("npm", ["run", "check"], "npm run check")) {
        // continue to report other issues, but already failed
    }

    // 2) 明示的に build（check 内でも実行するが、提出前に再確認）
    run("npm", ["run", "build"], "npm run build（再確認）");

    // 3) CDN 依存検査
    section("CDN 依存検査");
    const cdn = spawnSync("node", ["test-monaco-offline.mjs"], {
        cwd: root,
        stdio: "inherit",
        shell: true,
    });
    if (cdn.status !== 0) {
        fail("CDN / オフライン構成テストが失敗しました");
    } else {
        pass("CDN / オフライン構成 OK");
    }

    // 4) サンプル 24 件（validate-samples は check 内でも実行。明示再実行）
    section("サンプル 24 件検証");
    const samples = spawnSync("node", ["scripts/validate-samples.mjs"], {
        cwd: root,
        stdio: "inherit",
        shell: true,
    });
    if (samples.status !== 0) {
        fail("サンプル検証が失敗しました");
    } else {
        pass("サンプル検証 OK");
    }

    // 5) ロードマップ検証
    section("ロードマップ検証");
    const roadmap = spawnSync("node", ["test-roadmap.mjs"], {
        cwd: root,
        stdio: "inherit",
        shell: true,
    });
    if (roadmap.status !== 0) {
        fail("ロードマップ検証が失敗しました");
    } else {
        pass("ロードマップ検証 OK");
    }

    // 6) README リンク確認
    section("README リンク確認");
    if (!existsRel("README.md")) {
        fail("README.md がありません");
    } else {
        const readme = readRel("README.md");
        for (const link of REQUIRED_DOC_LINKS) {
            const linked =
                readme.includes(`](${link}`) ||
                readme.includes(`](./${link}`) ||
                readme.includes(link);
            if (!linked) {
                fail(`README に「${link}」への参照がありません`);
            } else if (link.endsWith("/")) {
                if (!existsRel(link.replace(/\/$/, "")) && !existsRel(link + ".gitkeep") && !existsRel("docs/images")) {
                    fail(`リンク先が存在しません: ${link}`);
                } else if (!existsRel("docs/images")) {
                    fail(`ディレクトリがありません: docs/images`);
                } else {
                    pass(`README → ${link}`);
                }
            } else if (!existsRel(link)) {
                fail(`リンク先ファイルがありません: ${link}`);
            } else {
                pass(`README → ${link}`);
            }
        }
    }

    // 7) docs ファイル存在確認
    section("docs ファイル存在確認");
    for (const rel of REQUIRED_DOC_FILES) {
        if (existsRel(rel)) {
            pass(rel);
        } else {
            fail(`必須ドキュメントがありません: ${rel}`);
        }
    }

    // 8) Git 未追跡ファイル（Warning）
    section("Git 未追跡ファイル");
    const git = spawnSync("git", ["status", "--porcelain"], {
        cwd: root,
        encoding: "utf8",
        shell: true,
    });
    if (git.error || git.status !== 0) {
        warn("git status を取得できませんでした（リポジトリ外の可能性）");
    } else {
        const lines = String(git.stdout ?? "")
            .split(/\r?\n/)
            .map((l) => l.trimEnd())
            .filter(Boolean);
        const untracked = lines.filter((l) => l.startsWith("??"));
        const modified = lines.filter((l) => !l.startsWith("??"));
        if (untracked.length === 0 && modified.length === 0) {
            pass("作業ツリーはクリーンです");
        } else {
            if (untracked.length > 0) {
                warn(`未追跡ファイルが ${untracked.length} 件あります（失敗にはしません）`);
                for (const line of untracked.slice(0, 30)) {
                    console.warn(`  ${line}`);
                }
                if (untracked.length > 30) {
                    console.warn(`  …他 ${untracked.length - 30} 件`);
                }
            }
            if (modified.length > 0) {
                warn(`変更・ステージあり: ${modified.length} 件（参考）`);
            }
        }
    }

    // バージョン表示
    section("バージョン");
    try {
        const pkg = JSON.parse(readRel("package.json"));
        pass(`package.json version = ${pkg.version}`);
    } catch {
        fail("package.json を読めません");
    }

    console.log("\n==============================");
    console.log(`final:check 結果 — Failed: ${failed} / Warnings: ${warnings}`);
    console.log("==============================\n");

    process.exit(failed > 0 ? 1 : 0);
}

main();
