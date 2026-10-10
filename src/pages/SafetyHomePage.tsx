import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import { rooms } from "../data/rooms";
import { safetyChecks } from "../data/safetyCheck";
import { titleFor } from "../data/checkCheers";
import { isTeacherAccount } from "../data/setupGuide";
import { classLabel } from "../types";
import { useSafetyStore } from "../stores/safetyStore";
import { playSound } from "../utils/sound";
import { parseStudentParams } from "../utils/sheetParams";

export function SafetyHomePage() {
  const student = useSafetyStore((s) => s.student);
  const setStudent = useSafetyStore((s) => s.setStudent);
  const scriptUrl = useSafetyStore((s) => s.scriptUrl);
  const setScriptUrl = useSafetyStore((s) => s.setScriptUrl);
  const classes = useSafetyStore((s) => s.classes);
  const studentClassId = useSafetyStore((s) => s.studentClassId);
  const setStudentClassId = useSafetyStore((s) => s.setStudentClassId);
  const studentClassName = useSafetyStore((s) => s.studentClassName);
  const setStudentClassName = useSafetyStore((s) => s.setStudentClassName);
  const checks = useSafetyStore((s) => s.checks);
  const quizBest = useSafetyStore((s) => s.quizBest);
  const checkCompletions = useSafetyStore((s) => s.checkCompletions);
  const weedCount = useSafetyStore((s) => s.weedRecords.length);

  const [number, setNumber] = useState(student.number);
  const [name, setName] = useState(student.name);
  const [saved, setSaved] = useState(false);
  const appliedParams = useRef(false);
  const linkedParams = useMemo(() => parseStudentParams(window.location.search), []);
  const viaLink = Boolean(linkedParams.sheet || linkedParams.classId || linkedParams.className);

  // 선생님 배포 주소(?sheet=&class=)로 들어오면 시트 URL·학반 자동 저장
  useEffect(() => {
    if (appliedParams.current) return;
    appliedParams.current = true;
    const p = linkedParams;
    if (p.sheet) setScriptUrl(p.sheet);
    if (p.classId) setStudentClassId(p.classId);
    if (p.className) setStudentClassName(p.className);
  }, [linkedParams, setScriptUrl, setStudentClassId, setStudentClassName]);

  const room = rooms[0];
  const total = safetyChecks[room.id].length;
  const done = checks[room.id].length;
  const complete = done >= total;

  function saveStudent() {
    playSound("click");
    setStudent({ number: number.trim(), name: name.trim() });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Layout title="🦺 실습실 안전 도우미" background="/images/game/연결실험실배경.jpg" wide>
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 py-2">
        <div className="text-center">
          <GameImage
            src="/images/safety-helper/safety-mascot.jpg"
            alt="안전 도우미 마스코트"
            emoji="🦺"
            className="mx-auto h-36 w-36 rounded-full border-4 border-white bg-white object-cover shadow-lg"
          />
          <h2 className="mt-1 text-2xl font-black text-slate-800 sm:text-3xl">
            실습실 안전점검
          </h2>
          <p className="mt-1 font-semibold text-slate-600">
            기술실 · 무한상상실 · 메이커실 수업 전 안전 점검을 하고, 퀴즈로 확인해요!
          </p>
          <p className="mt-1 text-sm font-bold text-brand-700" aria-live="polite">
            🏅 {titleFor(checkCompletions)} · 점검 {done} / {total}
            {quizBest && <span> · 퀴즈 최고 {quizBest.correct}/{quizBest.total}</span>}
          </p>
        </div>

        <section className="card-surface w-full max-w-md rounded-2xl border-2 border-slate-200 bg-white/95 p-4 shadow-sm" aria-label="학번·이름 입력">
          <h3 className="text-sm font-black text-slate-700">🧑‍🎓 학번·이름 (시트 기록용)</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="학번 (예: 30101)"
              maxLength={10}
              aria-label="학번"
              className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름 (예: 김안전)"
              maxLength={10}
              aria-label="이름"
              className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            />
          </div>
          {viaLink && (
            <p className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700" role="status">
              ✅ 선생님 링크로 접속했어요. 학번·이름만 입력하면 기록이 전송돼요!
            </p>
          )}
          <button
            type="button"
            onClick={saveStudent}
            className="ring-focus mt-2 w-full rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white transition hover:bg-brand-600"
          >
            💾 저장{saved ? "됨! ✅" : "하기"}
          </button>
          {classes.length > 0 ? (
            <label className="mt-2 flex flex-col gap-1 text-sm font-bold text-slate-700">
              학반
              <select
                value={studentClassId}
                onChange={(e) => {
                  playSound("click");
                  setStudentClassId(e.target.value);
                }}
                aria-label="학반 선택"
                className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              >
                <option value="">학반 선택 (선택 사항)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {classLabel(c)}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            studentClassName && (
              <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-bold text-slate-600">
                🏫 {studentClassName}
              </p>
            )
          )}
          {!student.number && (
            <p className="mt-1 text-center text-xs font-bold text-amber-600">
              학번·이름이 없으면 시트 전송이 안 돼요.
            </p>
          )}
        </section>

        <Link
          to={`/room/${room.id}`}
          onClick={() => playSound("click")}
          className="ring-focus card-surface flex w-full max-w-md flex-col overflow-hidden rounded-2xl border-2 border-emerald-500 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative">
            <GameImage
              src={room.image}
              alt={room.imageAlt}
              emoji={room.emoji}
              className="h-36 w-full object-cover"
            />
            {complete && (
              <GameImage
                src={room.badge}
                alt={`${room.name} 완료 배지`}
                emoji="🏅"
                className="absolute right-2 top-2 h-12 w-12 rounded-full border-2 border-white object-cover shadow"
              />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-4 text-center">
            <h3 className="text-lg font-black">
              <span aria-hidden="true">{room.emoji}</span> {room.name} 시작하기
            </h3>
            <p className="text-xs text-slate-500">{room.description}</p>
            <p className="text-sm font-bold text-brand-700">점검 {done}/{total}</p>
          </div>
        </Link>

        <nav className="grid w-full max-w-md grid-cols-1 gap-3" aria-label="도우미 메뉴">
          <Link
            to="/quiz"
            onClick={() => playSound("click")}
            className="ring-focus flex items-center gap-3 rounded-2xl border-2 border-brand-600 bg-brand-500 p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden="true">📝</span>
            <span>
              <span className="block text-lg font-black">안전 퀴즈</span>
              <span className="block text-xs text-brand-50">24문항 · 90초 · 그림 보고 판단</span>
            </span>
          </Link>
          <Link
            to="/weed"
            onClick={() => playSound("click")}
            className="ring-focus card-surface flex items-center gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden="true">🌱</span>
            <span>
              <span className="block text-lg font-black">사고잡초 분석</span>
              <span className="block text-xs text-slate-500">
                꽃·잎·뿌리로 원인 찾기{weedCount > 0 ? ` · ${weedCount}건 기록` : ""}
              </span>
            </span>
          </Link>
          {isTeacherAccount(student.number, student.name) && (
          <Link
            to="/teacher"
            onClick={() => playSound("click")}
            className="ring-focus card-surface flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white/95 p-4 text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-3xl" aria-hidden="true">🧑‍🏫</span>
            <span>
              <span className="block text-lg font-black">교사용</span>
              <span className="block text-xs text-slate-500">
                기록 확인{scriptUrl ? "" : " · 구글 시트 연결"}
              </span>
            </span>
          </Link>
          )}
        </nav>
      </div>
    </Layout>
  );
}
