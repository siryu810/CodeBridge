// =========================================================
// CodeBridge 学習IDE — 実行サーバー
//
// 完全な C 実行環境ではなく、初心者向けに結果を分類して返す。
//
// status（返却の種類）:
//   success         … 正常終了
//   compile_error   … コンパイル失敗（日本語 errors 付き）
//   runtime_error   … 実行時エラー
//   input_required  … scanf があるのに stdin 未入力
//   internal_error  … サーバー側の想定外エラー
// =========================================================

const express = require("express");
const cors = require("cors");
const fsp = require("fs").promises;
const path = require("path");
const { execFile, spawn } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3000;
const RUN_WORKSPACE = path.join(__dirname, "run-workspace");

const GCC_CHECK_TIMEOUT_MS = 5_000;
const COMPILE_TIMEOUT_MS = 15_000;
const RUN_TIMEOUT_MS = 5_000;
const INPUT_WAIT_PROBE_MS = 800;

let gccAvailableCache = null;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------
// gcc 確認
// ---------------------------------------------------------

async function checkGccAvailable() {
    try {
        const result = await execFileAsync("gcc", ["--version"], {
            timeout: GCC_CHECK_TIMEOUT_MS,
            windowsHide: true,
            encoding: "utf8",
        });
        const firstLine = (result.stdout ?? "").split("\n")[0].trim();
        return { available: true, version: firstLine || "gcc" };
    } catch (error) {
        if (error.code === "ENOENT") {
            return { available: false, reason: "gcc コマンドが PATH 上に見つかりませんでした。" };
        }
        return { available: false, reason: String(error.message ?? error) };
    }
}

async function isGccReady() {
    if (gccAvailableCache === null) {
        gccAvailableCache = await checkGccAvailable();
    }
    return gccAvailableCache;
}

// ---------------------------------------------------------
// コマンド実行
// ---------------------------------------------------------

async function runCommand(command, args, cwd, timeoutMs) {
    try {
        const options = {
            cwd,
            timeout: timeoutMs,
            windowsHide: true,
            encoding: "utf8",
            maxBuffer: 1024 * 1024,
        };
        const result = await execFileAsync(command, args, options);
        return {
            ok: true,
            stdout: result.stdout ?? "",
            stderr: result.stderr ?? "",
            exitCode: 0,
        };
    } catch (error) {
        return {
            ok: false,
            stdout: error.stdout ?? "",
            stderr: error.stderr ?? String(error.message ?? error),
            exitCode: typeof error.code === "number" ? error.code : null,
            spawnError: error.code === "ENOENT" ? command : null,
        };
    }
}

/** 実行ファイルへ stdin を渡して起動（scanf 用） */
function normalizeStdinText(stdinText) {
    if (typeof stdinText !== "string" || stdinText.length === 0) {
        return "";
    }
    return stdinText.endsWith("\n") ? stdinText : stdinText + "\n";
}

function runProgramWithStdin(exePath, cwd, timeoutMs, stdinText, options = {}) {
    const leaveStdinOpen = options.leaveStdinOpen === true;

    return new Promise((resolve) => {
        const stdinPayload = normalizeStdinText(stdinText);
        const child = spawn(exePath, [], { cwd, windowsHide: true });

        let stdout = "";
        let stderr = "";
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill();
        }, timeoutMs);

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.stdin.on("error", (err) => {
            const msg = String(err.message ?? err);
            stderr = stderr ? `${stderr}\n${msg}` : msg;
        });

        if (stdinPayload.length > 0) {
            child.stdin.write(stdinPayload);
            child.stdin.end();
        } else if (!leaveStdinOpen) {
            child.stdin.end();
        }

        child.on("error", (err) => {
            clearTimeout(timer);
            resolve({
                ok: false,
                stdout,
                stderr: stderr || String(err.message ?? err),
                exitCode: null,
                spawnError: err.code === "ENOENT" ? exePath : null,
                timedOut: false,
                leaveStdinOpen,
            });
        });

        child.on("close", (code) => {
            clearTimeout(timer);
            resolve({
                ok: !timedOut && code === 0,
                stdout,
                stderr,
                exitCode: timedOut ? null : code,
                spawnError: null,
                timedOut,
                leaveStdinOpen,
            });
        });
    });
}

