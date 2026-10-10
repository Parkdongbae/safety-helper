import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { GameImage } from "../components/GameImage";
import {
  drawSafetyQuizQuestions,
  type SafetyQuizQuestion,
} from "../data/safetyQuiz";
import {
  SAFETY_SCENE_EMOJI,
  safetySceneImage,
  safetyScenes,
} from "../data/safetyScenes";
import { useSafetyStore } from "../stores/safetyStore";
import { isTeacherAccount } from "../data/setupGuide";
import { sendToSheet } from "../utils/sendToSheet";
import { playSound } from "../utils/sound";
import { useCountdown } from "../utils/useCountdown";

const GAME_SECONDS = 90;
const FEEDBACK_MS = 1100;

type Phase = "intro" | "playing" | "result";

export function SafetyQuizPage() {
  const navigate = useNavigate();
  const student = useSafetyStore((s) => s.student);
  const scriptUrl = useSafetyStore((s) => s.scriptUrl);
  const recordQuiz = useSafetyStore((s) => s.recordQuiz);
  const reduceMotion = useSafetyStore((s) => s.settings.reduceMotion);

  const [phase, setPhase] = useState<Phase>("intro");
  const [quiz, setQuiz] = useState<SafetyQuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [sent, setSent] = useState(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useCountdown(GAME_SECONDS, () => setPhase("result"));
  const { remaining } = timer;

  useEffect(() => () => {
    if (feedbackTimer.current !== null) clearTimeout(feedbackTimer.current);
  }, []);

  const question = quiz[index % Math.max(quiz.length, 1)];
  const scene = question ? safetyScenes.find((s) => s.id === question.sceneId) : undefined;

  // 결과 화면 진입 시 1회 기록 + 전송
  useEffect(() => {
    if (phase !== "result" || quiz.length === 0 || sent) return;
    setSent(true);
    recordQuiz(correct, quiz.length);
    if (scriptUrl && student.number) {
      void sendToSheet(scriptUrl, {
        number: student.number,
        name: student.name,
        kind: "quiz",
        room: "안전 퀴즈",
        score: `${correct}/${quiz.length}`,
        rate: `${quiz.length === 0 ? 0 : Math.round((correct / quiz.length) * 100)}%`,
        memo: `오답 ${wrong}개`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const answer = useCallback(
    (saidSafe: boolean) => {
      if (!scene || feedback) return;
      const isCorrect = saidSafe === scene.isSafe;
      if (isCorrect) {
        playSound("correct");
        setCorrect((c) => c + 1);
      } else {
        playSound("wrong");
        setWrong((w) => w + 1);
      }
      setFeedback(isCorrect ? "correct" : "wrong");
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        setIndex((i) => i + 1);
      }, reduceMotion ? 300 : FEEDBACK_MS);
    },
    [scene, feedback, reduceMotion],
  );

  function startGame() {
    playSound("click");
    setQuiz(drawSafetyQuizQuestions());
    setIndex(0);
    setCorrect(0);
    setWrong(0);
    setFeedback(null);
    setSent(false);
    setPhase("playing");
    timer.start();
  }

  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Layout title="📝 안전 퀴즈" backTo="/" wide>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        {phase === "intro" && (
          <section className="card-surface w-full rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-lg font-black">그림을 보고 안전·위험을 판단하세요!</p>
            <p className="mt-2 text-sm text-slate-600">
              90초 동안 24장면을 판단해요. 결과는 선생님 시트로 자동 전송돼요.
              {!student.number && (
                <span className="mt-1 block font-bold text-amber-600">
                  학번·이름이 없으면 기록만 저장돼요. 첫화면에서 입력하세요.
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="ring-focus mt-5 rounded-xl bg-red-500 px-8 py-3 text-lg font-bold text-white transition hover:bg-red-600"
            >
              게임 시작 ⏱️
            </button>
          </section>
        )}

        {phase === "playing" && scene && (
          <section className="w-full" aria-label="안전 퀴즈 진행">
            <div className="mb-3 flex items-center justify-between text-sm font-bold">
              <span
                className={`rounded-lg px-2.5 py-1 ${remaining <= 10 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                role="timer"
              >
                ⏱️ 남은 시간: {Math.ceil(remaining)}초
              </span>
              <span className="text-slate-500">장면 {index + 1}</span>
              <span className="text-brand-700" aria-live="polite">
                정답 {correct}개
              </span>
            </div>
            {!reduceMotion && (
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
                <div
                  className={`h-full ${remaining <= 10 ? "bg-red-500" : "bg-brand-500"} ft-gauge-live`}
                  style={{ width: `${(remaining / GAME_SECONDS) * 100}%` }}
                />
              </div>
            )}

            <div
              className={`card-surface rounded-2xl border-2 p-5 text-center shadow-sm ${
                feedback
                  ? feedback === "correct"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-red-400 bg-red-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <GameImage
                src={safetySceneImage(scene, question.variant)}
                alt="안전 판단 장면 그림"
                emoji={SAFETY_SCENE_EMOJI[scene.id] ?? "🦺"}
                className="mx-auto h-88 w-full max-w-xl rounded-xl bg-white object-contain"
              />
              <p className="mt-3 text-xl font-black leading-relaxed">"{scene.description}"</p>
              {feedback && (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm">
                  <p className={`font-black ${feedback === "correct" ? "text-emerald-700" : "text-red-700"}`}>
                    {feedback === "correct" ? "✅ 정답!" : "❌ 아쉬워요!"}
                  </p>
                  <p className="mt-1 font-bold text-slate-700">
                    {scene.isSafe ? "이 장면은 안전해요." : "이 장면은 위험해요."} {scene.correctReason}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={feedback !== null}
                onClick={() => answer(true)}
                className="ring-focus rounded-xl border-2 border-emerald-500 bg-emerald-50 px-4 py-5 text-lg font-black text-emerald-800 transition enabled:hover:bg-emerald-100 disabled:opacity-60"
              >
                ✅ 안전한 장면
              </button>
              <button
                type="button"
                disabled={feedback !== null}
                onClick={() => answer(false)}
                className="ring-focus rounded-xl border-2 border-red-500 bg-red-50 px-4 py-5 text-lg font-black text-red-800 transition enabled:hover:bg-red-100 disabled:opacity-60"
              >
                ⚠️ 위험한 장면
              </button>
            </div>
          </section>
        )}

        {phase === "result" && (
          <section className="card-surface w-full rounded-2xl border-2 border-slate-200 bg-white p-6 text-center shadow-sm" aria-label="게임 결과">
            <GameImage
              src="/images/safety-helper/quiz-complete.jpg"
              alt="퀴즈 완료 축하"
              emoji="🎉"
              className="mx-auto h-32 w-32 rounded-full object-cover"
            />
            <h2 className="mt-2 text-2xl font-black">📝 안전 퀴즈 결과</h2>
            <dl className="mx-auto mt-4 grid max-w-md grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-emerald-50 p-3">
                <dt className="text-xs font-bold text-slate-500">정답</dt>
                <dd className="text-2xl font-black text-emerald-600">{correct}</dd>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <dt className="text-xs font-bold text-slate-500">오답</dt>
                <dd className="text-2xl font-black text-red-600">{wrong}</dd>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <dt className="text-xs font-bold text-slate-500">정답률</dt>
                <dd className="text-2xl font-black text-amber-600">{accuracy}%</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm font-bold text-slate-500">
              {scriptUrl && student.number
                ? "📤 선생님 시트로 전송됐어요."
                : "⚠️ 학번·이름 또는 시트 주소가 없어 기기에만 저장됐어요."}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={startGame}
                className="ring-focus rounded-xl bg-brand-500 px-5 py-2.5 font-bold text-white transition hover:bg-brand-600"
              >
                🔄 다시 도전하기
              </button>
              <Link
                to="/"
                onClick={() => playSound("click")}
                className="ring-focus rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                🏠 홈으로
              </Link>
              {isTeacherAccount(student.number, student.name) && (
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  navigate("/teacher");
                }}
                className="ring-focus rounded-xl bg-slate-200 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-300"
              >
                🧑‍🏫 교사용
              </button>
              )}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
