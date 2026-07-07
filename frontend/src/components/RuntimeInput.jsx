export function RuntimeInput({ value, onChange, visible, embedded = false }) {
    if (!visible) return null;

    if (embedded) {
        return (
            <section className="runtime-input-panel">
                <div className="runtime-input-header">
                    <span>実行時入力</span>
                    <span
                        className="runtime-input-hint-inline"
                        title="複数回入力する場合は1行に1つ"
                    >
                        1行に1つ
                    </span>
                </div>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                    rows={2}
                    placeholder="例: 42"
                />
            </section>
        );
    }

    return (
        <section className="panel stdin-panel">
            <div className="panel-header">実行時入力</div>
            <p className="stdin-hint">
                「入力(...)」で読み込む値をここに入力します。複数回入力する場合は1行に1つ。
            </p>
            <textarea
                className="run-stdin"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                spellCheck={false}
                placeholder={"例:\n1\n170\n65"}
            />
        </section>
    );
}
