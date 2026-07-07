import { useState, useEffect } from "react";
import { SampleList } from "./SampleList.jsx";
import { getRecentList, formatRecentDate } from "../lib/recent.js";

export function HomeView({ onNewProject, onOpenSample, onOpenRecent }) {
    const [recent, setRecent] = useState([]);

    useEffect(() => {
        setRecent(getRecentList());
    }, []);

    return (
        <main className="home-view">
            <section className="home-hero panel">
                <h2 className="home-hero-title">CodeBridge へようこそ</h2>
                <p className="home-hero-text">
                    CodeBridge は「C言語を日本語に翻訳するツール」ではなく、
                    <strong>プログラミングの考え方を日本語で学べる学習IDE</strong> です。
                    日本語でコードを書き、C言語への変換・実行・エラーの日本語説明を通して理解を深めます。
                </p>
                <ul className="home-features">
                    <li>日本語命令（表示・もし・入力 など）でコードが書ける</li>
                    <li>リアルタイムで C 言語に変換され、意味も学べる</li>
                    <li>実行結果とエラーを分けて、初心者向けに表示</li>
                </ul>
                <p className="home-future-note">※ 将来は .c / .cb ファイルの保存・読み込みにも対応予定です。</p>
            </section>

            <div className="home-actions">
                <section className="panel home-section">
                    <h3 className="home-section-title">新規作成</h3>
                    <p className="home-section-desc">空のエディタから、自分のコードを書き始めます。</p>
                    <button type="button" className="home-primary-btn" onClick={onNewProject}>
                        ＋ 新規作成
                    </button>
                </section>

                <section className="panel home-section">
                    <h3 className="home-section-title">サンプルを開く</h3>
                    <p className="home-section-desc">
                        題材のコードを選ぶと、エディタに読み込まれます。モードに応じて日本語版・C言語版が切り替わります。
                    </p>
                    <SampleList featuredOnly onSelect={(s) => s && onOpenSample(s)} />
                </section>
            </div>

            <section className="panel home-section home-recent">
                <h3 className="home-section-title">最近使ったコード</h3>
                <div className="recent-list">
                    {recent.length === 0 ? (
                        <p className="home-empty">
                            まだ履歴がありません。新規作成またはサンプルから始めてください。
                        </p>
                    ) : (
                        recent.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className="recent-item"
                                onClick={() => onOpenRecent(item.code, item.title)}
                            >
                                <span className="recent-title">{item.title}</span>
                                <span className="recent-meta">{formatRecentDate(item.updatedAt)}</span>
                            </button>
                        ))
                    )}
                </div>
            </section>
        </main>
    );
}
