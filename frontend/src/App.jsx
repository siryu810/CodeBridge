import { useState, useCallback, useEffect } from "react";

import CodeBridgeJp2c from "@shared/jp2c.js";

import { EntryHomeView } from "./components/EntryHomeView.jsx";
import { LearnHomeView } from "./components/LearnHomeView.jsx";
import { LearnRoadmapPage } from "./components/LearnRoadmapPage.jsx";
import { LearnSamplesPage } from "./components/LearnSamplesPage.jsx";
import { LearnProgressPage } from "./components/LearnProgressPage.jsx";
import { SettingsView } from "./components/SettingsView.jsx";
import { EditorView } from "./components/EditorView.jsx";
import { ServerStatusBanner } from "./components/ServerStatusBanner.jsx";
import { useServerHealth } from "./hooks/useServerHealth.js";
import { addToRecent } from "./lib/recent.js";
import { recordSamplePlayed } from "./lib/progress.js";
import { NEW_PROJECT_JP_CODE, NEW_PROJECT_C_CODE } from "./data/samples.js";

/** @typedef {"entry" | "learn" | "learn-roadmap" | "learn-samples" | "learn-progress" | "settings" | "editor"} AppView */

const VALID_VIEWS = new Set([
    "entry",
    "learn",
    "learn-roadmap",
    "learn-samples",
    "learn-progress",
    "settings",
    "editor",
]);

const LEARN_VIEWS = new Set(["learn", "learn-roadmap", "learn-samples", "learn-progress"]);

function isLearnView(view) {
    return LEARN_VIEWS.has(view);
}

function readViewFromUrl() {
    try {
        const raw = new URLSearchParams(window.location.search).get("view");
        if (raw && VALID_VIEWS.has(raw)) return /** @type {AppView} */ (raw);
    } catch {
        /* ignore */
    }
    return "entry";
}

function writeViewToUrl(view, { replace = false } = {}) {
    try {
        const url = new URL(window.location.href);
        url.searchParams.set("view", view);
        const next = `${url.pathname}${url.search}${url.hash}`;
        if (replace) {
            window.history.replaceState({ view }, "", next);
        } else {
            window.history.pushState({ view }, "", next);
        }
    } catch {
        /* ignore */
    }
}

