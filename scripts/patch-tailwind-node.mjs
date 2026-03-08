import fs from "fs";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "node_modules",
  "@tailwindcss",
  "node",
  "dist",
  "index.js",
);

const needle =
  'process.versions.bun||Pt.register?.((0,_t.pathToFileURL)(require.resolve("@tailwindcss/node/esm-cache-loader")));';

if (!fs.existsSync(filePath)) {
  console.log("[patch-tailwind-node] skipped: target file not found");
  process.exit(0);
}

const source = fs.readFileSync(filePath, "utf8");

if (!source.includes(needle)) {
  console.log("[patch-tailwind-node] skipped: patch target not found");
  process.exit(0);
}

const patched = source.replace(
  needle,
  '/* patched: disable tailwind module.register worker hook for restricted hosts */',
);

fs.writeFileSync(filePath, patched, "utf8");
console.log("[patch-tailwind-node] applied");
