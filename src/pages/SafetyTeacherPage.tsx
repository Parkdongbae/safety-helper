import { useState } from "react";
import QRCode from "react-qr-code";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import { rooms } from "../data/rooms";
import { safetyChecks } from "../data/safetyCheck";
import { titleFor } from "../data/checkCheers";
import { SETUP_GUIDE } from "../data/setupGuide";
import { safetyScenes, SAFETY_SCENE_EMOJI } from "../data/safetyScenes";
import { SAFETY_IMAGE_FILES } from "../data/safetyImageManifest";
import { classLabel } from "../types";
import { useSafetyStore } from "../stores/safetyStore";
import { sendToSheet, readFromSheet, type SheetRow } from "../utils/sendToSheet";
import { buildStudentUrl } from "../utils/sheetParams";
import { playSound } from "../utils/sound";

export function SafetyTeacherPage() {
  const student = useSafetyStore((s) => s.student);
  const setStudent = useSafetyStore((s) => s.setStudent);
  const scriptUrl = useSafetyStore((s) => s.scriptUrl);
  const setScriptUrl = useSafetyStore((s) => s.setScriptUrl);
  const checks = useSafetyStore((s) => s.checks);
  const quizBest = useSafetyStore((s) => s.quizBest);
  const quizCount = useSafetyStore((s) => s.quizCount);
  const checkCompletions = useSafetyStore((s) => s.checkCompletions);
  const weedRecords = useSafetyStore((s) => s.weedRecords);
  const deleteWeedRecord = useSafetyStore((s) => s.deleteWeedRecord);
  const resetAll = useSafetyStore((s) => s.resetAll);

  const [number, setNumber] = useState(student.number);
  const [name, setName] = useState(student.name);
  const [url, setUrl] = useState(scriptUrl);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);
  const classes = useSafetyStore((s) => s.classes);
  const addClass = useSafetyStore((s) => s.addClass);
  const deleteClass = useSafetyStore((s) => s.deleteClass);
  const [grade, setGrade] = useState("");
  const [classNo, setClassNo] = useState("");
  const [qrClassId, setQrClassId] = useState("");
  const [qrZoom, setQrZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<SheetRow[] | null>(null);
  const [recordFilter, setRecordFilter] = useState("");
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState(false);

  const studentUrl = scriptUrl
    ? buildStudentUrl(
        window.location.origin,
        scriptUrl,
        qrClassId,
        classes.find((c) => c.id === qrClassId) ? classLabel(classes.find((c) => c.id === qrClassId)!) : "",
      )
    : "";

  async function loadRecords() {
    if (!scriptUrl) {
      setRecordsError(true);
      return;
    }
    playSound("click");
    setLoadingRecords(true);
    setRecordsError(false);
    try {
      const rows = await readFromSheet(scriptUrl);
      setRecords(rows);
    } catch {
      setRecordsError(true);
    }
    setLoadingRecords(false);
  }

  function save() {
    playSound("click");
    setStudent({ number: number.trim(), name: name.trim() });
    setScriptUrl(url.trim());
    setSaved(true);
    setTestResult(null);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function addClassEntry() {
    if (!grade.trim() || !classNo.trim()) return;
    playSound("click");
    addClass(grade, classNo);
    setGrade("");
    setClassNo("");
  }

  async function testSend() {
    if (!url.trim()) {
      setTestResult("fail");
      return;
    }
    playSound("click");
    setTesting(true);
    const ok = await sendToSheet(url.trim(), {
      number: number.trim() || "테스트",
      name: name.trim() || "연결 테스트",
      kind: "quiz",
      room: "연결 테스트",
      score: "0/0",
      rate: "0%",
      memo: "시트 연결 테스트",
    });
    setTesting(false);
    setTestResult(ok ? "ok" : "fail");
  }

  return (
    <Layout title="🧑‍🏫 교사용" backTo="/" wide>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <GameImage
          src="/images/safety-helper/teacher-guide.jpg"
          alt="시트에서 학생 기록을 확인하는 선생님"
          emoji="🧑‍🏫"
          className="h-44 w-full rounded-2xl border-2 border-slate-200 object-cover shadow-sm"
        />
        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="학생 정보">
          <h2 className="text-lg font-black">1️⃣ 학생 정보</h2>
          <p className="mt-1 text-sm text-slate-600">시트에 기록될 학번·이름이에요. 공용 기기에서는 수업 끝난 뒤 지워주세요.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-700">
              학번
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="예: 30101"
                maxLength={10}
                className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-700">
              이름
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김안전"
                maxLength={10}
                className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              />
            </label>
          </div>
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="시트 연결">
          <h2 className="text-lg font-black">2️⃣ 구글 시트 연결</h2>
          <p className="mt-1 text-sm text-slate-600">
            선생님이 배포한 Apps Script 웹앱 URL을 입력하세요. 설정 방법은 <b>APPS_SCRIPT_SETUP.md</b> 참고.
          </p>
          <label className="mt-3 flex flex-col gap-1 text-sm font-bold text-slate-700">
            웹앱 URL
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/.../exec"
              inputMode="url"
              className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            />
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={save}
              className="ring-focus flex-1 rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white transition hover:bg-brand-600"
            >
              💾 저장{saved ? "됨! ✅" : "하기"}
            </button>
            <button
              type="button"
              disabled={testing}
              onClick={testSend}
              className="ring-focus flex-1 rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
            >
              {testing ? "테스트 중..." : "📡 연결 테스트"}
            </button>
          </div>
          {testResult === "ok" && (
            <p className="mt-2 rounded-xl bg-emerald-50 p-2.5 text-center text-sm font-black text-emerald-700" role="status">
              ✅ 시트에 테스트 행이 추가됐어요!
            </p>
          )}
          {testResult === "fail" && (
            <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-center text-sm font-black text-red-700" role="status">
              ❌ 전송 실패. URL과 인터넷 연결을 확인하세요.
            </p>
          )}
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="학년 반 관리">
          <h2 className="text-lg font-black">3️⃣ 학년·반 관리</h2>
          <p className="mt-1 text-sm text-slate-600">수업하는 학반을 등록하세요. 학생 접속 주소·기록 조회에 쓰입니다.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-700">
              학년
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="예: 3"
                maxLength={5}
                inputMode="numeric"
                className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold text-slate-700">
              반
              <input
                value={classNo}
                onChange={(e) => setClassNo(e.target.value)}
                placeholder="예: 1"
                maxLength={5}
                inputMode="numeric"
                className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={addClassEntry}
            className="ring-focus mt-2 w-full rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white transition hover:bg-brand-600"
          >
            ➕ 학반 추가하기
          </button>
          {classes.length > 0 && (
            <ul className="mt-2 space-y-1">
              {classes.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700">
                  <span>🏫 {classLabel(c)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      if (window.confirm(`${classLabel(c)}을(를) 삭제할까요?`)) deleteClass(c.id);
                    }}
                    className="ring-focus font-bold text-red-500 underline"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="학생 접속 주소와 QR코드">
          <h2 className="text-lg font-black">4️⃣ 학생 접속 주소·QR코드</h2>
          <p className="mt-1 text-sm text-slate-600">
            웹앱 URL을 저장하면 학생용 접속 주소가 만들어져요. 주소나 QR로 들어오면 시트 주소·학반이 자동 저장되어 바로 기록됩니다.
          </p>
          {!scriptUrl ? (
            <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-center text-sm font-black text-amber-700">
              먼저 2️⃣에서 웹앱 URL을 저장하세요.
            </p>
          ) : (
            <>
              <label className="mt-3 flex flex-col gap-1 text-sm font-bold text-slate-700">
                QR에 담을 학반
                <select
                  value={qrClassId}
                  onChange={(e) => {
                    playSound("click");
                    setQrClassId(e.target.value);
                  }}
                  className="ring-focus rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
                >
                  <option value="">학반 지정 안 함</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {classLabel(c)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-2 break-all rounded-xl bg-slate-50 p-2.5 text-xs font-medium text-slate-600">
                {studentUrl}
              </p>
              <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setQrZoom(true);
                  }}
                  aria-label="QR코드 확대하기"
                  className="ring-focus rounded-2xl border-2 border-slate-200 bg-white p-3"
                >
                  <QRCode value={studentUrl} size={160} />
                </button>
                <div className="flex flex-1 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      void navigator.clipboard?.writeText(studentUrl).then(() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                      });
                    }}
                    className="ring-focus rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300"
                  >
                    🔗 {copied ? "복사됨! ✅" : "주소 복사하기"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setQrZoom(true);
                    }}
                    className="ring-focus rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300"
                  >
                    🔍 QR 확대하기
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="학반 기록 보기">
          <h2 className="text-lg font-black">5️⃣ 학반 기록 보기</h2>
          <p className="mt-1 text-sm text-slate-600">시트에 쌓인 기록을 바로 확인해요. (스크립트에 읽기 기능이 필요 — 3️⃣ 설정 안내 참고)</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={recordFilter}
              onChange={(e) => {
                playSound("click");
                setRecordFilter(e.target.value);
              }}
              aria-label="학반 필터"
              className="ring-focus flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-medium"
            >
              <option value="">전체 학반</option>
              {classes.map((c) => (
                <option key={c.id} value={classLabel(c)}>
                  {classLabel(c)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={loadingRecords || !scriptUrl}
              onClick={loadRecords}
              className="ring-focus rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white transition enabled:hover:bg-brand-600 disabled:opacity-50"
            >
              {loadingRecords ? "불러오는 중..." : "📥 기록 불러오기"}
            </button>
          </div>
          {recordsError && (
            <p className="mt-2 rounded-xl bg-red-50 p-2.5 text-center text-sm font-black text-red-700" role="status">
              ❌ 불러오기 실패. URL·배포 설정(읽기 코드 포함)을 확인하세요.
            </p>
          )}
          {records && (
            <div className="mt-2 overflow-x-auto">
              {(() => {
                const shown = recordFilter ? records.filter((r) => r.className === recordFilter) : records;
                if (shown.length === 0) {
                  return <p className="py-3 text-center text-sm font-bold text-slate-400">표시할 기록이 없어요.</p>;
                }
                return (
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead>
                      <tr className="font-black text-slate-500">
                        <th className="px-2 py-1.5">학번</th>
                        <th className="px-2 py-1.5">이름</th>
                        <th className="px-2 py-1.5">학반</th>
                        <th className="px-2 py-1.5">종류</th>
                        <th className="px-2 py-1.5">점수</th>
                        <th className="px-2 py-1.5">일시</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.slice(0, 100).map((r, i) => (
                        <tr key={`${r.receivedAt}-${r.number}-${i}`} className="border-t border-slate-100 font-medium text-slate-700">
                          <td className="px-2 py-1.5">{r.number}</td>
                          <td className="px-2 py-1.5">{r.name}</td>
                          <td className="px-2 py-1.5">{r.className || "-"}</td>
                          <td className="px-2 py-1.5">{r.kind} {r.room}</td>
                          <td className="px-2 py-1.5">{r.score} {r.rate && r.rate !== "-" ? `(${r.rate})` : ""}</td>
                          <td className="px-2 py-1.5">{r.receivedAt ? r.receivedAt.slice(0, 16).replace("T", " ") : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          )}
        </section>

        {qrZoom && studentUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="QR코드 확대"
            onClick={() => setQrZoom(false)}
          >
            <div
              className="rounded-3xl bg-white p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <QRCode value={studentUrl} size={300} />
              <p className="mt-3 max-w-[300px] break-all text-xs font-medium text-slate-500">{studentUrl}</p>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setQrZoom(false);
                }}
                className="ring-focus mt-4 w-full rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="구글 시트 설정 안내">
          <h2 className="text-lg font-black">6️⃣ 구글 시트 설정 안내</h2>
          <p className="mt-1 text-sm text-slate-600">1회 5분 설정으로 끝나요. 아래 순서대로 따라하세요.</p>
          <div className="mt-3 flex flex-col gap-3">
            {SETUP_GUIDE.map((step) => (
              <div key={step.title} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-black text-slate-800">{step.title}</p>
                <ul className="mt-1.5 space-y-1">
                  {step.body.map((line) => (
                    <li key={line} className="text-xs leading-relaxed text-slate-600">
                      • {line}
                    </li>
                  ))}
                </ul>
                {step.code && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-800 p-3 text-left text-[11px] leading-relaxed text-emerald-200">
                    {step.code}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="게시용 포스터">
          <h2 className="text-lg font-black">7️⃣ 교실 게시용 포스터</h2>
          <p className="mt-1 text-sm text-slate-600">각 실에 인쇄해서 붙이세요. 그림을 길게 누르면 저장할 수 있어요.</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { src: "/images/safety-helper/poster-tech.jpg", alt: "기술실 안전 포스터" },
              { src: "/images/safety-helper/poster-imagine.jpg", alt: "무한상상실 안전 포스터" },
              { src: "/images/safety-helper/poster-maker.jpg", alt: "메이커실 안전 포스터" },
            ].map((p) => (
              <div key={p.src} className="flex flex-col gap-1.5">
                <GameImage
                  src={p.src}
                  alt={p.alt}
                  emoji="🖼️"
                  className="w-full rounded-xl border-2 border-slate-200 object-contain"
                />
                <a
                  href={p.src}
                  download=""
                  onClick={() => playSound("click")}
                  className="ring-focus rounded-xl bg-slate-200 px-3 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-300"
                >
                  ⬇️ 저장하기
                </a>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              window.print();
            }}
            className="ring-focus mt-3 w-full rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300"
          >
            🖨️ 이 페이지 인쇄하기
          </button>
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="안전 퀴즈 사진 보기">
          <h2 className="text-lg font-black">8️⃣ 안전 퀴즈 사진 ({safetyScenes.length}장면)</h2>
          <p className="mt-1 text-sm text-slate-600">퀴즈에 나오는 장면 사진이에요. 수업 자료·게시용으로 저장하세요.</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {safetyScenes.map((scene) => {
              const file = SAFETY_IMAGE_FILES[scene.id]?.[0];
              if (!file) return null;
              const src = `/images/safety/${file}`;
              return (
                <div key={scene.id} className="flex flex-col gap-1.5">
                  <GameImage
                    src={src}
                    alt={scene.description}
                    emoji={SAFETY_SCENE_EMOJI[scene.id] ?? "🦺"}
                    className="w-full rounded-xl border-2 border-slate-200 object-contain"
                  />
                  <p className="text-[11px] font-bold leading-snug text-slate-600">
                    {scene.isSafe ? "✅" : "⚠️"} {scene.description}
                  </p>
                  <a
                    href={src}
                    download=""
                    onClick={() => playSound("click")}
                    className="ring-focus rounded-xl bg-slate-200 px-3 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-300"
                  >
                    ⬇️ 저장하기
                  </a>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card-surface rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm" aria-label="내 기록">
          <h2 className="text-lg font-black">9️⃣ 이 기기의 기록</h2>
          <ul className="mt-2 space-y-1 text-sm font-bold text-slate-700">
            {rooms.map((room) => (
              <li key={room.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                <span>{room.emoji} {room.name} 점검</span>
                <span>{checks[room.id].length} / {safetyChecks[room.id].length}</span>
              </li>
            ))}
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
              <span>📝 안전 퀴즈 (도전 {quizCount}회)</span>
              <span>{quizBest ? `최고 ${quizBest.correct}/${quizBest.total}` : "기록 없음"}</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
              <span>🏅 안전 칭호</span>
              <span>{titleFor(checkCompletions)} (완료 {checkCompletions}회)</span>
            </li>
            <li className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
              <span>🌱 사고잡초 분석</span>
              <span>{weedRecords.length > 0 ? `${weedRecords.length}건 저장됨` : "기록 없음"}</span>
            </li>
          </ul>
          {weedRecords.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {weedRecords.slice(0, 5).map((r) => (
                <li key={r.id} className="rounded-xl bg-emerald-50/60 p-2.5 text-xs">
                  <p className="font-black text-slate-700">
                    🌱 {r.scenarioTitle} · {r.correct}/{r.total}점
                  </p>
                  <p className="mt-0.5 text-slate-500">{r.createdAt.slice(0, 10)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      playSound("click");
                      if (window.confirm("이 분석 기록을 삭제할까요?")) deleteWeedRecord(r.id);
                    }}
                    className="ring-focus mt-1 font-bold text-red-500 underline"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => {
              playSound("click");
              if (window.confirm("이 기기의 점검·퀴즈·사고잡초 기록을 모두 지울까요?")) resetAll();
            }}
            className="ring-focus mt-3 w-full rounded-xl bg-red-100 px-5 py-2.5 font-bold text-red-700 transition hover:bg-red-200"
          >
            🗑️ 기록 초기화 (공용 기기 수업 종료용)
          </button>
        </section>
      </div>
    </Layout>
  );
}
