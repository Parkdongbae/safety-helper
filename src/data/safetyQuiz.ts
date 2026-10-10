/**
 * 안전 퀴즈 24문항 — safetyScenes 전체 사용.
 * 그림·해설은 safetyScenes 데이터를 그대로 재활용.
 * 이미지 변형(variant)은 출제 시점에 1회 선택해 고정한다.
 * (렌더마다 랜덤 선택하면 타이머 리렌더 때마다 그림이 바뀌는 버그 발생)
 */
import { drawSafetyVariant, safetyScenes } from "./safetyScenes";

const QUIZ_SCENE_IDS = [
  "saw-hand-near",
  "glue-window-open",
  "drill-gloves",
  "glasses-wearing",
  "messy-bench",
  "cutter-body-away",
  "solder-iron-rest",
  "hammer-loose-head",
  "long-hair-tied",
  "drill-loose-cloth",
  "clamp-before-drill",
  "hand-hold-piece",
  "sanding-mask",
  "blow-dust-face",
  "hot-glue-stand",
  "glue-tip-touch",
  "spanner-check",
  "screwdriver-palm",
  "laser-goggles",
  "laser-peek",
  "cord-check",
  "cord-pull-unplug",
  "nail-hold-far",
  "fire-play",
];

export interface SafetyQuizQuestion {
  sceneId: string;
  /** 출제 시 고정한 이미지 변형 번호 (1~3) */
  variant: number;
}

export const safetyQuizQuestions: SafetyQuizQuestion[] = QUIZ_SCENE_IDS.map((sceneId) => ({
  sceneId,
  variant: 1,
}));

/** 참조 무결성: 퀴즈 장면 id가 전부 safetyScenes에 존재하는지 */
export function findMissingQuizScenes(): string[] {
  const known = new Set(safetyScenes.map((s) => s.id));
  return QUIZ_SCENE_IDS.filter((id) => !known.has(id));
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function drawSafetyQuizQuestions(): SafetyQuizQuestion[] {
  return shuffle(safetyQuizQuestions).map((q) => ({
    ...q,
    variant: drawSafetyVariant(),
  }));
}
