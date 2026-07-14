/**
 * Monaco Editor をローカル npm パッケージから読み込む（CDN 不使用）
 * main.jsx から App より先に import すること。
 *
 * フルパッケージではなく editor API + C 言語 contribution に絞り、
 * json/css/html/ts worker の巨大チャンクを避ける。
 */
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

/**
 * CodeBridge は主に C / codebridge-jp を使う。
 * editor.worker のみローカル同梱する。
 */
globalThis.MonacoEnvironment = {
    getWorker(_workerId, _label) {
        return new editorWorker();
    },
};

loader.config({ monaco });

export { monaco, loader };
