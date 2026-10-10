/**
 * 실습실 안전점검 체크리스트 (교과서 5단원 안전 수칙 기반).
 * 수업 전 7 / 수업 중 8 / 수업 후 5 = 총 20항목.
 * 근거: 2022개정 미래엔 중학교 기술·가정① 교사용교과서 5단원
 * ([Ⅴ-4] 가공 공구와 보호 장구, [Ⅴ-5] 공구의 안전한 사용 방법, 실습 기본 수칙)
 */
import type { CheckItem, RoomId } from "../types";

export const safetyChecks: Record<RoomId, CheckItem[]> = {
  lab: [
    // ── 수업 전 ──
    { id: "lab-b1", phase: "before", text: "보안경·안전장갑·앞치마 등 보호 장구를 착용했나요?" },
    { id: "lab-b2", phase: "before", text: "소매를 정리하고 긴 머리를 묶었나요?" },
    { id: "lab-b3", phase: "before", text: "작업대와 통로에 공구·재료를 방치하지 않았나요?" },
    { id: "lab-b4", phase: "before", text: "톱·망치·드릴 등 공구 상태(흔들림·날)를 확인했나요?" },
    { id: "lab-b5", phase: "before", text: "소화기 위치와 사용법을 확인했나요?" },
    { id: "lab-b6", phase: "before", text: "실 안 환기를 했나요? (접착제·3D프린터·레이저 유해가스)" },
    { id: "lab-b7", phase: "before", text: "재료에 맞는 공구를 준비했나요? (톱니·드릴 비트 등)" },
    // ── 수업 중 ──
    { id: "lab-d1", phase: "during", text: "재료를 클램프로 고정한 후 작업하나요?" },
    { id: "lab-d2", phase: "during", text: "톱질할 때 손이 톱날 쪽에 있지 않나요? (톱길을 먼저 내기)" },
    { id: "lab-d3", phase: "during", text: "회전 공구에 장갑 낀 손·소매·머리카락을 가까이하지 않나요?" },
    { id: "lab-d4", phase: "during", text: "드릴 비트가 식기 전에 손으로 잡지 않나요?" },
    { id: "lab-d5", phase: "during", text: "접착제는 환기되는 곳에서, 입·눈·피부에 묻지 않게 쓰나요?" },
    { id: "lab-d6", phase: "during", text: "글루 건 예열 중 노즐을 만지지 않고, 20분 넘게 켜 두지 않나요?" },
    { id: "lab-d7", phase: "during", text: "납땜 인두를 인두받이에 올려두고, 레이저 뚜껑을 열지 않나요?" },
    { id: "lab-d8", phase: "during", text: "장난치지 않고 작업에 집중하나요?" },
    // ── 수업 후 ──
    { id: "lab-a1", phase: "after", text: "전동 공구·인두·글루 건 전원을 끄고 식혔나요?" },
    { id: "lab-a2", phase: "after", text: "공구를 제자리에 정리했나요?" },
    { id: "lab-a3", phase: "after", text: "작업대·바닥을 정리하고 쓰레기를 분리했나요?" },
    { id: "lab-a4", phase: "after", text: "콘센트를 플러그를 잡고 뽑았나요?" },
    { id: "lab-a5", phase: "after", text: "다친 곳은 없는지 확인했나요?" },
  ],
};

export const PHASE_LABELS: Record<CheckItem["phase"], string> = {
  before: "🏁 수업 전",
  during: "🔧 수업 중",
  after: "✨ 수업 후",
};
