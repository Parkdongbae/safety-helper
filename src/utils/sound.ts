import { useSafetyStore } from "../stores/safetyStore";

export type SoundName = "click" | "correct" | "wrong" | "success" | "fail";

const cache: Record<string, HTMLAudioElement> = {};

export function playSound(name: SoundName): void {
  if (!useSafetyStore.getState().settings.sound) return;
  let audio = cache[name];
  if (!audio) {
    audio = new Audio(`/sounds/${name}.mp3`);
    cache[name] = audio;
  }
  audio.currentTime = 0;
  audio.play().catch(() => {
    /* 재생 실패 무시 (파일 없음/자동재생 정책) */
  });
}
