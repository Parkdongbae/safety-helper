/**
 * 사고잡초 드래그 퀴즈 시나리오.
 * 상황을 읽고 각 카드를 올바른 영역(꽃/조건/행동/뿌리)으로 드래그.
 * 카드 id는 weedCards.ts의 id를 그대로 사용.
 */
import type { WeedZone } from "./weedCards";

export interface WeedScenarioCard {
  id: string;
  zone: WeedZone;
}

export interface WeedScenario {
  id: string;
  title: string;
  situation: string;
  cards: WeedScenarioCard[];
  lesson: string;
}

export const WEED_SCENARIOS: WeedScenario[] = [
  {
    id: "s-saw-cut",
    title: "서둘러 톱질하다 손가락 베임",
    situation: "점심시간 전이라 서둘러 톱질하던 중 손가락을 베었어요. 연습 시간도 부족했고, 장갑도 안 꼈어요.",
    cards: [
      { id: "f-cut", zone: "flowers" },
      { id: "c-overtime", zone: "conditions" },
      { id: "a-hurry", zone: "actions" },
      { id: "a-no-ppe", zone: "actions" },
      { id: "r-no-practice", zone: "roots" },
    ],
    lesson: "서두르면 잎(행동)이 자라요. 연습 시간 확보(뿌리)가 근본 대책이에요.",
  },
  {
    id: "s-glue-fume",
    title: "혼잡한 실에서 접착제 냄새로 두통",
    situation: "창문을 닫은 채 여러 명이 접착제를 쓰다가 두통을 호소했어요. 환기 규칙은 있었지만 지키지 않았어요.",
    cards: [
      { id: "f-chemical", zone: "flowers" },
      { id: "c-crowded", zone: "conditions" },
      { id: "a-ignore-rule", zone: "actions" },
      { id: "r-rule-ignored", zone: "roots" },
      { id: "r-no-budget", zone: "roots" },
    ],
    lesson: "규칙이 있어도 지키지 않으면 소용없어요. 점검 체계(뿌리)가 필요합니다.",
  },
  {
    id: "s-laser-smoke",
    title: "레이저 작업 중 연기 흡입",
    situation: "보호안경 없이 레이저커터 뚜껑 근처에서 작업하다 연기를 마셨어요.",
    cards: [
      { id: "f-chemical", zone: "flowers" },
      { id: "c-noise-heat", zone: "conditions" },
      { id: "a-ignore-rule", zone: "actions" },
      { id: "a-no-ppe", zone: "actions" },
      { id: "r-rule-ignored", zone: "roots" },
    ],
    lesson: "보호장구 미착용(잎) 뒤에는 규칙 미준수 문화(뿌리)가 있어요.",
  },
  {
    id: "s-power-strip",
    title: "멀티탭 과부하로 스파크",
    situation: "벗겨진 전선의 공구를 멀티탭에 여러 대 꽂아 쓰다 스파크가 났어요. 비상 대응 계획도 없었어요.",
    cards: [
      { id: "f-equipment", zone: "flowers" },
      { id: "c-broken-tool", zone: "conditions" },
      { id: "a-ignore-rule", zone: "actions" },
      { id: "r-no-plan", zone: "roots" },
      { id: "r-lack-ppe", zone: "roots" },
    ],
    lesson: "파손된 도구는 바로 보고하고, 비상 대응 계획(뿌리)을 세워 두세요.",
  },
  {
    id: "s-hammer-miss",
    title: "어두운 곳에서 망치질하다 손 타박",
    situation: "조명이 어두운 구석에서 서툰 망치질을 하다 손을 맞았어요.",
    cards: [
      { id: "f-bruise", zone: "flowers" },
      { id: "c-dark", zone: "conditions" },
      { id: "a-unskilled", zone: "actions" },
      { id: "r-no-practice", zone: "roots" },
      { id: "r-no-supervision", zone: "roots" },
    ],
    lesson: "어두운 환경(조건) + 미숙함(행동)은 연습과 감독(뿌리)으로 줄일 수 있어요.",
  },
  {
    id: "s-prank-fall",
    title: "장난치다 밀려 넘어져 골절",
    situation: "실습 중 친구와 장난치다 밀려 넘어져 팔이 부러졌어요. 작업 공간도 좁고 어수선했어요.",
    cards: [
      { id: "f-fracture", zone: "flowers" },
      { id: "c-crowded", zone: "conditions" },
      { id: "a-prank", zone: "actions" },
      { id: "a-distracted", zone: "actions" },
      { id: "r-no-supervision", zone: "roots" },
    ],
    lesson: "장난(잎)은 순회 지도와 안전 문화(뿌리)로 예방해요.",
  },
];

export function getWeedScenario(id: string | undefined): WeedScenario | undefined {
  return WEED_SCENARIOS.find((s) => s.id === id);
}
