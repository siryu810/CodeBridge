import { CODEBRIDGE_JP_LANGUAGE_ID, CodeBridgeMonaco } from "./CodeBridgeMonaco.jsx";

/**
 * 変換結果プレビュー（読み取り専用 Monaco）
 * @param {{ code: string, language?: "c"|"japanese"|"codebridge-jp" }} props
 */
export function CCodePreview({ code, language = "c" }) {
    const monacoLanguage =
        language === "japanese" || language === CODEBRIDGE_JP_LANGUAGE_ID
            ? CODEBRIDGE_JP_LANGUAGE_ID
            : "c";

    return (
        <CodeBridgeMonaco
            className="code-preview code-preview--monaco"
            value={code ?? ""}
            language={monacoLanguage}
            readOnly
            showLineNumbers
            path={`codebridge-preview.${monacoLanguage === "c" ? "c" : "cbjp"}`}
            options={{
                ariaLabel: "変換結果（読み取り専用）",
                // コピーは標準の Ctrl+C / 選択で可能
            }}
        />
    );
}
