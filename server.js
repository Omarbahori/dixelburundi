/* eslint-disable @typescript-eslint/no-require-imports */
/* cPanel "Setup Node.js App" (Passenger) friendly Next.js server */
const { createServer } = require("http");
const fs = require("fs");
const path = require("path");

// This entrypoint is production-only. Never run Next dev server on shared hosting.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_ENV = "production";
}

// Keep libuv worker pool tiny on constrained hosts to reduce process/thread pressure.
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = "1";
}

// Disable telemetry in shared hosting environments.
if (!process.env.NEXT_TELEMETRY_DISABLED) {
  process.env.NEXT_TELEMETRY_DISABLED = "1";
}

const standaloneServerPath = path.join(process.cwd(), ".next", "standalone", "server.js");

// Prefer Next standalone runtime when present. It has a smaller production footprint.
if (fs.existsSync(standaloneServerPath)) {
  process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
  require(standaloneServerPath);
  return;
}

const next = require("next");
const port = parseInt(process.env.PORT || "3000", 10);
const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");

if (!fs.existsSync(buildIdPath)) {
  console.error("Missing production build (.next/BUILD_ID). Run `npm run build` first.");
  process.exit(1);
}

const app = next({ dev: false, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();
let server;

app
  .prepare()
  .then(() => {
    server = createServer((req, res) => handle(req, res));
    server.listen(port, () => {
      console.log(`DIXEL app ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

function shutdown(signal) {
  if (!server) {
    process.exit(0);
  }
  server.close(() => {
    console.log(`Received ${signal}, server closed.`);
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
