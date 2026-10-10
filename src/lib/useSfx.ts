import { useCallback } from "react";
import { useSafetyStore } from "../stores/safetyStore";

import cardPickUrl from "../sfx/card-pick.wav";
import cardDropUrl from "../sfx/card-drop.wav";
import stepSnapUrl from "../sfx/step-snap.mp3";
import leverPushUrl from "../sfx/lever-push.wav";
import creakUrl from "../sfx/creak.mp3";
import crackUrl from "../sfx/crack.wav";
import snapBreakUrl from "../sfx/snab-break.wav";
import passRingUrl from "../sfx/pass-ring.wav";
import starGainUrl from "../sfx/star-gain.wav";
import uiBackUrl from "../sfx/ui-back.wav";

export type SfxKey =
  | "cardPick"
  | "cardDrop"
  | "stepSnap"
  | "leverPush"
  | "creak"
  | "crack"
  | "snapBreak"
  | "passRing"
  | "starGain"
  | "badgeUnlock"
  | "uiBack";

const SRC: Record<SfxKey, string> = {
  cardPick: cardPickUrl,
  cardDrop: cardDropUrl,
  stepSnap: stepSnapUrl,
  leverPush: leverPushUrl,
  creak: creakUrl,
  crack: crackUrl,
  snapBreak: snapBreakUrl,
  passRing: passRingUrl,
  starGain: starGainUrl,
  // badge-unlock 전용 음원이 아직 없어 임시로 기존 팡파레음을 사용한다.
  badgeUnlock: "/sounds/success.mp3",
  uiBack: uiBackUrl,
};

const MAX_OVERLAP = 3;
const active: Partial<Record<SfxKey, number>> = {};
let creakAudio: HTMLAudioElement | null = null;
let pickStreak = 0;
let lastPickAt = 0;

function release(key: SfxKey) {
  active[key] = Math.max(0, (active[key] ?? 1) - 1);
}

function playInternal(key: SfxKey, rate: number) {
  if (!useSafetyStore.getState().settings.sound) return;
  if ((active[key] ?? 0) >= MAX_OVERLAP) return;
  try {
    const audio = new Audio(SRC[key]);
    audio.playbackRate = rate;
    audio.volume = 0.8;
    active[key] = (active[key] ?? 0) + 1;
    audio.addEventListener("ended", () => release(key));
    audio.addEventListener("error", () => release(key));
    void audio.play().catch(() => release(key));
  } catch {
    release(key);
  }
}

/** 훅 없이 쓰는 즉시 재생 (카드 컴포넌트 등) */
export function playSfx(key: SfxKey, opts?: { rate?: number }) {
  let rate = opts?.rate ?? 1;
  if (key === "cardPick") {
    const now = Date.now();
    pickStreak = now - lastPickAt < 1200 ? Math.min(pickStreak + 1, 2) : 0;
    lastPickAt = now;
    rate = 1 + pickStreak * 0.06;
  }
  playInternal(key, rate);
}

export function startCreak() {
  if (!useSafetyStore.getState().settings.sound || creakAudio) return;
  try {
    const audio = new Audio(creakUrl);
    audio.loop = true;
    audio.volume = 0.7;
    creakAudio = audio;
    void audio.play().catch(() => {
      creakAudio = null;
    });
  } catch {
    creakAudio = null;
  }
}

export function stopCreak() {
  if (!creakAudio) return;
  creakAudio.pause();
  creakAudio = null;
}

/** 음소거 상태가 필요한 컴포넌트용 훅 */
export function useSfx() {
  const muted = !useSafetyStore((s) => s.settings.sound);
  const play = useCallback((key: SfxKey, opts?: { rate?: number }) => playSfx(key, opts), []);
  return { play, startCreak, stopCreak, muted };
}
