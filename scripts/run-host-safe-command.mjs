import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const mode = process.argv[2];
const root = process.cwd();
const tmpDir = path.join(root, "tmp");

fs.mkdirSync(tmpDir, { recursive: true });

const env = {
  ...process.env,
  TMPDIR: process.env.TMPDIR || tmpDir,
  TMP: process.env.TMP || tmpDir,
  TEMP: process.env.TEMP || tmpDir,
  NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || "1",
};

let args;
let command;

function getBin(name) {
  return path.join(root, "node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);
}

switch (mode) {
  case "build":
    env.RAYON_NUM_THREADS = env.RAYON_NUM_THREADS || "1";
    env.UV_THREADPOOL_SIZE = env.UV_THREADPOOL_SIZE || "1";
    env.NODE_OPTIONS = env.NODE_OPTIONS || "--max-old-space-size=1024";
    env.CPANEL_BUILD = "1";
    command = getBin("next");
    args = ["build", "--webpack"];
    break;
  default:
    console.error(`Unknown mode: ${mode}`);
    process.exit(1);
}

const child = spawn(command, args, {
  cwd: root,
  env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