const INPUT_REQUIRED_MESSAGE =
    "このプログラムは入力を待っています。実行時入力欄に値を入れてから再度「実行」してください。";

function countScanfCalls(sourceCode) {
    return (sourceCode.match(/\bscanf\s*\(/g) || []).length;
}

function countNonEmptyStdinLines(stdin) {
    return String(stdin ?? "")
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0).length;
}

function buildInputRequiredMessage(scanfCount) {
    if (scanfCount > 0) {
        return `このプログラムは${scanfCount}個の入力を待っています。実行時入力欄に1行ずつ入力してください。`;
    }
    return INPUT_REQUIRED_MESSAGE;
}

function buildInputRequiredResponse(partialOutput, meta = {}) {
    const scanfCount = meta.scanfCount ?? countScanfCalls(meta.sourceCode ?? "");
    const messageJa = buildInputRequiredMessage(scanfCount);
    return buildResponse("input_required", {
        output: partialOutput,
        errors: [
            {
                line: null,
                messageJa,
                messageRaw: "",
            },
        ],
        ...meta,
        scanfCount,
    });
}

/** stdout に実行時入力をコンソール風（> 値）で差し込む */
function buildConsoleOutput(stdout, stdin, sourceCode, options = {}) {
    const { stdinWasProvided = false, isInputRequired = false } = options;
    const out = (stdout ?? "").replace(/\r\n/g, "\n").trimEnd();

    if (isInputRequired || !stdinWasProvided) {
        return out;
    }

    const stdinLines = (stdin ?? "").split(/\r?\n/).filter((line) => line.length > 0);
    const scanfCount = (sourceCode.match(/\bscanf\s*\(/g) || []).length;

    if (stdinLines.length === 0 || scanfCount === 0) {
        return out;
    }

    if (!out) {
        return stdinLines.map((line) => "> " + line).join("\n");
    }

    const lines = out.split("\n");
    const promptPattern = /(してください|を入力|入力して)/;
    const promptIndices = [];
    for (let i = 0; i < lines.length; i++) {
        if (promptPattern.test(lines[i])) {
            promptIndices.push(i + 1);
        }
    }

    const insertCount = Math.min(stdinLines.length, promptIndices.length, scanfCount);
    if (insertCount > 0) {
        const result = [...lines];
        for (let i = insertCount - 1; i >= 0; i--) {
            result.splice(promptIndices[i], 0, "> " + stdinLines[i]);
        }
        return result.join("\n");
    }

    return out + "\n> " + stdinLines.join("\n> ") + "\n";
}

function createRunId() {
    return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function cleanupWorkDir(workDir) {
    try {
        await fsp.rm(workDir, { recursive: true, force: true });
    } catch (err) {
        console.warn("作業フォルダ削除失敗:", workDir, err.message);
    }
}

function simplifyCompilerOutput(text, workDir) {
    if (!text) return "";
    let result = text;
    const normalizedDir = workDir.replace(/\\/g, "/");
    result = result.split(workDir).join(".");
    result = result.split(normalizedDir).join(".");
    return result.trim();
}

/** C コードに scanf があるか */
function codeNeedsStdin(sourceCode) {
    return /\bscanf\s*\(/.test(sourceCode);
}

// ---------------------------------------------------------
// コンパイルエラー → 初心者向け日本語
// ---------------------------------------------------------

const COMPILE_ERROR_RULES = [
    {
        pattern: /expected ';' before/i,
        messageJa: "文の最後に ; （セミコロン）が足りません。",
    },
    {
        pattern: /expected .* before/i,
        messageJa: "カッコや記号の対応が崩れています。( ) { } ; を確認してください。",
    },
    {
        pattern: /implicit declaration of function/i,
        messageJa: "必要な命令の準備が足りません。#include や命令名の綴りを確認してください。",
    },
    {
        pattern: /undefined reference to/i,
        messageJa: "使おうとした関数が見つかりません。準備（#include）や名前を確認してください。",
    },
    {
        pattern: /was not declared|undeclared/i,
        messageJa: "変数や命令が宣言より前に使われているか、名前の綴りが違います。",
    },
    {
        pattern: /incompatible types/i,
        messageJa: "型が合いません。整数と小数の使い分けを確認してください。",
    },
    {
        pattern: /format specifies type .* but the argument has type|expects.*argument|too many arguments|too few arguments/i,
        messageJa: "表示(変数) や 入力(変数) の変換に失敗している可能性があります。型の宣言を確認してください。",
    },
    {
        pattern: /passing argument .* makes pointer from integer/i,
        messageJa: "表示(変数) の変換に失敗している可能性があります。printf の書式（%d など）を確認してください。",
    },
    {
        pattern: /invalid suffix/i,
        messageJa: "数値の書き方に問題があります。",
    },
    {
        pattern: /error:/i,
        messageJa: "構文エラーがあります。エラー行の前後を確認してください。",
    },
];

function translateCompileErrors(rawText, workDir) {
    const simplified = simplifyCompilerOutput(rawText, workDir);
    const lines = simplified.split("\n");
    const errors = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !/error:/i.test(trimmed)) continue;

        let messageJa = "コードに問題があります。該当行を確認してください。";
        for (const rule of COMPILE_ERROR_RULES) {
            if (rule.pattern.test(trimmed)) {
                messageJa = rule.messageJa;
                break;
            }
        }

        const lineMatch = trimmed.match(/temp\.c:(\d+)/);
        errors.push({
            line: lineMatch ? Number(lineMatch[1]) : null,
            messageJa,
            messageRaw: trimmed,
        });
    }

    if (errors.length === 0 && simplified.trim()) {
        errors.push({
            line: null,
            messageJa: "コンパイルに失敗しました。",
            messageRaw: simplified,
        });
    }

    return errors;
}

function buildInternalErrorResponse(messageRaw, hints) {
    return buildResponse("internal_error", {
        errors: [
            {
                line: null,
                messageJa: "サーバー側で予期しないエラーが発生しました。しばらくしてから再度お試しください。",
                messageRaw: messageRaw ?? "",
            },
        ],
        hints: hints ?? ["ページを再読み込みしてください。", "問題が続く場合は管理者に連絡してください。"],
    });
}

function buildEmptyCodeResponse() {
    const messageJa = "実行するコードが空です。左のエディタにコードを書いてください。";
    return buildResponse("compile_error", {
        output: "",
        errors: [{ line: null, messageJa, messageRaw: "" }],
    });
}

function buildLearningHints(status, context) {
    if (status === "internal_error") {
        return context.hints ?? ["ページを再読み込みしてください。"];
    }
    if (status === "input_required") {
        return [
            "実行時入力欄に、scanf で読み込む値を入力してください。",
            "複数回入力する場合は、1行に1つずつ入力します。",
            "入力後にもう一度「実行」を押してください。",
        ];
    }
    if (status === "timeout") {
        return ["while や for の終了条件を見直してください。", "無限ループになっていないか確認してください。"];
    }
    if (status === "compile_error" && context.errors?.length) {
        return ["日本語エラー欄の行番号付近を重点的に読んでください。"];
    }
    return [];
}

function buildResponse(status, fields) {
    const output = fields.output ?? "";
    const stdin = fields.stdin ?? "";
    const stdinWasProvided = fields.stdinWasProvided === true;
    const sourceCode = fields.sourceCode ?? "";
    const errors = fields.errors ?? [];
    const consoleOutput =
        fields.consoleOutput ??
        buildConsoleOutput(output, stdin, sourceCode, {
            stdinWasProvided,
            isInputRequired: status === "input_required",
        });

    return {
        status,
        ok: status === "success" || status === "input_required",
        output,
        stdin: stdinWasProvided ? stdin : "",
        consoleOutput,
        exitCode: fields.exitCode ?? null,
        errors,
        japaneseErrors: errors,
        hints: fields.hints ?? buildLearningHints(status, fields),
        technical: fields.technical ?? undefined,
    };
}

// ---------------------------------------------------------
// 実行本体
// ---------------------------------------------------------

async function executeCCode(sourceCode, stdinText) {
    if (!sourceCode.trim()) {
        return buildEmptyCodeResponse();
    }

    const stdin = typeof stdinText === "string" ? stdinText : "";
    const scanfCount = countScanfCalls(sourceCode);
    const stdinLineCount = countNonEmptyStdinLines(stdin);
    const stdinWasProvided = stdinLineCount > 0;
    const needsStdin = scanfCount > 0;
    const runMeta = { sourceCode, stdin, stdinWasProvided, scanfCount };

    const gccStatus = await isGccReady();
    if (!gccStatus.available) {
        return buildResponse("compile_error", {
            errors: [
                {
                    line: null,
                    messageJa: "gccが見つかりません。導入後に実行できます。",
                    messageRaw: gccStatus.reason ?? "",
                },
            ],
            hints: [
                "Windows では MSYS2 等で gcc を導入し、PATH を通してください。",
                "変換・学習機能は gcc なしでも使えます。",
            ],
            ...runMeta,
        });
    }

    await fsp.mkdir(RUN_WORKSPACE, { recursive: true });
    const workDir = path.join(RUN_WORKSPACE, createRunId());
    await fsp.mkdir(workDir, { recursive: true });

    const tempCPath = path.join(workDir, "temp.c");
    const tempExePath = path.join(workDir, "temp.exe");

    try {
        await fsp.writeFile(tempCPath, sourceCode, "utf8");

        const compile = await runCommand(
            "gcc",
            ["temp.c", "-o", "temp.exe", "-std=gnu17", "-finput-charset=UTF-8"],
            workDir,
            COMPILE_TIMEOUT_MS
        );

        if (compile.spawnError === "gcc") {
            gccAvailableCache = { available: false, reason: "gcc が実行中に見つかりませんでした。" };
            return buildResponse("compile_error", {
                errors: [
                    {
                        line: null,
                        messageJa: "gccが見つかりません。導入後に実行できます。",
                        messageRaw: gccAvailableCache.reason,
                    },
                ],
                ...runMeta,
            });
        }

        if (!compile.ok) {
            const raw = compile.stderr || compile.stdout || "";
            const errors = translateCompileErrors(raw, workDir);
            return buildResponse("compile_error", {
                output: "",
                errors,
                technical: simplifyCompilerOutput(raw, workDir),
                ...runMeta,
            });
        }

        try {
            await fsp.access(tempExePath);
        } catch {
            const raw = compile.stderr || "temp.exe が作成されませんでした。";
            return buildResponse("compile_error", {
                errors: translateCompileErrors(raw, workDir),
                technical: simplifyCompilerOutput(raw, workDir),
                ...runMeta,
            });
        }

        if (needsStdin && stdinLineCount > 0 && stdinLineCount < scanfCount) {
            return buildInputRequiredResponse("", runMeta);
        }

        const run = await runProgramWithStdin(
            tempExePath,
            workDir,
            needsStdin && !stdinWasProvided ? INPUT_WAIT_PROBE_MS : RUN_TIMEOUT_MS,
            stdin,
            { leaveStdinOpen: needsStdin && !stdinWasProvided }
        );
        const stdout = (run.stdout ?? "").replace(/\r\n/g, "\n");
        const stderr = (run.stderr ?? "").replace(/\r\n/g, "\n");
        const exitCode = run.exitCode;

        if (needsStdin && !stdinWasProvided) {
            return buildInputRequiredResponse(stdout.trimEnd(), runMeta);
        }

        if (run.timedOut) {
            return buildResponse("timeout", {
                output: stdout.trimEnd(),
                exitCode,
                errors: [
                    {
                        line: null,
                        messageJa: "実行時間が長すぎます。無限ループの可能性があります。",
                        messageRaw: stderr,
                    },
                ],
                technical: stderr,
                ...runMeta,
            });
        }

        if (run.spawnError) {
            return buildResponse("runtime_error", {
                output: stdout.trimEnd(),
                exitCode,
                errors: [
                    {
                        line: null,
                        messageJa: "プログラムを起動できませんでした。",
                        messageRaw: stderr.trim() || run.spawnError,
                    },
                ],
                technical: stderr.trim() || undefined,
                ...runMeta,
            });
        }

        const stdoutEmpty = stdout.trim().length === 0;

        if (needsStdin && stdinWasProvided && stdoutEmpty && exitCode === 0) {
            return buildResponse("runtime_error", {
                output: "",
                exitCode,
                errors: [
                    {
                        line: null,
                        messageJa: "入力が渡されていない可能性があります。実行時入力欄の値を確認してください。",
                        messageRaw: stderr.trim() || "stdin provided but stdout empty",
                    },
                ],
                hints: [
                    "実行時入力欄に値を入れ、改行なしでもサーバー側で末尾に改行を付けて渡します。",
                    `終了コード: ${exitCode ?? "不明"}`,
                ],
                technical: stderr.trim() || undefined,
                ...runMeta,
            });
        }

        if (!run.ok && exitCode !== 0 && exitCode !== null) {
            return buildResponse("runtime_error", {
                output: stdout.trimEnd(),
                exitCode,
                errors: [
                    {
                        line: null,
                        messageJa: `プログラムが異常終了しました（終了コード ${exitCode}）。`,
                        messageRaw: stderr.trim() || `exit code ${exitCode}`,
                    },
                ],
                technical: stderr.trim() || undefined,
                ...runMeta,
            });
        }

        return buildResponse("success", {
            output: stdout.trimEnd(),
            exitCode,
            errors: stderr.trim()
                ? [
                      {
                          line: null,
                          messageJa: "実行は成功しましたが、補足メッセージがあります。",
                          messageRaw: stderr.trim(),
                      },
                  ]
                : [],
            technical: stderr.trim() || undefined,
            ...runMeta,
        });
    } finally {
        await cleanupWorkDir(workDir);
    }
}

// ---------------------------------------------------------
// API
// ---------------------------------------------------------

app.post("/run", async (req, res) => {
    const code = typeof req.body?.code === "string" ? req.body.code : "";
    const stdin = typeof req.body?.stdin === "string" ? req.body.stdin : "";

    console.log("[/run] code length:", code.length, "stdin:", JSON.stringify(stdin));

    if (!code.trim()) {
        return res.status(400).json(buildEmptyCodeResponse());
    }

    try {
        const result = await executeCCode(code, stdin);
        const httpStatus =
            result.status === "success" || result.status === "input_required"
                ? 200
                : result.status === "internal_error"
                  ? 500
                  : 400;
        res.status(httpStatus).json(result);
    } catch (error) {
        console.error("実行エラー:", error?.message ?? error);
        if (error?.stack) console.error(error.stack);
        res.status(500).json(buildInternalErrorResponse(String(error?.message ?? error)));
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// ---------------------------------------------------------
// 静的ファイル（React ビルド or レガシー HTML）
// ---------------------------------------------------------

const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");
const fs = require("fs");

if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get(/^\/(?!run|health).*/, (req, res) => {
        res.sendFile(path.join(FRONTEND_DIST, "index.html"));
    });
} else {
    app.use(express.static(__dirname));
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "top.html"));
    });
}

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`CodeBridge 学習IDE サーバー: http://localhost:${PORT}`);
        if (fs.existsSync(FRONTEND_DIST)) {
            console.log("  UI: React ビルド (frontend/dist)");
        } else {
            console.log("  UI: レガシー (top.html) — npm run build で React 版を有効化");
        }
        const gccStatus = await isGccReady();
        console.log(gccStatus.available ? `  gcc: ${gccStatus.version}` : "  gcc: 未検出");
    });
}

module.exports = {
    executeCCode,
    buildResponse,
    buildInternalErrorResponse,
    buildEmptyCodeResponse,
    isGccReady,
    checkGccAvailable,
};
