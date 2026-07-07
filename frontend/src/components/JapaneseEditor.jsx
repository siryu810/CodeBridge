import { useRef, useEffect, useCallback } from "react";

const EDITOR_TAB = "    ";

export function JapaneseEditor({ value, onChange, placeholder }) {
    const textareaRef = useRef(null);
    const gutterRef = useRef(null);

    const updateLineNumbers = useCallback(() => {
        const textarea = textareaRef.current;
        const gutter = gutterRef.current;
        if (!textarea || !gutter) return;
        const lineCount = textarea.value.split("\n").length;
        const numbers = [];
        for (let i = 1; i <= lineCount; i++) numbers.push(String(i));
        gutter.textContent = numbers.join("\n");
    }, []);

    useEffect(() => {
        updateLineNumbers();
    }, [value, updateLineNumbers]);

    const syncScroll = () => {
        if (textareaRef.current && gutterRef.current) {
            gutterRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const insertAtCursor = (text) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        const newValue = before + text + after;
        onChange(newValue);
        const pos = start + text.length;
        requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = pos;
        });
    };

    const getLineIndent = (lineText) => {
        const match = lineText.match(/^\s*/);
        return match ? match[0] : "";
    };

    const handleKeyDown = (e) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (e.key === "Tab") {
            e.preventDefault();
            insertAtCursor(EDITOR_TAB);
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);
            const lineStart = before.lastIndexOf("\n") + 1;
            const currentLine = before.substring(lineStart);
            const indent = getLineIndent(currentLine);
            const charBefore = before.length > 0 ? before[before.length - 1] : "";

            let insertText;
            let cursorOffset;
            if (charBefore === "{") {
                insertText = "\n" + indent + EDITOR_TAB + "\n" + indent + "}";
                cursorOffset = 1 + indent.length + EDITOR_TAB.length;
            } else {
                insertText = "\n" + indent;
                cursorOffset = insertText.length;
            }

            const newValue = before + insertText + after;
            onChange(newValue);
            const newPos = start + cursorOffset;
            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = newPos;
            });
        }
    };

    return (
        <div className="code-editor">
            <div ref={gutterRef} className="code-editor-gutter" aria-hidden="true">
                1
            </div>
            <textarea
                ref={textareaRef}
                className="code-editor-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={syncScroll}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                wrap="off"
                placeholder={placeholder}
            />
        </div>
    );
}
