// Safety helper smoke test (compiled CJS in scripts/smoke-tmp).
const { rooms } = require("./smoke-tmp/data/rooms.js");
const { safetyChecks } = require("./smoke-tmp/data/safetyCheck.js");
const { safetyQuizQuestions, findMissingQuizScenes } = require("./smoke-tmp/data/safetyQuiz.js");
const { cheerFor, titleFor } = require("./smoke-tmp/data/checkCheers.js");
const { SETUP_GUIDE, isTeacherAccount } = require("./smoke-tmp/data/setupGuide.js");
const { parseStudentParams, buildStudentUrl } = require("./smoke-tmp/utils/sheetParams.js");
const { safetyScenes } = require("./smoke-tmp/data/safetyScenes.js");
const { SAFETY_IMAGE_FILES } = require("./smoke-tmp/data/safetyImageManifest.js");
const { accidentGuides } = require("./smoke-tmp/data/accidentGuide.js");
const { FLOWER_CARDS, CONDITION_CARDS, ACTION_CARDS, ROOT_CARDS, weedLabel, rootSuggestion } = require("./smoke-tmp/data/weedCards.js");
const { WEED_SCENARIOS, getWeedScenario } = require("./smoke-tmp/data/weedScenarios.js");
const { existsSync } = require("node:fs");
const { join, sep } = require("node:path");

let fail = 0;
const ok = (cond, msg) => {
  if (!cond) { fail++; console.error("FAIL:", msg); }
  else console.log("ok:", msg);
};

