import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import { getWeedScenario, WEED_SCENARIOS } from "../data/weedScenarios";
import { weedLabel, rootSuggestion } from "../data/weedCards";
import { useSafetyStore } from "../stores/safetyStore";
import { sendToSheet } from "../utils/sendToSheet";
import { playSound } from "../utils/sound";

const ZONE_META = {
  flowers: { title: "🌸 꽃 – 결과", box: "border-amber-400 bg-amber-50" },
  conditions: { title: "🍃 왼쪽 잎 – 조건", box: "border-sky-500 bg-sky-50" },
  actions: { title: "🍃 오른쪽 잎 – 행동", box: "border-orange-500 bg-orange-50" },
  roots: { title: "🌱 뿌리 – 근본 원인", box: "border-red-700 bg-red-50" },
} as const;

export function WeedResultPage() {
  const navigate = useNavigate();
  const weedLast = useSafetyStore((s) => s.weedLast);
  const weedBest = useSafetyStore((s) => s.weedBest);
  const student = useSafetyStore((s) => s.student);
  const scriptUrl = useSafetyStore((s) => s.scriptUrl);

  const [sending, setSending] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "done" | "fail">("idle");

  if (!weedLast) {
    return (
      <Layout title="📊 분석 결과" backTo="/weed" wide>
        <div className="mx-auto max-w-2xl p-6 text-center">
          <p className="font-bold text-slate-600">아직 푼 문제가 없어요.</p>
          <Link
            to="/weed"
            onClick={() => playSound("click")}
            className="ring-focus mt-4 inline-block rounded-xl bg-brand-500 px-6 py-3 font-bold text-white"
          >
            🌱 사고잡초 하러 가기
          </Link>
        </div>
      </Layout>
    );
  }

  const scenario = getWeedScenario(weedLast.scenarioId);
  if (!scenario) {
    return (
      <Layout title="📊 분석 결과" backTo="/weed" wide>
        <div className="mx-auto max-w-2xl p-6 text-center">
          <p className="font-bold text-slate-600">문제를 찾을 수 없어요.</p>
        </div>
      </Layout>
    );
  }

  const { correct, total } = weedLast;
  const perfect = correct >= total;
  const scenarioTitle = scenario.title;
  const scenarioLesson = scenario.lesson;
  const nextIndex = (WEED_SCENARIOS.findIndex((s) => s.id === scenario.id) + 1) % WEED_SCENARIOS.length;
  const nextScenario = WEED_SCENARIOS[nextIndex];

  async function send() {
    if (!scriptUrl || !student.number) {
      setSendState("fail");
      return;
    }
    playSound("click");
    setSending(true);
    const ok = await sendToSheet(scriptUrl, {
      number: student.number,
      name: student.name,
      kind: "weed",
      room: `사고잡초: ${scenarioTitle}`,
      score: `${correct}/${total}`,
      rate: `${Math.round((correct / total) * 100)}%`,
      memo: scenarioLesson,
    });
    setSending(false);
    setSendState(ok ? "done" : "fail");
  }

  return (
    <Layout title={`📊 ${perfect ? "완벽해요!" : "채점 결과"} ${correct}/${total}`} backTo="/weed" wide>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <section
          className={`card-surface rounded-2xl border-2 p-4 text-center shadow-sm ${
            perfect ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"
          }`}
          aria-label="점수"
        >
          <p className="text-4xl font-black" aria-live="polite">
            {perfect ? "🎉" : correct >= total / 2 ? "👍" : "💪"} {correct} / {total}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-600">{scenario.lesson}</p>
          {weedBest && (
            <p className="mt-1 text-xs font-bold text-brand-700">
              🏆 최고 {weedBest.correct}/{weedBest.total}
            </p>
          )}
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm" aria-label="카드별 채점">
          <h2 className="text-sm font-black">🔍 카드별 채점</h2>
          <ul className="mt-2 space-y-1.5">
            {scenario.cards.map((c) => {
              const placed = weedLast.placements[c.id] ?? "pool";
              const ok = placed === c.zone;
              const placedLabel =
                placed === "pool"
                  ? "보관함"
                  : placed === "flowers"
                    ? "꽃"
                    : placed === "conditions"
                      ? "조건 잎"
                      : placed === "actions"
                        ? "행동 잎"
                        : "뿌리";
              return (
                <li
                  key={c.id}
                  className={`rounded-xl border-2 p-2.5 text-sm font-bold ${
                    ok ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"
                  }`}
                >
                  <p>
                    {ok ? "✅" : "❌"} {weedLabel(c.zone, c.id)}
                  </p>
                  {!ok && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      둔 곳: {placedLabel} → 정답: {ZONE_META[c.zone].title}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm" aria-label="개선 제안">
          <h2 className="text-sm font-black">💡 뿌리를 줄이기 위한 제안</h2>
          <ul className="mt-2 space-y-1.5">
            {scenario.cards
              .filter((c) => c.zone === "roots")
              .map((c) => (
                <li key={c.id} className="rounded-xl bg-violet-50 p-2.5 text-sm font-bold text-violet-900">
                  {rootSuggestion(c.id)}
                </li>
              ))}
          </ul>
        </section>

        <GameImage
          src="/images/safety-helper/img_main_accident_weed.png"
          alt="완성된 사고잡초 예시"
          emoji="🌱"
          className="w-full rounded-2xl border-2 border-slate-200 object-contain"
        />

        {sendState === "done" && (
          <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-black text-emerald-700" role="status">
            ✅ 시트로 전송됐어요!
          </p>
        )}
        {sendState === "fail" && (
          <p className="rounded-xl bg-amber-50 p-3 text-center text-sm font-black text-amber-700" role="status">
            ⚠️ 전송할 수 없어요. 첫화면에서 학번·이름을 확인하고, 시트 연결은 선생님께 여쭤보세요.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              navigate(`/weed/build?scenario=${scenario.id}`);
            }}
            className="ring-focus flex-1 rounded-xl bg-brand-500 px-5 py-3 font-bold text-white transition hover:bg-brand-600"
          >
            🔄 다시 도전하기
          </button>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              navigate(`/weed/build?scenario=${nextScenario.id}`);
            }}
            className="ring-focus flex-1 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-600"
          >
            ➡️ 다음 사고: {nextScenario.title}
          </button>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="ring-focus flex-1 rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
          >
            {sending ? "전송 중..." : "📤 시트에 보내기"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
