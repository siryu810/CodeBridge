import { useState, useCallback } from "react";

import CodeBridgeJp2c from "@shared/jp2c.js";

import { HomeView } from "./components/HomeView.jsx";

import { EditorView } from "./components/EditorView.jsx";

import { ServerStatusBanner } from "./components/ServerStatusBanner.jsx";

import { useServerHealth } from "./hooks/useServerHealth.js";

import { addToRecent } from "./lib/recent.js";

import {

    NEW_PROJECT_JP_CODE,

    NEW_PROJECT_C_CODE,

} from "./data/samples.js";



export default function App() {

    const [view, setView] = useState("home");

    const [jpCode, setJpCode] = useState("");

    const [cCode, setCCode] = useState("");

    const [projectTitle, setProjectTitle] = useState("");

    const [sampleId, setSampleId] = useState(null);

    const { connected, checked } = useServerHealth();



    const handleOpenSample = useCallback((sample) => {

        if (!sample) return;

        setJpCode(sample.jpCode ?? "");

        setCCode(sample.cCode ?? "");

        setProjectTitle(sample.title ?? "");

        setSampleId(sample.id ?? null);

        addToRecent(sample.title, sample.jpCode ?? "");

        setView("editor");

    }, []);



    const handleNewProject = useCallback(() => {

        setJpCode(NEW_PROJECT_JP_CODE);

        setCCode(NEW_PROJECT_C_CODE);

        setProjectTitle("新規プロジェクト");

        setSampleId(null);

        addToRecent("新規プロジェクト", NEW_PROJECT_JP_CODE);

        setView("editor");

    }, []);



    const handleOpenRecent = useCallback((recentJpCode, title) => {

        const converted = CodeBridgeJp2c.convertJapaneseToC(recentJpCode ?? "");

        setJpCode(recentJpCode ?? "");

        setCCode(converted.program || NEW_PROJECT_C_CODE);

        setProjectTitle(title ?? "");

        setSampleId(null);

        setView("editor");

    }, []);



    return (

        <div className={`app-root${view === "editor" ? " app-root--ide" : " app-root--home"}`}>

            {view === "home" ? (

                <>

                    <header className="app-header">

                        <div className="app-header-row">

                            <div>

                                <h1>CodeBridge</h1>

                                <p className="subtitle">

                                    日本語でプログラミングの考え方を学び、C言語へ橋渡しする学習IDE

                                </p>

                            </div>

                        </div>

                    </header>



                    <ServerStatusBanner connected={connected} checked={checked} />



                    <HomeView

                        onNewProject={handleNewProject}

                        onOpenSample={handleOpenSample}

                        onOpenRecent={handleOpenRecent}

                    />

                </>

            ) : (

                <EditorView

                    jpCode={jpCode}

                    cCode={cCode}

                    onJpCodeChange={setJpCode}

                    onCCodeChange={setCCode}

                    onOpenSample={handleOpenSample}

                    onBackHome={() => setView("home")}

                    projectTitle={projectTitle}

                    sampleId={sampleId}

                    serverConnected={connected}

                    serverChecked={checked}

                />

            )}

        </div>

    );

}