const pub = (p) => join(__dirname, "..", "public", p.replace(/^\//, "").split("/").join(sep));

ok(rooms.length === 1, `rooms 1 (got ${rooms.length})`);
const roomIds = new Set(rooms.map((r) => r.id));
ok(roomIds.has("lab"), "room exists: lab");
for (const r of rooms) {
  ok(existsSync(pub(r.image)), `${r.id}: hero image exists (${r.image})`);
  ok(existsSync(pub(r.badge)), `${r.id}: badge image exists (${r.badge})`);
  const items = safetyChecks[r.id];
  ok(items && items.length === 20, `${r.id}: 20 checks (got ${items ? items.length : 0})`);
  ok(new Set(items.map((i) => i.id)).size === items.length, `${r.id}: check ids unique`);
  for (const ph of ["before", "during", "after"]) {
    ok(items.some((i) => i.phase === ph), `${r.id}: phase ${ph} present`);
  }
  for (const i of items) ok(i.text.trim().length > 0, `${i.id}: text present`);
}

ok(findMissingQuizScenes().length === 0, "quiz scenes all exist");
ok(safetyQuizQuestions.length >= 20, `quiz >= 20 (got ${safetyQuizQuestions.length})`);
ok(new Set(safetyQuizQuestions.map((q) => q.sceneId)).size === safetyQuizQuestions.length, "quiz sceneIds unique");
for (const q of safetyQuizQuestions) {
  ok(typeof q.variant === "number" && q.variant >= 1 && q.variant <= 3, `${q.sceneId}: default variant in range`);
}
const known = new Set(safetyScenes.map((s) => s.id));
for (const q of safetyQuizQuestions) {
  ok(known.has(q.sceneId), `quiz scene known: ${q.sceneId}`);
  const files = SAFETY_IMAGE_FILES[q.sceneId];
  ok(files && files.length > 0, `quiz images listed: ${q.sceneId}`);
  for (const f of files || []) {
    ok(existsSync(join(__dirname, "..", "public", "images", "safety", f)), `quiz image file: ${f}`);
  }
}

ok(typeof cheerFor(0, 20) === "string" && cheerFor(0, 20).length > 0, "cheerFor(0) returns message");
ok(typeof cheerFor(0.3, 14) === "string", "cheerFor(early) returns message");
ok(typeof cheerFor(0.7, 6) === "string", "cheerFor(mid) returns message");
ok(typeof cheerFor(1, 0) === "string", "cheerFor(done) returns message");
ok(cheerFor(0.5, 1).length > 0, "cheerFor(last-one) returns message");
ok(titleFor(0) === "안전 새싹", "titleFor(0)");
ok(titleFor(1) === "안전 지킴이" && titleFor(2) === "안전 지킴이", "titleFor(1-2)");
ok(titleFor(3) === "안전 반장" && titleFor(4) === "안전 반장", "titleFor(3-4)");
ok(titleFor(5) === "안전 마스터" && titleFor(99) === "안전 마스터", "titleFor(5+)");

ok(FLOWER_CARDS.length >= 6, `weed flowers >= 6 (got ${FLOWER_CARDS.length})`);
ok(CONDITION_CARDS.length >= 8, `weed conditions >= 8 (got ${CONDITION_CARDS.length})`);
ok(ACTION_CARDS.length >= 7, `weed actions >= 7 (got ${ACTION_CARDS.length})`);
ok(ROOT_CARDS.length >= 10, `weed roots >= 10 (got ${ROOT_CARDS.length})`);
for (const [zone, cards] of [["flowers", FLOWER_CARDS], ["conditions", CONDITION_CARDS], ["actions", ACTION_CARDS], ["roots", ROOT_CARDS]]) {
  const ids = cards.map((c) => c.id);
  ok(new Set(ids).size === ids.length, `weed ${zone}: ids unique`);
  for (const c of cards) ok(c.label.trim().length > 0, `weed ${zone}/${c.id}: label present`);
}
for (const c of ROOT_CARDS) ok((c.suggestion ?? "").trim().length > 0, `weed root/${c.id}: suggestion present`);
ok(weedLabel("flowers", "custom:직접 입력") === "직접 입력", "weedLabel custom passthrough");
ok(weedLabel("flowers", "f-burn") === "화상", "weedLabel card lookup");
ok(weedLabel("flowers", "no-such-id") === "no-such-id", "weedLabel unknown fallback");
ok(rootSuggestion("r-no-budget").includes("예산"), "rootSuggestion content");

const zoneCards = { flowers: FLOWER_CARDS, conditions: CONDITION_CARDS, actions: ACTION_CARDS, roots: ROOT_CARDS };
ok(WEED_SCENARIOS.length >= 6, `weed scenarios >= 6 (got ${WEED_SCENARIOS.length})`);
ok(new Set(WEED_SCENARIOS.map((s) => s.id)).size === WEED_SCENARIOS.length, "weed scenario ids unique");
for (const s of WEED_SCENARIOS) {
  ok(s.title.trim().length > 0 && s.situation.trim().length > 0 && s.lesson.trim().length > 0, `weed ${s.id}: text present`);
  ok(s.cards.length >= 4, `weed ${s.id}: >= 4 cards (got ${s.cards.length})`);
  ok(new Set(s.cards.map((c) => c.id)).size === s.cards.length, `weed ${s.id}: card ids unique`);
  const zones = new Set(s.cards.map((c) => c.zone));
  for (const z of ["flowers", "conditions", "actions", "roots"]) ok(zones.has(z), `weed ${s.id}: zone ${z} present`);
  for (const c of s.cards) {
    ok((zoneCards[c.zone] ?? []).some((k) => k.id === c.id), `weed ${s.id}/${c.id}: card id exists in ${c.zone}`);
  }
}
ok(getWeedScenario("s-saw-cut")?.title.includes("톱질"), "getWeedScenario lookup");
ok(getWeedScenario("no-such") === undefined, "getWeedScenario unknown");

ok(accidentGuides.length === 7, `accident guides 7 (got ${accidentGuides.length})`);
ok(new Set(accidentGuides.map((g) => g.rank)).size === 7, "accident ranks unique");
for (const g of accidentGuides) {
  ok(g.title.trim().length > 0, `rank ${g.rank}: title present`);
  ok(g.cases.trim().length > 0, `rank ${g.rank}: cases present`);
  ok(g.prevention.length > 0, `rank ${g.rank}: prevention present`);
  ok(existsSync(pub(g.image)), `rank ${g.rank}: image exists (${g.image})`);
}

ok(SETUP_GUIDE.length === 6, `setup guide 6 sections (got ${SETUP_GUIDE.length})`);
for (const s of SETUP_GUIDE) {
  ok(s.title.trim().length > 0, `setup section title present`);
  ok(s.body.length > 0 && s.body.every((l) => l.trim().length > 0), `setup "${s.title}": body present`);
}
ok(SETUP_GUIDE.some((s) => s.code && s.code.includes("doPost")), "setup guide includes Apps Script code");
ok(isTeacherAccount("2026", "홍길동") === true, "teacher account match");
ok(isTeacherAccount(" 2026 ", "홍길동 ") === true, "teacher account trims whitespace");
ok(isTeacherAccount("2026", "김철수") === false, "teacher wrong name rejected");
ok(isTeacherAccount("30101", "홍길동") === false, "teacher wrong number rejected");
ok(isTeacherAccount("", "") === false, "teacher empty rejected");

const built = buildStudentUrl("https://example.com/", "https://script.google.com/x/exec", "c1", "3학년 1반");
ok(built.startsWith("https://example.com/?"), "student url base");
const parsed = parseStudentParams(built.slice(built.indexOf("?")));
ok(parsed.sheet === "https://script.google.com/x/exec", "student params round-trip sheet");
ok(parsed.classId === "c1", "student params round-trip classId");
ok(parsed.className === "3학년 1반", "student params round-trip className");
ok(buildStudentUrl("https://example.com", "", "", "").indexOf("?") === -1, "student url empty params");
ok(Object.keys(parseStudentParams("")).length === 0, "student params empty");
ok(Object.keys(parseStudentParams("?foo=bar")).length === 0, "student params ignores unknown");

if (fail > 0) { console.error(`${fail} FAILURES`); process.exit(1); }
console.log("ALL SAFETY SMOKE TESTS PASSED");
