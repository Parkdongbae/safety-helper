import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import { getWeedScenario } from "../data/weedScenarios";
import { weedLabel, type WeedZone } from "../data/weedCards";
import { useSafetyStore } from "../stores/safetyStore";
import { playSound } from "../utils/sound";

type SlotId = WeedZone | "pool";

const ZONES: { id: WeedZone; title: string; hint: string; box: string }[] = [
  { id: "flowers", title: "🌸 꽃 – 결과", hint: "무슨 일이 일어났나요?", box: "border-amber-400 bg-amber-50" },
  { id: "conditions", title: "🍃 왼쪽 잎 – 조건", hint: "환경·설비 문제는?", box: "border-sky-500 bg-sky-50" },
  { id: "actions", title: "🍃 오른쪽 잎 – 행동", hint: "사람의 행동 문제는?", box: "border-orange-500 bg-orange-50" },
  { id: "roots", title: "🌱 뿌리 – 근본 원인", hint: "조직·시스템 문제는?", box: "border-red-700 bg-red-50" },
];

function DragCard({
  cardId,
  label,
  selected,
  onTap,
}: {
  cardId: string;
  label: string;
  selected: boolean;
  onTap: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: cardId });
  return (
    <div
      ref={setNodeRef}
      aria-label={`카드 ${label} 선택`}
      onClick={onTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      style={{ transform: CSS.Translate.toString(transform), touchAction: "none" }}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-xl border-2 px-3 py-2.5 text-sm font-bold shadow-sm transition active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      } ${selected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500" : "border-slate-300 bg-white"}`}
    >
      {label}
    </div>
  );
}

function DropSlot({
  id,
  title,
  hint,
  box,
  selectedCount,
  onTap,
  children,
}: {
  id: SlotId;
  title?: string;
  hint?: string;
  box?: string;
  selectedCount?: number;
  onTap?: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-label={title ?? "카드 보관함"}
      onClick={onTap}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onTap) {
          e.preventDefault();
          onTap();
        }
      }}
      className={`min-h-20 rounded-2xl border-2 border-dashed p-2 transition ${
        box ?? "border-slate-300 bg-slate-50"
      } ${isOver ? "border-brand-500 bg-brand-100 ring-2 ring-brand-500" : ""}`}
    >
      {title && (
        <p className="text-xs font-black text-slate-600">
          {title} <span className="font-bold text-slate-400">· {selectedCount}장</span>
        </p>
      )}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/** 시나리오별 고정 셔플 (순수 함수 — 렌더 중 호출 안전) */
function shuffleBySeed(ids: string[], seed: string): string[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function WeedBuildPage() {
  const [params] = useSearchParams();
  const scenario = getWeedScenario(params.get("scenario") ?? undefined) ?? getWeedScenario("s-saw-cut")!;
  return <BuildBody key={scenario.id} scenarioId={scenario.id} />;
}

function BuildBody({ scenarioId }: { scenarioId: string }) {
  const navigate = useNavigate();
  const scenario = getWeedScenario(scenarioId)!;
  const recordWeedResult = useSafetyStore((s) => s.recordWeedResult);
  const setWeedLast = useSafetyStore((s) => s.setWeedLast);

  // 카드 순서 섞기 (시나리오별 고정)
  const order = useMemo(() => shuffleBySeed(scenario.cards.map((c) => c.id), scenario.id), [scenario]);
  const [placements, setPlacements] = useState<Record<string, SlotId>>(() =>
    Object.fromEntries(scenario.cards.map((c) => [c.id, "pool"])),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const suppressClickRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  function place(cardId: string, slot: SlotId) {
    setPlacements((p) => ({ ...p, [cardId]: slot }));
  }

  function handleDragStart(_e: DragStartEvent) {
    playSound("click");
  }

  function handleDragEnd(e: DragEndEvent) {
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 250);
    setSelectedId(null);
    const { active, over } = e;
    if (over && ["pool", "flowers", "conditions", "actions", "roots"].includes(String(over.id))) {
      playSound("click");
      place(String(active.id), over.id as SlotId);
    }
  }

  function handleCardTap(cardId: string) {
    // 드래그 직후 click 무시
    if (suppressClickRef.current) return;
    playSound("click");
    setSelectedId((s) => (s === cardId ? null : cardId));
  }

  function handleSlotTap(slot: SlotId) {
    if (!selectedId) return;
    playSound("click");
    place(selectedId, slot);
    setSelectedId(null);
  }

  const cardZoneOf = (id: string): WeedZone => scenario.cards.find((c) => c.id === id)!.zone;
  const placedCount = Object.values(placements).filter((v) => v !== "pool").length;
  const allPlaced = placedCount >= scenario.cards.length;

  function check() {
    playSound("click");
    let correct = 0;
    for (const c of scenario.cards) {
      if (placements[c.id] === c.zone) correct++;
    }
    recordWeedResult(scenario.id, scenario.title, correct, scenario.cards.length);
    setWeedLast({ scenarioId: scenario.id, placements: { ...placements }, correct, total: scenario.cards.length });
    navigate("/weed/result");
  }

  return (
    <Layout title={`🌱 ${scenario.title}`} backTo="/weed" wide>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-black text-slate-500">📖 사건 상황</p>
            <p className="mt-1 font-bold leading-relaxed">{scenario.situation}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">
              카드를 끌어다 알맞은 자리에 놓으세요. 탭해서 고르고 자리를 탭해도 돼요. ({placedCount}/{scenario.cards.length}장 배치됨)
            </p>
          </section>

          <GameImage
            src="/images/safety-helper/img_main_accident_weed_quiz_template.png"
            alt="빈 사고잡초 틀: 꽃·잎·뿌리 자리"
            emoji="🌱"
            className="w-full rounded-2xl border-2 border-slate-200 object-contain"
          />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ZONES.map((z) => (
              <DropSlot
                key={z.id}
                id={z.id}
                title={z.title}
                hint={z.hint}
                box={z.box}
                selectedCount={Object.entries(placements).filter(([, v]) => v === z.id).length}
                onTap={() => handleSlotTap(z.id)}
              >
                {scenario.cards
                  .filter((c) => placements[c.id] === z.id)
                  .map((c) => (
                    <DragCard
                      key={c.id}
                      cardId={c.id}
                      label={weedLabel(c.zone, c.id)}
                      selected={selectedId === c.id}
                      onTap={() => handleCardTap(c.id)}
                    />
                  ))}
              </DropSlot>
            ))}
          </div>

          <DropSlot id="pool" onTap={() => handleSlotTap("pool")}>
            <span className="w-full text-xs font-black text-slate-400">🃏 카드 보관함 (여기로 돌려놓을 수 있어요)</span>
            {order
              .filter((id) => placements[id] === "pool")
              .map((id) => (
                <DragCard
                  key={id}
                  cardId={id}
                  label={weedLabel(cardZoneOf(id), id)}
                  selected={selectedId === id}
                  onTap={() => handleCardTap(id)}
                />
              ))}
          </DropSlot>

          <button
            type="button"
            disabled={!allPlaced}
            onClick={check}
            className="ring-focus rounded-xl bg-brand-500 px-6 py-3 font-bold text-white transition enabled:hover:bg-brand-600 disabled:opacity-40"
          >
            {allPlaced ? "✅ 정답 확인하기" : `카드를 모두 놓으세요 (${placedCount}/${scenario.cards.length})`}
          </button>
        </div>
      </DndContext>
    </Layout>
  );
}
