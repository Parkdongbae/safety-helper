import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoomId, SchoolClass, Student, WeedRecord } from "../types";

export interface QuizBest {
  correct: number;
  total: number;
  date: string;
}

interface SafetyState {
  student: Student;
  scriptUrl: string;
  /** 방별 체크한 항목 ids */
  checks: Record<RoomId, string[]>;
  quizBest: QuizBest | null;
  quizCount: number;
  /** 점검 완료(전 항목 체크) 누적 횟수 → 안전 칭호용 */
  checkCompletions: number;
  /** 저장된 사고잡초 드래그 퀴즈 결과 목록 (최신순) */
  weedRecords: WeedRecord[];
  /** 사고잡초 최고 기록 */
  weedBest: QuizBest | null;
  weedPlays: number;
  /** 최근 플레이 결과 (결과 화면 표시용) */
  weedLast: { scenarioId: string; placements: Record<string, string>; correct: number; total: number } | null;
  settings: { sound: boolean; highContrast: boolean; reduceMotion: boolean };
  setStudent: (s: Student) => void;
  setScriptUrl: (url: string) => void;
  /** 교사 등록 학반 목록 */
  classes: SchoolClass[];
  /** 학생이 선택한 학반 id */
  studentClassId: string;
  /** 링크로 전달된 학반명 (기기 목록에 없어도 표시·전송용) */
  studentClassName: string;
  addClass: (grade: string, classNo: string) => void;
  deleteClass: (id: string) => void;
  setStudentClassId: (id: string) => void;
  setStudentClassName: (name: string) => void;
  toggleCheck: (room: RoomId, itemId: string) => void;
  clearRoom: (room: RoomId) => void;
  recordCheckComplete: () => void;
  recordWeedResult: (scenarioId: string, scenarioTitle: string, correct: number, total: number) => void;
  setWeedLast: (last: { scenarioId: string; placements: Record<string, string>; correct: number; total: number } | null) => void;
  deleteWeedRecord: (id: string) => void;
  recordQuiz: (correct: number, total: number) => void;
  setSettings: (patch: Partial<SafetyState["settings"]>) => void;
  resetAll: () => void;
}

const emptyChecks = (): Record<RoomId, string[]> => ({ lab: [] });

