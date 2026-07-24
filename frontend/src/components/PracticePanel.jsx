import { useState, useCallback, useEffect, useMemo } from "react";
import {
    getPracticeStdin,
    resolvePracticeTestCases,
    gradePracticeSubmission,
    explainPracticeRunError,
} from "../lib/practice.js";
import {
    detectPracticeLanguage,
    getAnswerCodeForLanguage,
} from "../lib/practiceLanguage.js";
import { convertJapaneseSource, formatErrors } from "../lib/convert.js";
import { runCodeOnServer, parseRunResponse } from "../lib/runApi.js";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { comparePracticeCode } from "../lib/codeDiff.js";
import { recordReferenceViewed } from "../lib/progress.js";
import { CodeCompareModal } from "./CodeDiffViewer.jsx";
import { JapaneseEditor } from "./JapaneseEditor.jsx";
import { PracticeReferenceDrawer } from "./PracticeReferenceDrawer.jsx";

/** @typedef {"auto" | "japanese" | "c"} LanguageMode */
/** @typedef {"guided" | "blind"} PracticeVisibilityMode */
/** @typedef {"side" | "focus"} PracticeLayout */

function wrapCFragment(program) {
    if (/\bint\s+main\s*\(/.test(program)) return program;
    return `#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n#include <string.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n${program}\n\n    return 0;\n}`;
}

/**
 * @returns {{ ok: true, program: string, layout: object|null, language: string } | { ok: false, feedback: object, language: string }}
 */
function prepareRunnableProgram(code, languageMode) {
    /** @type {"japanese"|"c"|"unknown"} */
    const lang =
        languageMode === "auto" ? detectPracticeLanguage(code) : languageMode;
    const resolvedLang = lang === "unknown" ? "japanese" : lang;

    if (resolvedLang === "c") {
        return {
            ok: true,
            program: wrapCFragment(code),
            layout: null,
            language: resolvedLang,
        };
    }

    const conversion = convertJapaneseSource(code);
    if ((conversion?.warnings?.length ?? 0) > 0) {
        return {
            ok: false,
            feedback: {
                level: "run",
                message: conversion.warnings.map((w) => w.messageJa).join("\n"),
                language: resolvedLang,
            },
            language: resolvedLang,
        };
    }
    const program = conversion?.program?.trim() ?? "";
    if (!program) {
        return {
            ok: false,
            feedback: {
                level: "run",
                message: "C言語への変換に失敗しました。コードを見直してください。",
                language: resolvedLang,
            },
            language: resolvedLang,
        };
    }
    return {
        ok: true,
        program,
        layout: conversion?.layout ?? null,
        language: resolvedLang,
    };
}

/**
 * @param {object} props
 * @param {object} [props.activeSample]
 * @param {boolean} [props.embedded]
 * @param {PracticeLayout} [props.layout]
 * @param {(mode: PracticeVisibilityMode) => void} [props.onVisibilityModeChange]
 */
export function PracticePanel({
    activeSample,
    embedded = false,
    layout = "side",
    onVisibilityModeChange,
}) {
    const practice = activeSample?.practice;
    const { markPracticeAttempt } = useLearningProgress();
    const [practiceCode, setPracticeCode] = useState("");
    const [languageMode, setLanguageMode] = useState(/** @type {LanguageMode} */ ("auto"));
    const [stickyAutoLang, setStickyAutoLang] = useState(
        /** @type {"japanese"|"c"} */ ("japanese")
    );
    const [hintIndex, setHintIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [visibilityMode, setVisibilityMode] = useState(
        /** @type {PracticeVisibilityMode} */ ("guided")
    );
    const [showReference, setShowReference] = useState(false);
    const [referenceLang, setReferenceLang] = useState(/** @type {"japanese"|"c"} */ ("japanese"));
    const [practiceStdin, setPracticeStdin] = useState("");
    const [practiceOutput, setPracticeOutput] = useState("");
    const [runFeedback, setRunFeedback] = useState(null);
    const [gradeResult, setGradeResult] = useState(null);
    const [attemptInfo, setAttemptInfo] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    useEffect(() => {
        setPracticeCode("");
        setLanguageMode("auto");
        setStickyAutoLang("japanese");
        setHintIndex(0);
        setShowExplanation(false);
        setVisibilityMode("guided");
        setShowReference(false);
        setReferenceLang("japanese");
        setPracticeStdin("");
        setPracticeOutput("");
        setRunFeedback(null);
        setGradeResult(null);
        setAttemptInfo(null);
        setShowCompareModal(false);
        onVisibilityModeChange?.("guided");
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 問題切替時のみ初期化
    }, [activeSample?.id]);

    const detectedLanguage = useMemo(
        () => detectPracticeLanguage(practiceCode),
        [practiceCode]
    );

    useEffect(() => {
        if (languageMode !== "auto") return;
        if (detectedLanguage === "japanese" || detectedLanguage === "c") {
            setStickyAutoLang(detectedLanguage);
        }
    }, [detectedLanguage, languageMode]);

    const effectiveLanguage = useMemo(() => {
        if (languageMode === "japanese" || languageMode === "c") {
            return languageMode;
        }
        return stickyAutoLang;
    }, [languageMode, stickyAutoLang]);

    const testCases = useMemo(
        () => (activeSample ? resolvePracticeTestCases(activeSample) : []),
        [activeSample]
    );

    const hints = practice?.hints ?? [];
    const visibleHints = hints.slice(0, hintIndex);
    const hasMoreHints = hintIndex < hints.length;

    const referenceCode = useMemo(() => {
        if (!activeSample) return "";
        return getAnswerCodeForLanguage(activeSample, referenceLang);
    }, [activeSample, referenceLang]);

    const handleShowNextHint = useCallback(() => {
        setHintIndex((prev) => Math.min(prev + 1, hints.length));
    }, [hints.length]);

    const handleVisibilityModeChange = useCallback(
        (mode) => {
            setVisibilityMode(mode);
            if (mode === "guided") {
                setShowReference(false);
            }
            onVisibilityModeChange?.(mode);
        },
        [onVisibilityModeChange]
    );

    const handleOpenReference = useCallback(() => {
        setShowReference(true);
        if (activeSample?.id) {
            recordReferenceViewed(activeSample.id);
        }
    }, [activeSample?.id]);

    const handleCloseReference = useCallback(() => {
        setShowReference(false);
    }, []);

    const handleRunPractice = useCallback(async () => {
        if (!practice) return;

        const code = practiceCode.trim();
        if (!code) {
            setRunFeedback({
                level: "run",
                message: "コードを書いてから実行してください。",
                language: effectiveLanguage,
            });
            return;
        }

        const prepared = prepareRunnableProgram(code, languageMode);
        if (!prepared.ok) {
            setPracticeOutput("（変換の警告があります）");
            setRunFeedback(prepared.feedback);
            return;
        }

        const stdin = practiceStdin.trim() || getPracticeStdin(activeSample);

        setIsRunning(true);
        setPracticeOutput("実行中...");
        setRunFeedback(null);

        try {
            const data = await runCodeOnServer(prepared.program, stdin);
            const sourceLines = code.split(/\r?\n/);
            const parsed = parseRunResponse(
                data,
                prepared.layout,
                sourceLines,
                formatErrors
            );

            const status = data?.status;
            if (status === "success") {
                setPracticeOutput(parsed.output || "（出力なし）");
                setRunFeedback({
                    level: "success",
                    message:
                        "実行できました。出力を確認したら「提出して採点」できます。実行は何回でもできます。",
                    language: prepared.language,
                });
            } else {
                const explanation = explainPracticeRunError(
                    status,
                    prepared.language,
                    data?.errors
                );
                setPracticeOutput(
                    [parsed.output, parsed.errorText].filter(Boolean).join("\n\n") ||
                        explanation
                );
                setRunFeedback({
                    level: "run",
                    message: explanation,
                    language: prepared.language,
                });
            }
        } catch (err) {
            setPracticeOutput("（通信失敗）");
            setRunFeedback({
                level: "run",
                message: String(err?.message || err),
                language: prepared.language,
            });
        } finally {
            setIsRunning(false);
        }
    }, [
        practice,
        practiceCode,
        practiceStdin,
        activeSample,
        languageMode,
        effectiveLanguage,
    ]);

    const handleSubmitPractice = useCallback(async () => {
        if (!practice || !activeSample) return;

        const code = practiceCode.trim();
        if (!code) {
            setGradeResult(null);
            setRunFeedback({
                level: "run",
                message: "コードを書いてから提出してください。",
                language: effectiveLanguage,
            });
            return;
        }

        const prepared = prepareRunnableProgram(code, languageMode);
        if (!prepared.ok) {
            setRunFeedback(prepared.feedback);
            setGradeResult(null);
            return;
        }

        const cases = resolvePracticeTestCases(activeSample);
        setIsSubmitting(true);
        setPracticeOutput("提出採点中...");
        setRunFeedback(null);

        try {
            /** @type {Array<object>} */
            const caseResults = [];
            const outputLines = [];

            for (const testCase of cases) {
                const data = await runCodeOnServer(prepared.program, testCase.stdin);
                const parsed = parseRunResponse(
                    data,
                    prepared.layout,
                    code.split(/\r?\n/),
                    formatErrors
                );
                const status = data?.status;
                const output =
                    status === "success"
                        ? parsed.output
                        : [parsed.output, parsed.errorText].filter(Boolean).join("\n");

                caseResults.push({
                    testCase,
                    status,
                    output: parsed.output,
                    errors: data?.errors,
                });

                const mark = status === "success" ? "…" : "✗";
                outputLines.push(
                    `[${mark}] ${testCase.label}\n入力: ${JSON.stringify(testCase.stdin)}\n${output || "（出力なし）"}`
                );
            }

            const grade = gradePracticeSubmission({
                code,
                sample: activeSample,
                practice,
                language: prepared.language,
                caseResults,
            });

            setGradeResult(grade);
            setPracticeOutput(outputLines.join("\n\n---\n\n"));
            setRunFeedback({
                level: grade.level,
                message: grade.summaryMessage,
                language: prepared.language,
                alternateStyle: grade.alternateStyle,
            });

            if (activeSample.id) {
                const attempt = markPracticeAttempt(
                    activeSample.id,
                    grade.cleared,
                    grade.score
                );
                setAttemptInfo(attempt);
            }
        } catch (err) {
            setPracticeOutput("（通信失敗）");
            setRunFeedback({
                level: "run",
                message: String(err?.message || err),
                language: prepared.language,
            });
            setGradeResult(null);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        practice,
        practiceCode,
        activeSample,
        languageMode,
        effectiveLanguage,
        markPracticeAttempt,
    ]);

    const compareResult = useMemo(() => {
        if (!activeSample) return null;
        return comparePracticeCode(practiceCode, activeSample, effectiveLanguage);
    }, [practiceCode, activeSample, effectiveLanguage]);

    if (!activeSample) {
        return (
            <p className="practice-empty">サンプルを選ぶと、練習問題に挑戦できます。</p>
        );
    }

    if (!practice) {
        return (
            <p className="practice-empty">このサンプルには練習がまだありません。</p>
        );
    }

    const needsStdin = (activeSample.stdinExamples ?? []).some(
        (e) => e.expectStatus === "success" && String(e.stdin ?? "").trim().length > 0
    );

    const languageLabel =
        languageMode === "auto"
            ? detectedLanguage === "c"
                ? "自動（C言語）"
                : detectedLanguage === "japanese"
                  ? "自動（日本語）"
                  : "自動判定"
            : languageMode === "c"
              ? "C言語"
              : "日本語";

    const busy = isRunning || isSubmitting;
    const isBlind = visibilityMode === "blind";
    const isFocus = layout === "focus";

    const modeSwitch = (
        <section className={`practice-section practice-visibility${isFocus ? " practice-visibility--compact" : ""}`}>
            <div className="practice-visibility-switch" role="group" aria-label="練習の見え方">
                <button
                    type="button"
                    className={`practice-visibility-btn${
                        visibilityMode === "guided" ? " is-active" : ""
                    }`}
                    onClick={() => handleVisibilityModeChange("guided")}
                >
                    見ながら練習
                </button>
                <button
                    type="button"
                    className={`practice-visibility-btn${
                        visibilityMode === "blind" ? " is-active" : ""
                    }`}
                    onClick={() => handleVisibilityModeChange("blind")}
                >
                    見ないで挑戦
                </button>
            </div>
            {!isFocus && (
                <p className="practice-visibility-note">
                    {visibilityMode === "guided"
                        ? "左のサンプルコードと変換結果を見ながら理解できます。"
                        : "練習画面を大きく使い、自分の力で解きます。必要なら参考コードをドロワーで確認できます。"}
                </p>
            )}
        </section>
    );

    const problemBlock = (
        <section className="practice-section practice-problem">
            <h4 className="practice-section-title">問題</h4>
            <p className="practice-prompt">{practice.prompt}</p>
            <p className="practice-score-note">
                採点はテストケース方式です。書き方が違っても、正しく動けば満点になります。
                （テストケース {testCases.length} 件）
            </p>
        </section>
    );

    const hintsBlock = (
        <section className="practice-section practice-hints">
            <div className="practice-actions-row">
                <button
                    type="button"
                    className="practice-btn practice-btn--hint"
                    onClick={handleShowNextHint}
                    disabled={!hasMoreHints}
                >
                    ヒントを表示
                    {hints.length > 0 ? ` (${hintIndex}/${hints.length})` : ""}
                </button>
                {isBlind && (
                    <button
                        type="button"
                        className={`practice-btn${showReference ? " is-active" : ""}`}
                        onClick={showReference ? handleCloseReference : handleOpenReference}
                        disabled={busy}
                    >
                        {showReference ? "参考コードを隠す" : "参考コードを見る"}
                    </button>
                )}
            </div>
            {visibleHints.length > 0 && (
                <ul className="practice-hints-list">
                    {visibleHints.map((hint, i) => (
                        <li key={i}>{hint}</li>
                    ))}
                </ul>
            )}
        </section>
    );

    const editorBlock = (
        <section className={`practice-section practice-answer-section${isFocus ? " practice-answer-section--grow" : ""}`}>
            <div className="practice-lang-row">
                <h4 className="practice-section-title">あなたのコード</h4>
                <div className="practice-lang-switch" role="group" aria-label="回答言語">
                    <button
                        type="button"
                        className={`practice-lang-btn${languageMode === "auto" ? " is-active" : ""}`}
                        onClick={() => setLanguageMode("auto")}
                    >
                        自動
                    </button>
                    <button
                        type="button"
                        className={`practice-lang-btn${languageMode === "japanese" ? " is-active" : ""}`}
                        onClick={() => setLanguageMode("japanese")}
                    >
                        日本語コード
                    </button>
                    <button
                        type="button"
                        className={`practice-lang-btn${languageMode === "c" ? " is-active" : ""}`}
                        onClick={() => setLanguageMode("c")}
                    >
                        C言語コード
                    </button>
                </div>
            </div>
            <p className="practice-lang-note">
                判定: {languageLabel}
                {languageMode === "auto" ? "（自動は明確に判定できたときだけ切替）" : ""}
            </p>
            <JapaneseEditor
                className={`practice-code-editor${isFocus ? " practice-code-editor--focus" : ""}`}
                showLineNumbers
                fontSize={isFocus ? 14 : 13}
                value={practiceCode}
                language={effectiveLanguage === "c" ? "c" : "japanese"}
                path={`practice-${activeSample.id}.${
                    effectiveLanguage === "c" ? "c" : "cbjp"
                }`}
                onChange={(next) => {
                    setPracticeCode(next);
                }}
                placeholder={
                    effectiveLanguage === "c"
                        ? 'printf("こんにちは\\n");\n// C言語でも解答できます'
                        : '表示("こんにちは");\n// 日本語でも C 言語でも解答できます'
                }
            />
        </section>
    );

    const actionsBlock = (
        <section className="practice-section practice-actions">
            <button
                type="button"
                className="practice-btn practice-btn--run"
                onClick={handleRunPractice}
                disabled={busy}
            >
                {isRunning ? "実行中..." : "▶ 実行"}
            </button>
            <button
                type="button"
                className="practice-btn practice-btn--submit"
                onClick={handleSubmitPractice}
                disabled={busy}
            >
                {isSubmitting ? "採点中..." : "提出して採点"}
            </button>
            <button
                type="button"
                className="practice-btn"
                onClick={() => setShowCompareModal(true)}
                disabled={busy}
            >
                参考コードとの違い
            </button>
            <button
                type="button"
                className="practice-btn"
                onClick={() => setShowExplanation((v) => !v)}
                disabled={busy}
            >
                {showExplanation ? "解説を閉じる" : "解説を見る"}
            </button>
        </section>
    );

    const stdinBlock = needsStdin ? (
        <section className="practice-section">
            <h4 className="practice-section-title">練習用の入力（実行用）</h4>
            <textarea
                className="practice-stdin"
                value={practiceStdin}
                onChange={(e) => setPracticeStdin(e.target.value)}
                placeholder={getPracticeStdin(activeSample) || "実行時に渡す入力"}
                rows={isFocus ? 2 : 3}
                spellCheck={false}
            />
            <p className="practice-stdin-note">
                「実行」ではこの入力を使います。「提出」では用意されたテストケースを使います。
                {isFocus ? "（IDE下部パネルとは別の練習用入力です）" : ""}
            </p>
        </section>
    ) : null;

    const resultsBlock = (
        <>
            {gradeResult && (
                <section className="practice-section practice-grade-result" aria-live="polite">
                    <h4 className="practice-section-title">採点結果</h4>
                    <p className="practice-grade-score">{gradeResult.score}点</p>
                    <p className="practice-grade-cases">
                        テストケース {gradeResult.passedCount} / {gradeResult.totalCount} Passed
                    </p>
                    <ul className="practice-grade-checks">
                        <li>コンパイル {gradeResult.compileOk ? "✅" : "❌"}</li>
                        <li>実行 {gradeResult.runOk ? "✅" : "❌"}</li>
                        <li>期待出力 {gradeResult.outputOk ? "✅" : "❌"}</li>
                        <li>
                            必須要件 {gradeResult.requirementsOk ? "✅" : "❌"}
                            {!gradeResult.requirementsOk &&
                                gradeResult.missingCommands?.length > 0 && (
                                    <span className="practice-grade-missing">
                                        （不足: {gradeResult.missingCommands.join(", ")}）
                                    </span>
                                )}
                        </li>
                    </ul>
                    {gradeResult.cases?.length > 0 && (
                        <ul className="practice-grade-case-list">
                            {gradeResult.cases.map((c) => (
                                <li
                                    key={c.id}
                                    className={
                                        c.passed
                                            ? "practice-grade-case practice-grade-case--pass"
                                            : "practice-grade-case practice-grade-case--fail"
                                    }
                                >
                                    {c.passed ? "✅" : "❌"} {c.label}
                                    {!c.passed && c.message ? ` — ${c.message}` : ""}
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="practice-grade-summary">{gradeResult.summaryMessage}</p>
                    <div className="practice-success-actions">
                        <button
                            type="button"
                            className="practice-btn"
                            onClick={() => setShowCompareModal(true)}
                        >
                            参考コードとの違いを見る
                        </button>
                    </div>
                </section>
            )}

            {runFeedback && !gradeResult && (
                <div
                    className={`practice-feedback practice-feedback--${runFeedback.level}`}
                    role="status"
                >
                    <p className="practice-feedback-message">{runFeedback.message}</p>
                </div>
            )}

            {attemptInfo && (
                <section className="practice-section practice-attempt-result">
                    <h4 className="practice-section-title">練習の記録</h4>
                    <ul className="practice-attempt-list">
                        {attemptInfo.isFirstClear && (
                            <li className="practice-attempt-item practice-attempt-item--first">
                                初回クリア（100点）
                            </li>
                        )}
                        {attemptInfo.isRetry && (
                            <li className="practice-attempt-item">再提出 — クリア済み</li>
                        )}
                        {!attemptInfo.isFirstClear && !attemptInfo.isRetry && (
                            <li className="practice-attempt-item">挑戦中</li>
                        )}
                        <li className="practice-attempt-item">
                            提出回数: {attemptInfo.attempts}回
                        </li>
                        {attemptInfo.bestScore != null && (
                            <li className="practice-attempt-item">
                                最高得点: {attemptInfo.bestScore}点
                            </li>
                        )}
                    </ul>
                </section>
            )}

            {practiceOutput && (
                <section className="practice-section">
                    <h4 className="practice-section-title">
                        {gradeResult ? "提出時の実行ログ" : "実行結果"}
                    </h4>
                    <pre className="practice-output">{practiceOutput}</pre>
                </section>
            )}

            {showExplanation && (
                <section className="practice-section practice-explanation">
                    <h4 className="practice-section-title">解説</h4>
                    {activeSample.learningGoals?.length > 0 && (
                        <>
                            <p className="practice-explanation-label">学習目標</p>
                            <ul className="practice-explanation-list">
                                {activeSample.learningGoals.map((goal, i) => (
                                    <li key={i}>{goal}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    {activeSample.algorithmSteps?.length > 0 && (
                        <>
                            <p className="practice-explanation-label">アルゴリズムの流れ</p>
                            <ol className="practice-explanation-list">
                                {activeSample.algorithmSteps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                ))}
                            </ol>
                        </>
                    )}
                </section>
            )}
        </>
    );

    const compareModal = (
        <CodeCompareModal
            open={showCompareModal}
            onClose={() => setShowCompareModal(false)}
            userCode={practiceCode}
            answerCode={compareResult?.answerCode ?? activeSample?.jpCode ?? ""}
            sampleTitle={`${activeSample?.title ?? ""}${
                effectiveLanguage === "c" ? "（C言語）" : "（日本語）"
            }`}
            language={effectiveLanguage}
        />
    );

    const referenceDrawer = isBlind ? (
        <PracticeReferenceDrawer
            open={showReference}
            onClose={handleCloseReference}
            code={referenceCode}
            language={referenceLang}
            onLanguageChange={setReferenceLang}
        />
    ) : null;

    const content = isFocus ? (
        <div className="practice-panel practice-panel--fill practice-panel--focus">
            <div className="practice-focus-top">
                {modeSwitch}
                {problemBlock}
                {hintsBlock}
            </div>
            <div className="practice-focus-main">{editorBlock}</div>
            <div className="practice-focus-bottom">
                {stdinBlock}
                {actionsBlock}
                <div className="practice-focus-results">{resultsBlock}</div>
            </div>
            {referenceDrawer}
            {compareModal}
        </div>
    ) : (
        <div
            className={`practice-panel${embedded ? " practice-panel--fill" : ""}${
                isBlind ? " practice-panel--blind" : ""
            }`}
        >
            {modeSwitch}
            {problemBlock}
            {hintsBlock}
            {editorBlock}
            {stdinBlock}
            {actionsBlock}
            {resultsBlock}
            {referenceDrawer}
            {compareModal}
        </div>
    );

    if (embedded) return content;

    return (
        <section className="panel">
            <div className="panel-header">練習モード</div>
            {content}
        </section>
    );
}
