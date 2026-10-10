/**
 * 사고잡초(Accident Weed) 카드 데이터.
 * 명세서(accident_weed.md) §5-7의 카드 목록을 앱 용도로 정리.
 * 꽃(결과) / 잎-조건(환경·설비) / 잎-행동(사람) / 뿌리(조직·시스템).
 */

export type WeedZone = "flowers" | "conditions" | "actions" | "roots";

export interface WeedCard {
  id: string;
  label: string;
  /** 뿌리 카드 전용 개선 제안 템플릿 */
  suggestion?: string;
}

export const FLOWER_CARDS: WeedCard[] = [
  { id: "f-burn", label: "화상" },
  { id: "f-cut", label: "베임 / 절단" },
  { id: "f-fracture", label: "골절" },
  { id: "f-bruise", label: "타박 / 염좌" },
  { id: "f-chemical", label: "화학물질 노출" },
  { id: "f-equipment", label: "장비 파손" },
];

export const CONDITION_CARDS: WeedCard[] = [
  { id: "c-noguard", label: "보호장치 없는 기계" },
  { id: "c-broken-tool", label: "도구·장비 파손" },
  { id: "c-chemical-leak", label: "화학 물질 유출" },
  { id: "c-bad-ppe", label: "결함 있는 개인 보호장비" },
  { id: "c-crowded", label: "혼잡한 작업 공간" },
  { id: "c-overtime", label: "작업시간 부족 / 과도한 작업량" },
  { id: "c-dark", label: "어두운 조명 / 시야 불량" },
  { id: "c-noise-heat", label: "소음·온도 등 환경 요인" },
];

export const ACTION_CARDS: WeedCard[] = [
  { id: "a-prank", label: "거친 장난 / 불필요한 장난" },
  { id: "a-ignore-rule", label: "안전 수칙 무시" },
  { id: "a-ignore-order", label: "작업 순서 무시" },
  { id: "a-hurry", label: "급하게 작업함 (시간 압박)" },
  { id: "a-no-ppe", label: "안전 장구 미사용" },
  { id: "a-distracted", label: "집중력 산만 / 피로" },
  { id: "a-unskilled", label: "미숙한 공구 사용" },
];

export const ROOT_CARDS: WeedCard[] = [
  { id: "r-no-plan", label: "사고 대책 미비 (비상 대응 계획 부족)", suggestion: "비상 대응 계획을 세우고 게시할 필요가 있어요." },
  { id: "r-no-followup", label: "사고 후 개선 부재 (재발 방지 조치 미흡)", suggestion: "사고 후 재발 방지 조치 체크리스트 운영을 권장해요." },
  { id: "r-no-practice", label: "연습·훈련 시간 부족", suggestion: "실습 전 충분한 연습 시간을 확보할 필요가 있어요." },
  { id: "r-poor-edu", label: "안전교육 미비 / 형식적인 교육", suggestion: "정기적이고 실질적인 안전교육이 필요해요." },
  { id: "r-no-ownership", label: "안전교육 담당자의 책임의식 부족", suggestion: "담당자의 역할과 책임을 명확히 할 필요가 있어요." },
  { id: "r-no-budget", label: "안전장비 구입비 부족 / 예산 우선순위 낮음", suggestion: "안전장비 예산 확보와 설치 일정 수립이 필요해요." },
  { id: "r-bad-layout", label: "부적절한 작업 공간 설계 (협소, 동선 불량 등)", suggestion: "작업 동선과 공간을 다시 설계할 필요가 있어요." },
  { id: "r-rule-ignored", label: "안전규칙 비적용 (규정은 있으나 지키지 않음)", suggestion: "규칙 준수 여부를 점검하는 체계가 필요해요." },
  { id: "r-no-supervision", label: "감독 소홀 / 리더의 관리 부족", suggestion: "순회 지도와 감독을 강화할 필요가 있어요." },
  { id: "r-lack-ppe", label: "개인 보호장비 부족 / 품질 미흡", suggestion: "보호장비를 추가로 구입하거나 교체할 필요가 있어요." },
];

const ALL_CARDS: Record<WeedZone, WeedCard[]> = {
  flowers: FLOWER_CARDS,
  conditions: CONDITION_CARDS,
  actions: ACTION_CARDS,
  roots: ROOT_CARDS,
};

/** 카드 id 또는 직접 입력값(custom:...)을 화면 표시용 문구로 변환 */
export function weedLabel(zone: WeedZone, id: string): string {
  if (id.startsWith("custom:")) return id.slice("custom:".length);
  return ALL_CARDS[zone].find((c) => c.id === id)?.label ?? id;
}

/** 뿌리 id → 개선 제안 문장 (직접 입력은 일반 문장으로) */
export function rootSuggestion(id: string): string {
  if (id.startsWith("custom:")) return `“${id.slice("custom:".length)}” 상황을 개선할 방법을 함께 찾아보세요.`;
  const card = ROOT_CARDS.find((c) => c.id === id);
  return card?.suggestion ? `${card.label} → ${card.suggestion}` : id;
}
