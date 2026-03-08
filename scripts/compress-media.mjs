import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const ROOT = process.cwd();
const TARGET_DIRS = ["public", "images"];
const VID_EXT = new Set([".mp4", ".mov", ".webm"]);
const MIN_BYTES_TO_PROCESS = 120 * 1024;

function toMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

async function statSafe(file) {
  try {
    return await fs.stat(file);
  } catch {
    return null;
  }
}

async function replaceIfSmaller(original, candidate) {
  const [a, b] = await Promise.all([statSafe(original), statSafe(candidate)]);
  if (!a || !b) return { changed: false, before: a?.size ?? 0, after: a?.size ?? 0 };
  if (b.size >= a.size) {
    await fs.unlink(candidate).catch(() => {});
    return { changed: false, before: a.size, after: a.size };
  }
  await fs.rename(candidate, original);
  return { changed: true, before: a.size, after: b.size };
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { stdio: "ignore" });
    proc.on("error", reject);
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`))));
  });
}

async function compressVideo(file) {
  const ext = path.extname(file).toLowerCase();
  const tmp = `${file}.tmp${ext}`;
  await fs.unlink(tmp).catch(() => {});

  const common = [
    "-y",
    "-i",
    file,
    "-movflags",
    "+faststart",
    "-vf",
    "scale='min(1280,iw)':-2",
    "-preset",
    "veryfast",
  ];

  let args;
  if (ext === ".webm") {
    args = [...common, "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-an", tmp];
  } else {
    args = [
      ...common,
      "-c:v",
      "libx264",
      "-profile:v",
      "main",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "30",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      tmp,
    ];
  }

  await runFfmpeg(args);
  return replaceIfSmaller(file, tmp);
}

async function main() {
  const files = [];
  for (const rel of TARGET_DIRS) {
    const abs = path.join(ROOT, rel);
    const st = await statSafe(abs);
    if (st?.isDirectory()) {
      files.push(...(await walk(abs)));
    }
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;
  let skipped = 0;
  let failures = 0;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!VID_EXT.has(ext)) continue;

    const st = await statSafe(file);
    if (!st || st.size < MIN_BYTES_TO_PROCESS) {
      skipped++;
      continue;
    }

    try {
      const result = await compressVideo(file);
      totalBefore += result.before;
      totalAfter += result.after;
      if (result.changed) changed++;
      else skipped++;
      process.stdout.write(
        `${result.changed ? "compressed" : "kept"}: ${path.relative(ROOT, file)} (${toMB(result.before)}MB -> ${toMB(result.after)}MB)\n`,
      );
    } catch (err) {
      failures++;
      process.stdout.write(`failed: ${path.relative(ROOT, file)} (${String(err)})\n`);
    }
  }

  const saved = totalBefore - totalAfter;
  process.stdout.write("\n");
  process.stdout.write(`Files changed: ${changed}\n`);
  process.stdout.write(`Files kept/skipped: ${skipped}\n`);
  process.stdout.write(`Failures: ${failures}\n`);
  process.stdout.write(`Space saved: ${toMB(saved > 0 ? saved : 0)}MB\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
