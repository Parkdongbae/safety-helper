// 안전 도우미 — 공용 타입
export type RoomId = "lab";

export type CheckPhase = "before" | "during" | "after";

export interface CheckItem {
  id: string;
  text: string;
  phase: CheckPhase;
}

export interface Room {
  id: RoomId;
  name: string;
  emoji: string;
  description: string;
  /** 대표 이미지 (신규 그림 오면 교체) */
  image: string;
  imageAlt: string;
  /** 점검 완료 배지 이미지 */
  badge: string;
}

export interface Student {
  number: string;
  name: string;
}

export interface SchoolClass {
  id: string;
  grade: string;
  classNo: string;
}

export function classLabel(c: Pick<SchoolClass, "grade" | "classNo">): string {
  return `${c.grade}학년 ${c.classNo}반`;
}

export type RecordKind = "check" | "quiz" | "weed";

/** 저장된 사고잡초 드래그 퀴즈 결과 1건 */
export interface WeedRecord {
  id: string;
  createdAt: string;
  scenarioId: string;
  scenarioTitle: string;
  correct: number;
  total: number;
}

export interface SheetRecord {
  number: string;
  name: string;
  /** 학년반 — 없으면 전송 시 저장된 학반에서 자동 첨부 */
  className?: string;
  kind: RecordKind;
  room: string;
  score: string;
  rate: string;
  memo: string;
}
