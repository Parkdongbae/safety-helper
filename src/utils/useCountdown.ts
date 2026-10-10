import { useEffect, useRef, useState } from "react";

export type CountdownState = "idle" | "running" | "finished";

/** 초 단위 카운트다운. start()로 시작, 0이 되면 finished가 되고 onDone이 호출된다. */
export function useCountdown(seconds: number, onDone?: () => void) {
  const [remaining, setRemaining] = useState(seconds);
  const [state, setState] = useState<CountdownState>("idle");
  const startedAtRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (state !== "running") return;
    startedAtRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startedAtRef.current) / 1000;
      const next = Math.max(0, seconds - elapsed);
      setRemaining(next);
      if (next <= 0) {
        setState("finished");
        doneRef.current?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [state, seconds]);

  function start() {
    setRemaining(seconds);
    setState("running");
  }

  function reset() {
    setRemaining(seconds);
    setState("idle");
  }

  return { remaining, state, start, reset, setState };
}
