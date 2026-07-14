import { useState, useCallback, useEffect, useMemo } from "react";
import { evaluatePractice, getPracticeStdin } from "../lib/practice.js";
import {
    detectPracticeLanguage,
    getAnswerCodeForLanguage,
} from "../lib/practiceLanguage.js";
import { convertJapaneseSource, formatErrors } from "../lib/convert.js";
import { runCodeOnServer, parseRunResponse } from "../lib/runApi.js";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { comparePracticeCode } from "../lib/codeDiff.js";
import { CodeCompareModal } from "./CodeDiffViewer.jsx";
import { JapaneseEditor } from "./JapaneseEditor.jsx";

/** @typedef {"auto" | "japanese" | "c"} LanguageMode */

export function PracticePanel({ activeSample, embedded = false }) {
    const practice = activeSample?.practice;
    const { markPracticeAttempt } = useLearningProgress();
    const [practiceCode, setPracticeCode] = useState("");
    const [languageMode, setLanguageMode] = useState(/** @type {LanguageMode} */ ("auto"));
    /** auto 時の Monaco 言語。手動より弱いが、入力途中の頻繁な切替を防ぐ */
    const [stickyAutoLang, setStickyAutoLang] = useState(
        /** @type {"japanese"|"c"} */ ("japanese")
    );
    const [hintIndex, setHintIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [viewAnswerLang, setViewAnswerLang] = useState(/** @type {"japanese"|"c"|null} */ (null));
    const [practiceStdin, setPracticeStdin] = useState("");
    const [practiceOutput, setPracticeOutput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [attemptInfo, setAttemptInfo] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    useEffect(() => {
        setPracticeCode("");
        setLanguageMode("auto");
        setStickyAutoLang("japanese");
        setHintIndex(0);
        setShowExplanation(false);
        setShowAnswer(false);
        setViewAnswerLang(null);
        setPracticeStdin("");
        setPracticeOutput("");
        setFeedback(null);
        setAttemptInfo(null);
        setShowCompareModal(false);
    }, [activeSample?.id]);

    const detectedLanguage = useMemo(
        () => detectPracticeLanguage(practiceCode),
        [practiceCode]
    );

    // auto: 判定が明確なときだけ sticky を更新（unknown では切り替えない）
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

    const hints = practice?.hints ?? [];
    const visibleHints = hints.slice(0, hintIndex);
    const hasMoreHints = hintIndex < hints.length;

    const handleShowNextHint = useCallback(() => {
        setHintIndex((prev) => Math.min(prev + 1, hints.length));
    }, [hints.length]);

    const handleShowAnswer = useCallback(() => {
        const answer = getAnswerCodeForLanguage(activeSample, effectiveLanguage);
        setPracticeCode(answer);
        setShowAnswer(true);
        setViewAnswerLang(null);
    }, [activeSample, effectiveLanguage]);

    const handleViewLanguageAnswer = useCallback(
        (lang) => {
            const answer = getAnswerCodeForLanguage(activeSample, lang);
            setPracticeCode(answer);
            setLanguageMode(lang);
            setViewAnswerLang(lang);
            setShowAnswer(true);
        },
        [activeSample]
    );

    const handleRunPractice = useCallback(async () => {
        if (!practice) return;

        const code = practiceCode.trim();
        if (!code) {
            setFeedback({
                level: "run",
                message: "コードを書いてから実行してください。",
                language: effectiveLanguage,
            });
            return;
        }

        /** @type {"japanese"|"c"|"unknown"} */
        const lang =
            languageMode === "auto" ? detectPracticeLanguage(code) : languageMode;
        const resolvedLang = lang === "unknown" ? "japanese" : lang;

        let program = "";
        let conversion = null;

        if (resolvedLang === "c") {
            program = code;
            // 不完全な断片なら main で包む（int main が無い場合）
            if (!/\bint\s+main\s*\(/.test(program)) {
                program = `#include <stdio.h>\n#include <stdlib.h>\n#include <time.h>\n#include <string.h>\n\nint main(void) {\n    setbuf(stdout, NULL);\n\n${program}\n\n    return 0;\n}`;
            }
        } else {
            conversion = convertJapaneseSource(code);
            if ((conversion?.warnings?.length ?? 0) > 0) {
                setPracticeOutput("（変換の警告があります）");
                setFeedback({
                    level: "run",
                    message: conversion.warnings.map((w) => w.messageJa).join("\n"),
                    language: resolvedLang,
                });
                return;
            }
            program = conversion?.program?.trim() ?? "";
            if (!program) {
                setFeedback({
                    level: "run",
                    message: "C言語への変換に失敗しました。",
                    language: resolvedLang,
                });
                return;
            }
        }

        const stdin = practiceStdin.trim() || getPracticeStdin(activeSample);

        setIsRunning(true);
        setPracticeOutput("実行中...");
        setFeedback(null);
        setAttemptInfo(null);

        try {
            const data = await runCodeOnServer(program, stdin);
            const sourceLines = code.split(/\r?\n/);
            const parsed = parseRunResponse(
                data,
                conversion?.layout,
                sourceLines,
                formatErrors
            );

            setPracticeOutput(parsed.output || "（出力なし）");

            const evaluation = evaluatePractice({
                code,
                practice,
                language: resolvedLang,
                runResult: {
                    status: data?.status,
                    consoleOutput: parsed.output,
                    output: parsed.output,
                },
            });
            setFeedback(evaluation);

            if (activeSample?.id) {
                const cleared = evaluation.level === "success";
                const attempt = markPracticeAttempt(activeSample.id, cleared);
                setAttemptInfo(attempt);
            }
        } catch (err) {
            setPracticeOutput("（通信失敗）");
            setFeedback({
                level: "run",
                message: String(err?.message || err),
                language: resolvedLang,
            });
        } finally {
            setIsRunning(false);
        }
    }, [
        practice,
        practiceCode,
        practiceStdin,
        activeSample,
        markPracticeAttempt,
        languageMode,
        effectiveLanguage,
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

    const content = (
        <div className={`practice-panel${embedded ? " practice-panel--fill" : ""}`}>
            <section className="practice-section">
                <h4 className="practice-section-title">問題</h4>
                <p className="practice-prompt">{practice.prompt}</p>
            </section>

            <section className="practice-section">
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
                </div>
                {visibleHints.length > 0 && (
                    <ul className="practice-hints-list">
                        {visibleHints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="practice-section">
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
                    className="practice-code-editor"
                    showLineNumbers
                    fontSize={13}
                    value={practiceCode}
                    language={effectiveLanguage === "c" ? "c" : "japanese"}
                    path={`practice-${activeSample.id}.${
                        effectiveLanguage === "c" ? "c" : "cbjp"
                    }`}
                    onChange={(next) => {
                        setPracticeCode(next);
                        setShowAnswer(false);
                        setViewAnswerLang(null);
                    }}
                    placeholder={
                        effectiveLanguage === "c"
                            ? 'printf("こんにちは\\n");\n// C言語でも解答できます'
                            : '表示("こんにちは");\n// 日本語でも C 言語でも解答できます'
                    }
                />
            </section>

            {needsStdin && (
                <section className="practice-section">
                    <h4 className="practice-section-title">練習用の入力</h4>
                    <textarea
                        className="practice-stdin"
                        value={practiceStdin}
                        onChange={(e) => setPracticeStdin(e.target.value)}
                        placeholder={getPracticeStdin(activeSample) || "実行時に渡す入力"}
                        rows={3}
                        spellCheck={false}
                    />
                    <p className="practice-stdin-note">
                        空欄のときはサンプルの標準入力例を使います。
                    </p>
                </section>
            )}

            <section className="practice-section practice-actions">
                <button
                    type="button"
                    className="practice-btn practice-btn--run"
                    onClick={handleRunPractice}
                    disabled={isRunning}
                >
                    {isRunning ? "実行中..." : "▶ 実行して答え合わせ"}
                </button>
                <button type="button" className="practice-btn" onClick={handleShowAnswer}>
                    答えを見る
                </button>
                <button
                    type="button"
                    className="practice-btn"
                    onClick={() => setShowCompareModal(true)}
                >
                    模範解答と比較
                </button>
                <button
                    type="button"
                    className="practice-btn"
                    onClick={() => setShowExplanation((v) => !v)}
                >
                    {showExplanation ? "解説を閉じる" : "解説を見る"}
                </button>
            </section>

            {feedback && (
                <div
                    className={`practice-feedback practice-feedback--${feedback.level}`}
                    role="status"
                >
                    <p className="practice-feedback-message">{feedback.message}</p>
                    {feedback.level === "success" && (
                        <div className="practice-success-actions">
                            <button
                                type="button"
                                className="practice-btn"
                                onClick={() => handleViewLanguageAnswer("japanese")}
                            >
                                日本語版を見る
                            </button>
                            <button
                                type="button"
                                className="practice-btn"
                                onClick={() => handleViewLanguageAnswer("c")}
                            >
                                C言語版を見る
                            </button>
                            <button
                                type="button"
                                className="practice-btn"
                                onClick={() => setShowCompareModal(true)}
                            >
                                模範解答と比較
                            </button>
                        </div>
                    )}
                    {feedback.level !== "success" && (
                        <button
                            type="button"
                            className="practice-compare-cta"
                            onClick={() => setShowCompareModal(true)}
                        >
                            模範解答と比較して確認する
                        </button>
                    )}
                </div>
            )}

            {attemptInfo && (
                <section className="practice-section practice-attempt-result">
                    <h4 className="practice-section-title">練習の記録</h4>
                    <ul className="practice-attempt-list">
                        {attemptInfo.isFirstClear && (
                            <li className="practice-attempt-item practice-attempt-item--first">
                                初回クリア
                            </li>
                        )}
                        {attemptInfo.isRetry && (
                            <li className="practice-attempt-item">再挑戦 — クリア済み</li>
                        )}
                        {!attemptInfo.isFirstClear && !attemptInfo.isRetry && (
                            <li className="practice-attempt-item">挑戦中</li>
                        )}
                        <li className="practice-attempt-item">
                            挑戦回数: {attemptInfo.attempts}回
                        </li>
                    </ul>
                </section>
            )}

            {practiceOutput && (
                <section className="practice-section">
                    <h4 className="practice-section-title">実行結果</h4>
                    <pre className="practice-output">{practiceOutput}</pre>
                </section>
            )}

            {showAnswer && (
                <p className="practice-answer-note">
                    {viewAnswerLang === "c"
                        ? "C言語の模範解答を表示しました。"
                        : viewAnswerLang === "japanese"
                          ? "日本語の模範解答を表示しました。"
                          : "模範解答をコード欄に表示しました。"}
                    理解できたら自分の言葉で書き直してみましょう。
                </p>
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
