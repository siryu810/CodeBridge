import { useRef, useCallback } from "react";
import {
    PREVIEW_PERCENT_MIN,
    PREVIEW_PERCENT_MAX,
    PREVIEW_HIDE_THRESHOLD,
} from "../hooks/useIdeLayout.js";

function isColumnWorkspace(workspace) {
    return window.getComputedStyle(workspace).flexDirection === "column";
}

export function useWorkspaceResize({ previewPercent, setPreviewPercent, setPreviewVisible }) {
    const workspaceRef = useRef(null);

    const onSplitterMouseDown = useCallback(
        (event) => {
            event.preventDefault();
            const workspace = workspaceRef.current;
            if (!workspace) return;

            const rect = workspace.getBoundingClientRect();
            const column = isColumnWorkspace(workspace);

            const onMove = (moveEvent) => {
                const total = column ? rect.height : rect.width;
                if (total <= 0) return;

                const editorSize = column
                    ? moveEvent.clientY - rect.top
                    : moveEvent.clientX - rect.left;
                const nextPreview = ((total - editorSize) / total) * 100;

                if (nextPreview < PREVIEW_HIDE_THRESHOLD) {
                    setPreviewVisible(false);
                    return;
                }

                setPreviewVisible(true);
                setPreviewPercent(
                    Math.min(PREVIEW_PERCENT_MAX, Math.max(PREVIEW_PERCENT_MIN, nextPreview))
                );
            };

            const onUp = () => {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                document.body.classList.remove("body--resizing");
                document.body.classList.remove("body--resizing-row");
            };

            document.body.classList.add(column ? "body--resizing-row" : "body--resizing");
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
        },
        [setPreviewPercent, setPreviewVisible]
    );

    return { workspaceRef, onSplitterMouseDown };
}
