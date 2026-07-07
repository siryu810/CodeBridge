export function RunResultPanel({ text }) {

    return (

        <section className="panel">

            <div className="panel-header">③ コンソール</div>

            <pre className="run-output run-console">{text}</pre>

        </section>

    );

}


