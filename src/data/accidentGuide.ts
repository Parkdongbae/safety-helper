/**
 * 사고 유형 학습 자료 (기술실 안전사고.MD 기반).
 * 실습실 안전점검 시작 화면의 "사고 유형 알아보기" 섹션에서 사용.
 */
export interface AccidentGuide {
  rank: number;
  title: string;
  image: string;
  imageAlt: string;
  cases: string;
  prevention: string[];
}

export const accidentGuides: AccidentGuide[] = [
  {
    rank: 1,
    title: "공구·기계 사용 중 베임·찍힘·끼임",
    image: "/images/safety-helper/accident-rank1.jpg",
    imageAlt: "절단 공구 베임·끼임 주의",
    cases: "목공톱·커터칼로 손가락 베임, 회전부에 옷·머리카락 끼임",
    prevention: ["절단 방향 앞에 손 두지 않기", "장신구 빼고 소매 걷기", "장갑·보안경 착용"],
  },
  {
    rank: 2,
    title: "뜨거운 도구·재료로 인한 화상",
    image: "/images/safety-helper/accident-rank2.jpg",
    imageAlt: "뜨거운 도구 화상 주의",
    cases: "글루건·인두기·3D프린터 노즐에 닿아 화상",
    prevention: ["뜨거운 도구는 받침대에만 두기", "노즐 식을 때까지 손대지 않기"],
  },
  {
    rank: 3,
    title: "미끄러짐·넘어짐·부딪힘",
    image: "/images/safety-helper/accident-rank3.jpg",
    imageAlt: "바닥 정리와 미끄러짐 주의",
    cases: "톱밥·나사·재료 조각 밟고 넘어짐, 높은 곳에서 떨어짐",
    prevention: ["바닥에 떨어진 것 바로 치우기", "통로에 물건 쌓지 않기"],
  },
  {
    rank: 4,
    title: "파편·먼지·연기로 인한 눈·피부·호흡기 손상",
    image: "/images/safety-helper/accident-rank4.png",
    imageAlt: "보안경 착용과 눈 보호",
    cases: "절단 파편이 눈에 들어감, 분진·연기 장시간 흡입",
    prevention: ["보안경은 필수 (잠깐도 예외 없음)", "환기 + 마스크 착용"],
  },
  {
    rank: 5,
    title: "전기 감전·합선·발열 사고",
    image: "/images/safety-helper/accident-rank5.jpg",
    imageAlt: "전기 과부하와 감전 주의",
    cases: "젖은 손으로 콘센트 만져 감전, 멀티탭 과부하 발열",
    prevention: ["젖은 손으로 전기 만지지 않기", "멀티탭 과다 연결 금지"],
  },
  {
    rank: 6,
    title: "화학물질·소재 관련 건강 피해",
    image: "/images/safety-helper/accident-rank6.jpg",
    imageAlt: "환기와 보호구 착용",
    cases: "스프레이·레진을 환기 안 되는 곳에서 사용해 두통·피부염",
    prevention: ["환기되는 곳에서만 사용", "장갑·보안경 착용, PVC 레이저커팅 금지"],
  },
  {
    rank: 7,
    title: "프로젝트 활동 중 갈등·스트레스",
    image: "/images/safety-helper/accident-rank7.png",
    imageAlt: "모둠 활동 안전 행동",
    cases: "실습 중 장난·촬영 후 조롱, 실패 책임 전가로 다툼",
    prevention: ["실습 중 장난 금지", "서로 존중하고 역할 나누기"],
  },
];
