const PANEL_TITLES = {

    input_wait: "④ 入力待ち",

    success: "④ 日本語エラー",

    compile_error: "④ 日本語エラー",

    runtime_error: "④ 日本語エラー",

    timeout: "④ 日本語エラー",

    error: "④ 日本語エラー",

};



export function JapaneseErrorPanel({ text, mode = "error" }) {

    const title = PANEL_TITLES[mode] ?? PANEL_TITLES.error;

    const className = mode === "input_wait" ? "run-input-wait" : "run-error";



    return (

        <section className="panel">

            <div className="panel-header">{title}</div>

            <pre className={className}>{text}</pre>

        </section>

    );

}