export default function App() {
    const [view, setViewState] = useState(/** @type {AppView} */ (() => readViewFromUrl()));
    const [editorReturnView, setEditorReturnView] = useState(
        /** @type {AppView} */ ("entry")
    );
    const [jpCode, setJpCode] = useState("");
    const [cCode, setCCode] = useState("");
    const [projectTitle, setProjectTitle] = useState("");
    const [sampleId, setSampleId] = useState(null);
    const [isNewProject, setIsNewProject] = useState(false);
    const [editorSessionId, setEditorSessionId] = useState(0);
    const { connected, checked } = useServerHealth();

    const setView = useCallback((next, { replace = false } = {}) => {
        setViewState(next);
        writeViewToUrl(next, { replace });
    }, []);

    useEffect(() => {
        writeViewToUrl(readViewFromUrl(), { replace: true });
    }, []);

    useEffect(() => {
        const onPopState = (event) => {
            const fromState = event.state?.view;
            const next =
                fromState && VALID_VIEWS.has(fromState)
                    ? fromState
                    : readViewFromUrl();
            setViewState(next);
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    const handleGoLearn = useCallback(() => {
        setView("learn");
    }, [setView]);

    const handleBackEntry = useCallback(() => {
        setView("entry");
    }, [setView]);

    const handleGoSettings = useCallback(() => {
        setView("settings");
    }, [setView]);

    const handleNavigateLearn = useCallback(
        (next) => {
            if (LEARN_VIEWS.has(next)) setView(next);
        },
        [setView]
    );

    const handleOpenSample = useCallback(
        (sample, returnView = "learn") => {
            if (!sample) return;
            setJpCode(sample.jpCode ?? "");
            setCCode(sample.cCode ?? "");
            setProjectTitle(sample.title ?? "");
            setSampleId(sample.id ?? null);
            setIsNewProject(false);
            setEditorSessionId((n) => n + 1);
            recordSamplePlayed(sample.id ?? null);
            addToRecent(sample.title, sample.jpCode ?? "");
            setEditorReturnView(
                isLearnView(returnView) || returnView === "entry" ? returnView : "learn"
            );
            setView("editor");
        },
        [setView]
    );

    const handleNewProject = useCallback(
        (from = "entry") => {
            setJpCode(NEW_PROJECT_JP_CODE);
            setCCode(NEW_PROJECT_C_CODE);
            setProjectTitle("新規プロジェクト");
            setSampleId(null);
            setIsNewProject(true);
            setEditorSessionId((n) => n + 1);
            addToRecent("新規プロジェクト", NEW_PROJECT_JP_CODE);
            setEditorReturnView(from === "entry" ? "entry" : "learn");
            setView("editor");
        },
        [setView]
    );

    const handleOpenRecent = useCallback(
        (recentJpCode, title, from = "entry") => {
            const converted = CodeBridgeJp2c.convertJapaneseToC(recentJpCode ?? "");
            setJpCode(recentJpCode ?? "");
            setCCode(converted.program || NEW_PROJECT_C_CODE);
            setProjectTitle(title ?? "");
            setSampleId(null);
            setIsNewProject(false);
            setEditorSessionId((n) => n + 1);
            setEditorReturnView(from === "entry" ? "entry" : "learn");
            setView("editor");
        },
        [setView]
    );

    const handleBackHome = useCallback(() => {
        const target =
            editorReturnView &&
            VALID_VIEWS.has(editorReturnView) &&
            editorReturnView !== "editor"
                ? editorReturnView
                : "entry";
        setView(target);
    }, [editorReturnView, setView]);

    const openSampleFrom = (returnView) => (sample) => handleOpenSample(sample, returnView);

    const rootClass =
        view === "editor"
            ? "app-root app-root--ide"
            : view === "entry"
              ? "app-root app-root--entry"
              : "app-root app-root--home";

    const showLearnChrome = isLearnView(view) || view === "settings";

    return (
        <div className={rootClass}>
            {view === "entry" && (
                <>
                    <div className="entry-home-banner-wrap">
                        <ServerStatusBanner connected={connected} checked={checked} />
                    </div>
                    <EntryHomeView
                        onNewProject={() => handleNewProject("entry")}
                        onGoLearn={handleGoLearn}
                        onGoSettings={handleGoSettings}
                        onOpenRecent={(code, title) => handleOpenRecent(code, title, "entry")}
                    />
                </>
            )}

            {showLearnChrome && (
                <>
                    <header className="app-header">
                        <div className="app-header-row">
                            <div>
                                <h1>
                                    CodeBridge{" "}
                                    <span className="app-version" title="Release Candidate">
                                        v0.9.0-rc.1
                                    </span>
                                </h1>
                                <p className="subtitle">
                                    {view === "settings"
                                        ? "設定"
                                        : view === "learn-roadmap"
                                          ? "学習ロードマップ"
                                          : view === "learn-samples"
                                            ? "サンプル"
                                            : view === "learn-progress"
                                              ? "学習進捗"
                                              : "学習ホーム"}
                                </p>
                            </div>
                            {view !== "settings" && (
                                <button
                                    type="button"
                                    className="app-header-settings-btn"
                                    onClick={handleGoSettings}
                                >
                                    設定
                                </button>
                            )}
                        </div>
                    </header>
                    <ServerStatusBanner connected={connected} checked={checked} />
                </>
            )}

            {view === "learn" && (
                <LearnHomeView
                    onBackEntry={handleBackEntry}
                    onNavigateLearn={handleNavigateLearn}
                    onOpenSample={openSampleFrom("learn")}
                />
            )}

            {view === "learn-roadmap" && (
                <LearnRoadmapPage
                    onBackEntry={handleBackEntry}
                    onNavigateLearn={handleNavigateLearn}
                    onGoSettings={handleGoSettings}
                    onOpenSample={openSampleFrom("learn-roadmap")}
                />
            )}

            {view === "learn-samples" && (
                <LearnSamplesPage
                    onBackEntry={handleBackEntry}
                    onNavigateLearn={handleNavigateLearn}
                    onOpenSample={openSampleFrom("learn-samples")}
                />
            )}

            {view === "learn-progress" && (
                <LearnProgressPage
                    onBackEntry={handleBackEntry}
                    onNavigateLearn={handleNavigateLearn}
                    onGoSettings={handleGoSettings}
                />
            )}

            {view === "settings" && <SettingsView onBackEntry={handleBackEntry} />}

            {view === "editor" && (
                <EditorView
                    key={
                        sampleId
                            ? `sample-${sampleId}-${editorSessionId}`
                            : `project-${projectTitle || "new"}-${editorSessionId}`
                    }
                    jpCode={jpCode}
                    cCode={cCode}
                    onJpCodeChange={setJpCode}
                    onCCodeChange={setCCode}
                    onOpenSample={openSampleFrom(
                        isLearnView(editorReturnView) ? editorReturnView : "learn"
                    )}
                    onBackHome={handleBackHome}
                    projectTitle={projectTitle}
                    sampleId={sampleId}
                    isNewProject={isNewProject}
                    serverConnected={connected}
                    serverChecked={checked}
                />
            )}
        </div>
    );
}
