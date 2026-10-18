/**
 * Shared pre-dev sanity check. This deliberately does not generate or overwrite
 * environment files: developers must supply their own local credentials.
 */
const major = Number(process.versions.node.split(".")[0]);
if (!Number.isFinite(major) || major < 22) {
  console.error("StreamFlix requires Node.js 22 or newer. Current version:", process.versions.node);
  process.exit(1);
}
console.log("StreamFlix development prerequisites checked.");
