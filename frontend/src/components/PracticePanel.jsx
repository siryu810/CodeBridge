import { useState, useCallback, useEffect } from "react";
import { evaluatePractice, getPracticeStdin } from "../lib/practice.js";
import { convertJapaneseSource, formatErrors } from "../lib/convert.js";
import { runCodeOnServer, parseRunResponse } from "../lib/runApi.js";
import { useLearningProgress } from "../hooks/useLearningProgress.js";
import { CodeCompareModal } from "./CodeDiffViewer.jsx";

export function PracticePanel({
    activeSample,
    embedded = false,
}) {
    const practice = activeSample?.practice;
    const { markPracticeAttempt } = useLearningProgress();
    const [practiceCode, setPracticeCode] = useState("");
    const [hintIndex, setHintIndex] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [practiceStdin, setPracticeStdin] = useState("");
    const [practiceOutput, setPracticeOutput] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [attemptInfo, setAttemptInfo] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);

    useEffect(() => {
        setPracticeCode("");
        setHintIndex(0);
        setShowExplanation(false);
        setShowAnswer(false);
        setPracticeStdin("");
        setPracticeOutput("");
        setFeedback(null);
        setAttemptInfo(null);
        setShowCompareModal(false);
    }, [activeSample?.id]);

    const hints = practice?.hints ?? [];
    const visibleHints = hints.slice(0, hintIndex);
    const hasMoreHints = hintIndex < hints.length;

    const handleShowNextHint = useCallback(() => {
        setHintIndex((prev) => Math.min(prev + 1, hints.length));
    }, [hints.length]);

    const handleShowAnswer = useCallback(() => {
        const answer = activeSample?.jpCode ?? "";
        setPracticeCode(answer);
        setShowAnswer(true);
    }, [activeSample?.jpCode]);

    const handleRunPractice = useCallback(async () => {
        if (!practice) return;

        const code = practiceCode.trim();
        if (!code) {
            setFeedback({
                level: "run",
                message: "コードを書いてから実行してください。",
            });
            return;
        }

        const conversion = convertJapaneseSource(code);
        if ((conversion?.warnings?.length ?? 0) > 0) {
            setPracticeOutput("（変換の警告があります）");
            setFeedback({
                level: "run",
                message: conversion.warnings.map((w) => w.messageJa).join("\n"),
            });
            return;
        }

        const program = conversion?.program?.trim() ?? "";
        if (!program) {
            setFeedback({ level: "run", message: "C言語への変換に失敗しました。" });
            return;
        }

        const stdin =
            practiceStdin.trim() || getPracticeStdin(activeSample);

        setIsRunning(true);
        setPracticeOutput("実行中...");
        setFeedback(null);
        setAttemptInfo(null);

        try {
            const data = await runCodeOnServer(program, stdin);
            const jpLines = code.split(/\r?\n/);
            const parsed = parseRunResponse(
                data,
                conversion?.layout,
                jpLines,
                formatErrors
            );

            setPracticeOutput(parsed.output || "（出力なし）");

            const evaluation = evaluatePractice({
                code,
                practice,
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
            });
        } finally {
            setIsRunning(false);
        }
    }, [practice, practiceCode, practiceStdin, activeSample, markPracticeAttempt]);

    if (!activeSample) {
        return (
            <p className="practice-empty">
                サンプルを選ぶと、練習問題に挑戦できます。
            </p>
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
                        ヒントを表示{hints.length > 0 ? ` (${hintIndex}/${hints.length})` : ""}
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
                <h4 className="practice-section-title">あなたのコード</h4>
                <textarea
                    className="practice-editor"
                    value={practiceCode}
                    onChange={(e) => {
                        setPracticeCode(e.target.value);
                        setShowAnswer(false);
                    }}
                    placeholder={'表示("こんにちは");\n// ここに日本語コードを書いてください'}
                    spellCheck={false}
                    rows={10}
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
                <button
                    type="button"
                    className="practice-btn"
                    onClick={handleShowAnswer}
                >
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
                    {feedback.message}
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
                    模範解答をコード欄に表示しました。理解できたら自分の言葉で書き直してみましょう。
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
                answerCode={activeSample?.jpCode ?? ""}
                sampleTitle={activeSample?.title}
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
