/**
 * 안전 퀴즈 러쉬 장면 데이터.
 * 기획안 안전 수칙(도구 상태 확인, 보호구 착용, 작업대 정리, 환기,
 * 회전 공구와 장갑의 관계 등)을 바탕으로 작성.
 */
import { SAFETY_IMAGE_FILES } from "./safetyImageManifest";

export interface SafetyScene {
  id: string;
  description: string;
  isSafe: boolean;
  correctReason: string;
}

export const safetyScenes: SafetyScene[] = [
  { id: "saw-hand-near", description: "톱질을 하는데 손이 톱날 바로 옆에 있다.", isSafe: false, correctReason: "손이 톱날에 닿아 베일 수 있어요. 손은 톱날에서 5cm 이상 떨어져야 해요." },
  { id: "glue-window-open", description: "접착제를 사용할 때 창문을 열어 환기하고 있다.", isSafe: true, correctReason: "접착제 냄새(유해 가스)를 환기시키는 올바른 방법이에요." },
  { id: "drill-gloves", description: "전동 드릴로 구멍을 뚫을 때 장갑을 꼼꼼히 끼웠다.", isSafe: false, correctReason: "회전 공구에는 장갑을 끼지 않아요. 장갑이 비틀려 감기면 손까지 끌려 들어가는 위험이 있어요." },
  { id: "glasses-wearing", description: "톱질과 드릴 작업 전에 보안경을 착용했다.", isSafe: true, correctReason: "날아오는 조각으로부터 눈을 보호하는 필수 보호구 착용이에요." },
  { id: "messy-bench", description: "작업대 위에 자, 커터칼, 나사가 어지럽히 흩어져 있다.", isSafe: false, correctReason: "작업대가 어수선하면 도구에 손이 베이거나 물건이 떨어질 수 있어요. 도구는 사용 후 제자리에." },
  { id: "cutter-body-away", description: "커터칼로 자를 때 칼날 방향을 몸 반대쪽으로 향했다.", isSafe: true, correctReason: "칼날이 몸을 향하면 미끄러졌을 때 다칠 수 있어요. 바깥쪽으로 자르는 것이 안전해요." },
  { id: "solder-iron-rest", description: "납땜 인두를 사용하지 않을 때 인두받이에 올려 두었다.", isSafe: true, correctReason: "인두 팁은 수백 도로 뜨거워요. 인두받이 사용은 화재와 화상을 막는 기본 수칙이에요." },
  { id: "hammer-loose-head", description: "망치 머리가 흔들리는데 그대로 사용하려고 한다.", isSafe: false, correctReason: "도구 상태 확인은 작업 전 필수예요. 망치 머리가 빠지면 큰 사고로 이어져요." },
  { id: "long-hair-tied", description: "긴 머리를 묶고 전동 공구를 사용하려고 한다.", isSafe: true, correctReason: "긴 머리는 회전 부분에 감길 수 있어요. 묶고 모자를 쓰면 더 안전해요." },
  { id: "drill-loose-cloth", description: "소매가 헐렁하게 늘어지는 옷을 입고 전동 공구를 켰다.", isSafe: false, correctReason: "헐렁한 옷은 회전 부분에 감길 수 있어요. 작업복은 몸에 맞게 입어야 해요." },
  { id: "clamp-before-drill", description: "드릴 작업 전 클램프로 재료를 단단히 고정했다.", isSafe: true, correctReason: "재료가 돌거나 튀는 것을 막아 주는 올바른 고정 방법이에요." },
  { id: "hand-hold-piece", description: "드릴로 구멍을 뚫을 때 클램프 없이 맨손으로 재료를 잡고 있다.", isSafe: false, correctReason: "재료가 비틀리면서 손이 다칠 수 있어요. 반드시 클램프나 바이스로 고정하세요." },
  { id: "sanding-mask", description: "사포질과 샌더 작업을 할 때 방진 마스크를 착용했다.", isSafe: true, correctReason: "가루 먼지가 폐에 들어가지 않도록 마스크를 쓰는 올바른 습관이에요." },
  { id: "blow-dust-face", description: "작업 후 먼지를 털기 위해 입으로 후— 불어서 날려 버렸다.", isSafe: false, correctReason: "먼지가 눈과 입으로 들어갈 수 있어요. 붓자루로 쓸어내거나 물티슈로 닦으세요." },
  { id: "hot-glue-stand", description: "글루 건을 사용하지 않을 때 받침대에 세워 두었다.", isSafe: true, correctReason: "뜨거운 노즐이 작업대에 닿으면 화재나 화상 위험이 있어요. 받침대 사용은 필수예요." },
  { id: "glue-tip-touch", description: "글루 건에서 녹은 접착제가 묻은 손으로 노즐을 만졌다.", isSafe: false, correctReason: "노즐과 녹은 접착제는 매우 뜨거워요. 화상을 입을 수 있으니 만지지 마세요." },
  { id: "spanner-check", description: "볼트를 조이기 전 스패너 크기가 맞는지 확인했다.", isSafe: true, correctReason: "맞지 않는 스패너는 미끄러져 손을 다치게 해요. 크기 확인은 기본이에요." },
  { id: "screwdriver-palm", description: "드라이버로 나사를 조일 때 나사 방향으로 손바닥을 댔다.", isSafe: false, correctReason: "드라이버가 미끄러지면 손바닥이 찔릴 수 있어요. 손은 옆으로, 밀지 않도록." },
  { id: "laser-goggles", description: "레이저 조각기 작업 시 보호 안경을 착용했다.", isSafe: true, correctReason: "레이저는 눈에 치명적이에요. 전용 보호 안경 착용이 필수예요." },
  { id: "laser-peek", description: "레이저 조각기가 도는 동안 뚜껑을 열고 들여다보았다.", isSafe: false, correctReason: "레이저 빛이 눈을 직접 손상시킬 수 있어요. 작동 중에는 절대 열어 보지 않아요." },
  { id: "cord-check", description: "전동 공구를 켜기 전 전선이 벗겨지지 않았는지 확인했다.", isSafe: true, correctReason: "전선 피복이 벗겨지면 감전 위험이 있어요. 사용 전 점검은 필수예요." },
  { id: "cord-pull-unplug", description: "콘센트를 뽑을 때 전선 몸체를 잡아당겨 뽑았다.", isSafe: false, correctReason: "전선을 당기면 심선이 끊어져 합선이 날 수 있어요. 반드시 플러그를 잡고 빼세요." },
  { id: "nail-hold-far", description: "못을 박을 때 시작 몇 회는 펜치로 못을 잡아 두고 두드렸다.", isSafe: true, correctReason: "손가락 대신 펜치로 못을 잡으면 망치에 손을 치는 사고를 막아요." },
  { id: "fire-play", description: "작업실에서 장난으로 소화기를 뿌려 보았다.", isSafe: false, correctReason: "소화기는 화재 시에만 사용하는 안전 장비예요. 장난으로 쓰면 정작 필요할 때 곤란해요." },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function drawSafetyQuiz(): SafetyScene[] {
  return shuffle(safetyScenes);
}

/** 장면별 일러스트 이모지 (이미지 로드 실패 시 폴백용) */
export const SAFETY_SCENE_EMOJI: Record<string, string> = {
  "saw-hand-near": "🪚",
  "glue-window-open": "🪟",
  "drill-gloves": "🧤",
  "glasses-wearing": "🥽",
  "messy-bench": "🧰",
  "cutter-body-away": "🔪",
  "solder-iron-rest": "🔥",
  "hammer-loose-head": "🔨",
  "long-hair-tied": "👩",
  "drill-loose-cloth": "👕",
  "clamp-before-drill": "🗜️",
  "hand-hold-piece": "✋",
  "sanding-mask": "😷",
  "blow-dust-face": "💨",
  "hot-glue-stand": "🔫",
  "glue-tip-touch": "⚠️",
  "spanner-check": "🔧",
  "screwdriver-palm": "🪛",
  "laser-goggles": "🥽",
  "laser-peek": "😈",
  "cord-check": "🔌",
  "cord-pull-unplug": "🔌",
  "nail-hold-far": "🔨",
  "fire-play": "🧯",
};

/** 장면 일러스트 변형 개수 (public/images/safety/ — jpg/png 혼합, 목록은 manifest) */
export const SAFETY_ART_VARIANTS = 3;

/** 장면 → 일러스트 경로. variant 생략 시 랜덤 변형 */
export function safetySceneImage(scene: SafetyScene, variant?: number): string {
  const files = SAFETY_IMAGE_FILES[scene.id];
  if (files && files.length > 0) {
    const v = variant ?? drawSafetyVariant();
    return `/images/safety/${files[(v - 1) % files.length]}`;
  }
  const v = variant ?? drawSafetyVariant();
  return `/images/safety/${scene.id}-${v}.svg`;
}

/** 1~3 중 랜덤 변형 번호 */
export function drawSafetyVariant(): number {
  return 1 + Math.floor(Math.random() * SAFETY_ART_VARIANTS);
}
