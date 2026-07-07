import { getDictionary } from "../lib/convert.js";
import { getLearningEntryByDictKey } from "../lib/learning.js";

const categoryOrder = [
    "出力",
    "入力",
    "条件分岐",
    "繰り返し",
    "型",
    "制御",
    "比較",
    "論理",
    "その他",
];

export function DictionaryPanel({ usedKeys, onSelectEntry, embedded = false }) {
    const julyItems = getDictionary().filter((d) => d.july);
    const used = usedKeys ?? new Set();

    const openEntry = (item) => {
        const entry = getLearningEntryByDictKey(item.key);
        if (entry) onSelectEntry?.(entry);
    };

    const dictContent = (
        <>
            <div className={`dict-scroll${embedded ? " dict-scroll--fill" : ""}`}>
                {categoryOrder.map((category) => {
                    const items = julyItems.filter((d) => d.category === category);
                    if (items.length === 0) return null;
                    return (
                        <div key={category}>
                            <div className="dict-category">{category}</div>
                            {items.map((item) => {
                                const hasLearning = Boolean(getLearningEntryByDictKey(item.key));
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={`dict-card${used.has(item.key) ? " used" : ""}${hasLearning ? " dict-card-clickable" : ""}`}
                                        onClick={() => hasLearning && openEntry(item)}
                                        disabled={!hasLearning}
                                    >
                                        <div className="dict-main">
                                            {item.jp} ⇔ {item.displayC ?? item.c}
                                        </div>
                                        <div className="dict-desc">{item.description}</div>
                                        {hasLearning && (
                                            <div className="dict-card-hint">クリックで詳しい説明</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <p className="dict-hint">入力に登場した語は強調表示されます。項目をクリックすると詳しい説明が開きます。</p>
        </>
    );

    if (embedded) return dictContent;

    return (
        <section className="panel">
            <div className="panel-header">⑥ 日本語 ⇔ C言語 対応表</div>
            {dictContent}
        </section>
    );
}
