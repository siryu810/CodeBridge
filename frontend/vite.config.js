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
    build: {
        commonjsOptions: {
            include: [/shared/, /node_modules/],
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
