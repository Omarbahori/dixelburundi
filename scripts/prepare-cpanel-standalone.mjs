import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const nextDir = path.join(rootDir, ".next");
const standaloneDir = path.join(nextDir, "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");
const staticDir = path.join(nextDir, "static");
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const deployDir = path.join(rootDir, ".cpanel-deploy");

async function copyIfExists(source, destination) {
  try {
    await fs.access(source);
  } catch {
    return;
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true, force: true });
}

async function main() {
  try {
    await fs.access(standaloneServer);
  } catch {
    console.error(
      "Missing .next/standalone/server.js. Run a successful Linux production build first.",
    );
    process.exit(1);
  }

  await fs.rm(deployDir, { recursive: true, force: true });
  await fs.mkdir(deployDir, { recursive: true });

  await copyIfExists(path.join(rootDir, "server.js"), path.join(deployDir, "server.js"));
  await copyIfExists(standaloneDir, path.join(deployDir, ".next", "standalone"));
  await copyIfExists(staticDir, path.join(deployDir, ".next", "static"));
  await copyIfExists(publicDir, path.join(deployDir, "public"));
  await copyIfExists(dataDir, path.join(deployDir, "data"));
  await copyIfExists(path.join(rootDir, ".env.example"), path.join(deployDir, ".env.example"));
  await copyIfExists(path.join(rootDir, "README.md"), path.join(deployDir, "README.md"));

  await fs.writeFile(
    path.join(deployDir, "release.txt"),
    [
      "DIXEL cPanel standalone artifact",
      `Built at: ${new Date().toISOString()}`,
      "",
      "This artifact is prebuilt on Linux.",
      "Do not run npm install or next build on cPanel for this artifact.",
      "Set cPanel startup file to server.js and restart the Node app.",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`Prepared cPanel standalone artifact in ${deployDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
