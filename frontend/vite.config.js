import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
            "/run": "http://localhost:3000",
            "/health": "http://localhost:3000",
        },
    },
});
