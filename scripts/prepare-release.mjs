import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const releaseDir = path.join(projectRoot, "artifacts", "release");
const files = ["main.js", "manifest.json", "styles.css", "versions.json", "README.md"];

await mkdir(releaseDir, { recursive: true });

for (const file of files) {
  await cp(path.join(projectRoot, file), path.join(releaseDir, file), { force: true });
}

await writeFile(
  path.join(projectRoot, "artifacts", "release-summary.md"),
  [
    "# Release summary",
    "",
    "These files are ready for the GitHub release upload:",
    "",
    ...files.map((file) => `- ${file}`)
  ].join("\n"),
  "utf8"
);
