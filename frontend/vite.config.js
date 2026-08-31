import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 実行サーバーのポート（server.js と揃える。Vite 自身の PORT とは分離） */
const API_PORT = Number(process.env.CODEBRIDGE_API_PORT || 3000);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@shared": path.resolve(__dirname, "../shared"),
        },
    },
    optimizeDeps: {
        include: ["monaco-editor", "@monaco-editor/react"],
    },
    worker: {
        format: "es",
    },
    build: {
        commonjsOptions: {
            include: [/shared/, /node_modules/],
        },
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("monaco-editor")) {
                        return "monaco-editor";
                    }
                },
            },
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/run": `http://localhost:${API_PORT}`,
            "/health": `http://localhost:${API_PORT}`,
        },
    },
});
