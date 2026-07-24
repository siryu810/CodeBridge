import { CODEBRIDGE_JP_LANGUAGE_ID, CodeBridgeMonaco } from "./CodeBridgeMonaco.jsx";

/**
 * メインエディタ（日本語 / C）— ローカル Monaco Editor
 * textarea / editorAssist は使用しない（Monaco 標準の補完・インデントを利用）
 */
export function JapaneseEditor({
    value,
    onChange,
    placeholder,
    language = "japanese",
    markers = [],
    className = "",
    showLineNumbers = true,
    fontSize,
    path,
    editorApiRef,
}) {
    const monacoLanguage =
        language === "c" || language === "c2jp" ? "c" : CODEBRIDGE_JP_LANGUAGE_ID;

    return (
        <CodeBridgeMonaco
            className={`code-editor code-editor--monaco${className ? ` ${className}` : ""}`}
            value={value}
            onChange={onChange}
            language={monacoLanguage}
            markers={markers}
            showLineNumbers={showLineNumbers}
            fontSize={fontSize}
            path={path ?? `codebridge-main.${monacoLanguage === "c" ? "c" : "cbjp"}`}
            editorApiRef={editorApiRef}
            options={{
                // placeholder は Monaco 非標準のため aria に近いヒントのみ
                ariaLabel: placeholder || "コードエディタ",
            }}
        />
    );
}
