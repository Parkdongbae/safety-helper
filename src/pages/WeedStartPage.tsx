import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import { WEED_SCENARIOS } from "../data/weedScenarios";
import { useSafetyStore } from "../stores/safetyStore";
import { playSound } from "../utils/sound";

export function WeedStartPage() {
  const weedBest = useSafetyStore((s) => s.weedBest);
  const weedPlays = useSafetyStore((s) => s.weedPlays);

  return (
    <Layout title="🌱 사고잡초 분석" backTo="/" wide>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <GameImage
          src="/images/safety-helper/img_main_accident_weed.png"
          alt="완성된 사고잡초 예시: 꽃·잎·뿌리"
          emoji="🌱"
          className="w-full rounded-2xl border-2 border-slate-200 object-contain shadow-sm"
        />

        <section className="card-surface w-full rounded-2xl border-2 border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-lg font-black">카드를 올바른 자리로 끌어다 놓으세요</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            사고 상황을 읽고, 결과(꽃)·조건·행동(잎)·근본 원인(뿌리) 카드를
            맞는 자리에 드래그하세요. 다 맞히면 진짜 사고잡초 완성!
          </p>
          {weedBest && (
            <p className="mt-2 text-sm font-bold text-brand-700" aria-live="polite">
              🏆 최고 {weedBest.correct}/{weedBest.total} · 도전 {weedPlays}회
            </p>
          )}
        </section>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2" role="list" aria-label="사고 상황 고르기">
          {WEED_SCENARIOS.map((s, i) => (
            <Link
              key={s.id}
              to={`/weed/build?scenario=${s.id}`}
              onClick={() => playSound("click")}
              role="listitem"
              className="ring-focus card-surface rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md"
            >
              <p className="text-xs font-black text-brand-600">사건 {i + 1} · 카드 {s.cards.length}장</p>
              <p className="mt-1 font-black">{s.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{s.situation}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
