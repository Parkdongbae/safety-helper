/**
 * 안전점검 재미 요소 — 마스코트 응원 멘트 + 안전 칭호.
 */

/** 진행률(0~1) 구간별 마스코트 응원 멘트 */
export function cheerFor(rate: number, remaining: number): string {
  if (rate <= 0) return "함께 점검해 볼까요? 하나씩 눌러보세요! 🦺";
  if (remaining === 1) return "마지막 1개! 눈앞에 안전이 보여요! 🎯";
  if (rate < 0.5) return "좋은 시작이에요! 그 기세로 쭉쭉! 💪";
  if (rate < 1) return "절반 넘었어요! 안전 지킴이가 되는 중... 🛡️";
  return "완벽해요! 오늘의 실습실은 안전합니다! 🎉";
}

/** 누적 완료 횟수 → 안전 칭호 */
export function titleFor(completions: number): string {
  if (completions >= 5) return "안전 마스터";
  if (completions >= 3) return "안전 반장";
  if (completions >= 1) return "안전 지킴이";
  return "안전 새싹";
}
