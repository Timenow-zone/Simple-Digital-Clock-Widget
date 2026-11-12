import net from "node:net";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Run only in the owned Compose network. These loopback forwards preserve the
// site's configured origin, cookies and iframe URLs for real Linux browsers.
const arguments_ = process.argv.slice(2);
const entryOffset = arguments_.indexOf("--entry");
let entry = "browser";
if (entryOffset !== -1) {
  entry = arguments_[entryOffset + 1];
  arguments_.splice(entryOffset, 2);
}
if (!["browser", "corpus-editor", "frontend", "widgets-ui"].includes(entry))
  throw new Error("Unknown browser entry point");
const offset = arguments_.indexOf("--run-dir");
if (offset < 0 || !arguments_[offset + 1]) throw new Error("--run-dir is required");
const run = JSON.parse(await fs.readFile(path.join(arguments_[offset + 1], "run.json"), "utf8"));
const servers = [];
try {
  for (const [host, site] of Object.entries(run.sites)) {
    if (!["minimum", "current"].includes(host)) throw new Error("Unknown lab service");
    const server = net.createServer((socket) => {
      const remote = net.connect({ host, port: 80 });
      socket.pipe(remote);
      remote.pipe(socket);
      socket.on("error", () => remote.destroy());
      remote.on("error", () => socket.destroy());
    });
    await new Promise((resolve, reject) => {
      server.on("error", reject);
      server.listen(site.port, "127.0.0.1", resolve);
    });
    servers.push(server);
  }
  process.exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      [fileURLToPath(new URL("./" + entry + ".mjs", import.meta.url)), ...arguments_],
      { stdio: "inherit" }
    );
    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });
} finally {
  for (const server of servers) server.close();
}
