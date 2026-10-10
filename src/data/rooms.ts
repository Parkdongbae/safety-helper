import type { Room } from "../types";

export const rooms: Room[] = [
  {
    id: "lab",
    name: "실습실 안전점검",
    emoji: "🦺",
    description: "기술실·무한상상실·메이커실 수업 전후 안전 점검",
    image: "/images/safety-helper/room-tech.jpg",
    imageAlt: "실습실 모습",
    badge: "/images/safety-helper/badge-tech.jpg",
  },
];

export function getRoom(id: string | undefined): Room | undefined {
  return rooms.find((r) => r.id === id);
}