/** 로컬 저장되는 형태 */
interface SafetyPersisted {
  student: Student;
  scriptUrl: string;
  classes: SchoolClass[];
  studentClassId: string;
  studentClassName: string;
  checks: Record<RoomId, string[]>;
  quizBest: QuizBest | null;
  quizCount: number;
  checkCompletions: number;
  weedRecords: WeedRecord[];
  weedBest: QuizBest | null;
  weedPlays: number;
  weedLast: { scenarioId: string; placements: Record<string, string>; correct: number; total: number } | null;
  settings: { sound: boolean; highContrast: boolean; reduceMotion: boolean };
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set) => ({
      student: { number: "", name: "" },
      scriptUrl: "",
      checks: emptyChecks(),
      quizBest: null,
      quizCount: 0,
      checkCompletions: 0,
      weedRecords: [],
      weedBest: null,
      weedPlays: 0,
      weedLast: null,
      settings: { sound: false, highContrast: false, reduceMotion: false },

      setStudent: (student) => set({ student }),
      setScriptUrl: (scriptUrl) => set({ scriptUrl }),
      classes: [],
      studentClassId: "",
      studentClassName: "",
      addClass: (grade, classNo) =>
        set((state) => {
          const g = grade.trim();
          const c = classNo.trim();
          if (!g || !c) return {};
          if (state.classes.some((x) => x.grade === g && x.classNo === c)) return {};
          return { classes: [...state.classes, { id: `${Date.now()}`, grade: g, classNo: c }] };
        }),
      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((x) => x.id !== id),
          studentClassId: state.studentClassId === id ? "" : state.studentClassId,
        })),
      setStudentClassId: (id) => set({ studentClassId: id }),
      setStudentClassName: (name) => set({ studentClassName: name }),

      toggleCheck: (room, itemId) =>
        set((state) => {
          const list = state.checks[room];
          return {
            checks: {
              ...state.checks,
              [room]: list.includes(itemId) ? list.filter((id) => id !== itemId) : [...list, itemId],
            },
          };
        }),

      clearRoom: (room) =>
        set((state) => ({ checks: { ...state.checks, [room]: [] } })),

      recordQuiz: (correct, total) =>
        set((state) => {
          const best =
            !state.quizBest || correct > state.quizBest.correct
              ? { correct, total, date: new Date().toISOString() }
              : state.quizBest;
          return { quizBest: best, quizCount: state.quizCount + 1 };
        }),

      recordCheckComplete: () =>
        set((state) => ({ checkCompletions: state.checkCompletions + 1 })),

      recordWeedResult: (scenarioId, scenarioTitle, correct, total) =>
        set((state) => {
          const best =
            !state.weedBest || correct > state.weedBest.correct
              ? { correct, total, date: new Date().toISOString() }
              : state.weedBest;
          return {
            weedBest: best,
            weedPlays: state.weedPlays + 1,
            weedRecords: [
              {
                id: `${Date.now()}`,
                createdAt: new Date().toISOString(),
                scenarioId,
                scenarioTitle,
                correct,
                total,
              },
              ...state.weedRecords,
            ].slice(0, 50),
          };
        }),

      setWeedLast: (last) => set({ weedLast: last }),

      deleteWeedRecord: (id) =>
        set((state) => ({ weedRecords: state.weedRecords.filter((r) => r.id !== id) })),

      setSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),

      resetAll: () =>
        set({ checks: emptyChecks(), quizBest: null, quizCount: 0, checkCompletions: 0, weedRecords: [], weedBest: null, weedPlays: 0, weedLast: null }),
    }),
    {
      name: "safety-helper-progress",
      version: 3,
      migrate: (persisted: unknown): SafetyPersisted => {
        const state = (persisted ?? {}) as Partial<SafetyPersisted> & { checks?: Record<string, string[]> };
        const checks = (state.checks ?? {}) as Record<string, string[]>;
        // v1(tech/imagine/maker 3개실) → v2(lab 단일 실습실): 기존 체크를 합침
        // v2(자유 분석 기록) → v3(드래그 퀴즈 결과): 이전 기록은 초기화
        const merged: string[] = [...(checks.tech ?? []), ...(checks.imagine ?? []), ...(checks.maker ?? [])];
        return {
          student: state.student ?? { number: "", name: "" },
          scriptUrl: typeof state.scriptUrl === "string" ? state.scriptUrl : "",
          classes: Array.isArray(state.classes) ? state.classes : [],
          studentClassId: typeof state.studentClassId === "string" ? state.studentClassId : "",
          studentClassName: typeof state.studentClassName === "string" ? state.studentClassName : "",
          checks: { lab: [...new Set(merged)] },
          quizBest: state.quizBest ?? null,
          quizCount: typeof state.quizCount === "number" ? state.quizCount : 0,
          checkCompletions: typeof state.checkCompletions === "number" ? state.checkCompletions : 0,
          weedRecords: [],
          weedBest: null,
          weedPlays: 0,
          weedLast: null,
          settings: state.settings ?? { sound: false, highContrast: false, reduceMotion: false },
        };
      },
      partialize: (s): SafetyPersisted => ({
        student: s.student,
        scriptUrl: s.scriptUrl,
        classes: s.classes,
        studentClassId: s.studentClassId,
        studentClassName: s.studentClassName,
        checks: s.checks,
        quizBest: s.quizBest,
        quizCount: s.quizCount,
        checkCompletions: s.checkCompletions,
        weedRecords: s.weedRecords,
        weedBest: s.weedBest,
        weedPlays: s.weedPlays,
        weedLast: s.weedLast,
        settings: s.settings,
      }),
    },
  ),
);
