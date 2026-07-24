/**
 * CodeBridge 共通 IDE レイアウト
 *
 * 新規作成・サンプル・練習・学習で同じ骨格を使う。
 * 画面ごとに分岐するのは「コード内容」と「右サイドの中身」のみ。
 *
 * practiceHost: 練習パネル用スロット（見ながら=スライド / 見ないで=拡大）
 * centerCollapsed: 見ないで挑戦時に IDE 中央を畳む
 */

export function IdeLayout({
    bottomMaximized = false,
    bottomOpen = true,
    centerCollapsed = false,
    toolbar,
    workspace,
    bottomPanel,
    practiceHost = null,
    sideRail,
    sidePanels,
    sideBackdrop = null,
}) {
    return (
        <div
            className={`ide-shell${
                bottomMaximized && bottomOpen ? " ide-shell--bottom-max" : ""
            }${centerCollapsed ? " ide-shell--practice-focus" : ""}`}
        >
            {toolbar}

            <div className="ide-main">
                {sideBackdrop}

                <div
                    className={`ide-center${
                        centerCollapsed ? " is-collapsed-for-practice" : ""
                    }`}
                    aria-hidden={centerCollapsed || undefined}
                >
                    <div
                        className={`ide-workspace-wrap${
                            bottomMaximized && bottomOpen ? " is-hidden-by-bottom" : ""
                        }`}
                    >
                        {workspace}
                    </div>
                    {bottomPanel}
                </div>

                {practiceHost}

                {sideRail}
                {sidePanels}
            </div>
        </div>
    );
}
