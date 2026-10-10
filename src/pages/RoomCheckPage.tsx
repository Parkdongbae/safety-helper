import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import { getRoom } from "../data/rooms";
import { PHASE_LABELS, safetyChecks } from "../data/safetyCheck";
import { accidentGuides } from "../data/accidentGuide";
import { cheerFor, titleFor } from "../data/checkCheers";
import { isTeacherAccount } from "../data/setupGuide";
import { useSafetyStore } from "../stores/safetyStore";
import { sendToSheet } from "../utils/sendToSheet";
import { playSound } from "../utils/sound";
import type { CheckPhase, RoomId } from "../types";

const PHASES: CheckPhase[] = ["before", "during", "after"];

export function RoomCheckPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const room = getRoom(roomId);

  const student = useSafetyStore((s) => s.student);
  const scriptUrl = useSafetyStore((s) => s.scriptUrl);
  const checked = useSafetyStore((s) => (roomId ? s.checks[roomId as RoomId] : []));
  const toggleCheck = useSafetyStore((s) => s.toggleCheck);
  const clearRoom = useSafetyStore((s) => s.clearRoom);
  const checkCompletions = useSafetyStore((s) => s.checkCompletions);
  const recordCheckComplete = useSafetyStore((s) => s.recordCheckComplete);

  const [sendState, setSendState] = useState<"idle" | "sending" | "done" | "fail">("idle");
  const [stamp, setStamp] = useState<{ id: string; key: number } | null>(null);
  const celebratedRef = useRef(false);

  // 전 항목 체크 달성 시 1회: 폭죽 + 효과음 + 완료 횟수 기록
  useEffect(() => {
    if (!roomId) return;
    const total = safetyChecks[roomId as RoomId].length;
    const done = checked.length >= total;
    if (done && !celebratedRef.current) {
      celebratedRef.current = true;
      recordCheckComplete();
      playSound("success");
      confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 } });
    }
    if (!done) celebratedRef.current = false;
  }, [checked, roomId, recordCheckComplete]);

  if (!room) {
    return (
      <Layout title="안전 점검" backTo="/">
        <p className="p-6 text-center font-bold text-red-600">실습실을 찾을 수 없어요.</p>
      </Layout>
    );
  }

  const items = safetyChecks[room.id];
  const complete = checked.length >= items.length;
  const roomName = room.name;

  async function finish() {
    playSound("success");
    if (!scriptUrl || !student.number) {
      setSendState("fail");
      return;
    }
    setSendState("sending");
    const ok = await sendToSheet(scriptUrl, {
      number: student.number,
      name: student.name,
      kind: "check",
      room: roomName,
      score: `${checked.length}/${items.length}`,
      rate: `${Math.round((checked.length / items.length) * 100)}%`,
      memo: "안전점검 완료",
    });
    setSendState(ok ? "done" : "fail");
  }

  return (
    <Layout title={`${room.emoji} ${room.name}`} backTo="/" wide>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <GameImage
          src={room.image}
          alt={room.imageAlt}
          emoji={room.emoji}
          className="h-40 w-full rounded-2xl border-2 border-slate-200 object-cover shadow-sm"
        />

        <details className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-3">
          <summary
            className="ring-focus cursor-pointer text-center text-sm font-black text-indigo-800"
            onClick={() => playSound("click")}
          >
            📚 점검 전! 사고 유형 먼저 알아보기 (7가지)
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {accidentGuides.map((g) => (
              <article key={g.rank} className="rounded-xl border border-indigo-100 bg-white p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-black text-white">
                    {g.rank}
                  </span>
                  <h3 className="text-sm font-black text-slate-800">{g.title}</h3>
                </div>
                <GameImage
                  src={g.image}
                  alt={g.imageAlt}
                  emoji="⚠️"
                  className="mt-2 w-full rounded-lg object-contain"
                />
                <p className="mt-2 text-xs font-bold text-slate-600">💥 {g.cases}</p>
                <ul className="mt-1 space-y-0.5">
                  {g.prevention.map((p) => (
                    <li key={p} className="text-xs font-bold text-emerald-700">
                      ✅ {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </details>

        <div className="flex items-center gap-3 rounded-2xl border-2 border-brand-100 bg-brand-50 p-3">
          <GameImage
            src="/images/safety-helper/safety-mascot.jpg"
            alt="안전 도우미 마스코트"
            emoji="🦺"
            className="h-14 w-14 shrink-0 rounded-full border-2 border-white bg-white object-cover shadow"
          />
          <div className="min-w-0">
            <p className="text-sm font-black text-brand-800" aria-live="polite">
              {cheerFor(items.length === 0 ? 0 : checked.length / items.length, items.length - checked.length)}
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-500">
              🏅 내 칭호: {titleFor(checkCompletions)} (점검 완료 {checkCompletions}회)
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-slate-600" aria-live="polite">
            점검 {checked.length} / {items.length}
          </span>          <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(checked.length / items.length) * 100}%` }}
            />
          </div>
        </div>

        {PHASES.map((phase) => (
          <section key={phase} aria-label={PHASE_LABELS[phase]}>
            <h2 className="mb-1.5 text-sm font-black text-slate-700">{PHASE_LABELS[phase]}</h2>
            <ul className="flex flex-col gap-2">
              {items
                .filter((it) => it.phase === phase)
                .map((it) => {
                  const on = checked.includes(it.id);
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          playSound("click");
                          setSendState("idle");
                          if (!checked.includes(it.id)) setStamp({ id: it.id, key: Date.now() });
                          toggleCheck(room.id, it.id);
                        }}
                        className={`ring-focus flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left font-bold transition ${
                          on
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                        }`}
                      >
                        <span
                          key={stamp?.id === it.id ? stamp.key : "off"}
                          aria-hidden="true"
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm ${
                            on ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white"
                          } ${on && stamp?.id === it.id ? "anim-stamp" : ""}`}
                        >
                          {on ? "✓" : ""}
                        </span>
                        {it.text}
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}

        {complete && (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-center" aria-label="점검 완료 배지">
            <GameImage
              src={room.badge}
              alt={`${room.name} 점검 완료 배지`}
              emoji="🏅"
              className="mx-auto h-28 w-28 rounded-full object-cover"
            />
            <p className="mt-1 text-sm font-black text-amber-700">🏅 {room.name} 점검 완료!</p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              playSound("click");
              clearRoom(room.id);
              setSendState("idle");
            }}
            className="ring-focus rounded-xl bg-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-300"
          >
            ↩️ 다시 점검
          </button>
          <button
            type="button"
            disabled={!complete || sendState === "sending"}
            onClick={finish}
            className="ring-focus flex-1 rounded-xl bg-emerald-500 px-5 py-3 font-black text-white transition enabled:hover:bg-emerald-600 disabled:opacity-40"
          >
            {sendState === "sending" ? "전송 중..." : "✅ 점검 완료 · 선생님께 전송"}
          </button>
        </div>

        {sendState === "done" && (
          <p className="rounded-xl bg-emerald-50 p-3 text-center text-sm font-black text-emerald-700" role="status">
            ✅ 전송됐어요! 선생님 시트에서 확인하세요.
          </p>
        )}
        {sendState === "fail" && (
          <p className="rounded-xl bg-amber-50 p-3 text-center text-sm font-black text-amber-700" role="status">
            ⚠️ 전송할 수 없어요. 첫화면에서 학번·이름을 확인하고, 시트 연결은 선생님께 여쭤보세요.
            {isTeacherAccount(student.number, student.name) && (
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  navigate("/teacher");
                }}
                className="ring-focus ml-2 underline"
              >
                교사용으로 이동
              </button>
            )}
          </p>
        )}
      </div>
    </Layout>
  );
}
