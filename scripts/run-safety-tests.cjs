// Safety helper test runner: compile data modules, run smoke, clean up.
// Run: npm run test:safety
const { execFileSync } = require("node:child_process");
const { rmSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const root = join(__dirname, "..");
const tmp = join(__dirname, "smoke-tmp");
const tsc = join(root, "node_modules", "typescript", "bin", "tsc");

try {
  execFileSync(process.execPath, [
    tsc,
    "src/types.ts",
    "src/data/rooms.ts",
    "src/data/safetyCheck.ts",
    "src/data/safetyQuiz.ts",
    "src/data/checkCheers.ts",
    "src/data/setupGuide.ts",
    "src/data/accidentGuide.ts",
    "src/data/weedCards.ts",
    "src/data/weedScenarios.ts",
    "src/utils/sheetParams.ts",
    "src/data/safetyScenes.ts",
    "src/data/safetyImageManifest.ts",
    "--ignoreConfig",
    "--outDir",
    "scripts/smoke-tmp",
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--skipLibCheck",
    "--declaration",
    "false",
    "--sourceMap",
    "false",
  ], { cwd: root, stdio: "inherit" });
  writeFileSync(join(tmp, "package.json"), '{"type":"commonjs"}');
  execFileSync(process.execPath, [join(__dirname, "smoke-safety.cjs")], { cwd: root, stdio: "inherit" });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
