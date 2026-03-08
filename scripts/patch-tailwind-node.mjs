import fs from "fs";
import path from "path";

const root = path.join(process.cwd(), "node_modules", "@tailwindcss", "node", "dist");

const targets = [
  {
    filePath: path.join(root, "index.js"),
    needle:
      'process.versions.bun||Pt.register?.((0,_t.pathToFileURL)(require.resolve("@tailwindcss/node/esm-cache-loader")));',
  },
  {
    filePath: path.join(root, "index.mjs"),
    needle:
      'if(!process.versions.bun){let e=ce.createRequire(import.meta.url);ce.register?.(Xr(e.resolve("@tailwindcss/node/esm-cache-loader")))}',
  },
];

let appliedCount = 0;
let foundTargetFile = false;

for (const target of targets) {
  if (!fs.existsSync(target.filePath)) {
    continue;
  }

  foundTargetFile = true;
  const source = fs.readFileSync(target.filePath, "utf8");

  if (!source.includes(target.needle)) {
    continue;
  }

  const patched = source.replace(
    target.needle,
    '/* patched: disable tailwind module.register worker hook for restricted hosts */',
  );

  fs.writeFileSync(target.filePath, patched, "utf8");
  appliedCount += 1;
}

if (!foundTargetFile) {
  console.log("[patch-tailwind-node] skipped: target files not found");
  process.exit(0);
}

if (appliedCount === 0) {
  console.log("[patch-tailwind-node] skipped: patch target not found");
  process.exit(0);
}

console.log(`[patch-tailwind-node] applied to ${appliedCount} file(s)`);
