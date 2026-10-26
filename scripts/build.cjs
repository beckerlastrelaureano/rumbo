// Inserta src/pilares.js dentro de rumbo.html (entre las marcas <PILARES> y </PILARES>).
// Uso: node scripts/build.cjs
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "rumbo.html");
let html = fs.readFileSync(htmlPath, "utf8");
const crlf = html.includes("\r\n");
html = html.replace(/\r\n/g, "\n");

const vapid = fs.readFileSync(path.join(__dirname, "vapid-public.txt"), "utf8").trim();
const code = fs.readFileSync(path.join(root, "src", "pilares.js"), "utf8").replace(/\r\n/g, "\n").replace("__VAPID_PUBLIC__", vapid);

const START = "  // <PILARES>\n", END = "  // </PILARES>\n";
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < 0) throw new Error("No encontré las marcas <PILARES> en rumbo.html");
html = html.slice(0, a + START.length) + code.replace(/\n?$/, "\n") + html.slice(b);

fs.writeFileSync(htmlPath, crlf ? html.replace(/\n/g, "\r\n") : html);
console.log("rumbo.html actualizado con src/pilares.js");
