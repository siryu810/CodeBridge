import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
let src = fs.readFileSync(path.join(root, "shared", "c2jp.js"), "utf8");
src = src.replace(
    /import CodeBridgeJp2c from "\.\/jp2c\.js";\s*\n\s*const \{ dictionary \} = CodeBridgeJp2c;/,
    "const dictionary = window.CodeBridgeJp2c.dictionary;"
);
src = src.replace(
    "export default CodeBridgeC2jp;",
    `if (typeof window !== "undefined") {
    window.CodeBridgeC2jp = CodeBridgeC2jp;
}
if (typeof module !== "undefined") {
    module.exports = CodeBridgeC2jp;
}`
);
fs.writeFileSync(path.join(root, "js", "c2jp.js"), src, "utf8");
