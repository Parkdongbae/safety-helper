import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSafetyStore } from "../stores/safetyStore";
import { playSound } from "../utils/sound";
import { playSfx } from "../lib/useSfx";

type Props = {
  title: string;
  children: ReactNode;
  background?: string;
  backTo?: string;
  wide?: boolean;
};

export function Layout({ title, children, background, backTo, wide = false }: Props) {
  const navigate = useNavigate();
  const sound = useSafetyStore((s) => s.settings.sound);
  const highContrast = useSafetyStore((s) => s.settings.highContrast);
  const reduceMotion = useSafetyStore((s) => s.settings.reduceMotion);
  const setSettings = useSafetyStore((s) => s.setSettings);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [highContrast, reduceMotion]);

  return (
    <div className="relative min-h-full">
      {background && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        />
      )}
      {background && <div aria-hidden="true" className="fixed inset-0 -z-10 bg-white/70" />}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3">
          <Link
            to="/"
            aria-label="홈으로"
            onClick={() => playSound("click")}
            className="ring-focus rounded-xl bg-slate-100 px-2.5 py-2 text-lg transition hover:bg-slate-200"
          >
            🏠
          </Link>
          {backTo && (
            <button
              type="button"
              onClick={() => {
                playSfx("uiBack");
                navigate(backTo);
              }}
              aria-label="뒤로 가기"
              className="ring-focus rounded-xl bg-slate-100 px-2.5 py-2 text-lg transition hover:bg-slate-200"
            >
              ←
            </button>
          )}
          <h1 className="min-w-0 flex-1 truncate text-base font-black sm:text-lg">{title}</h1>
          <button
            type="button"
            onClick={() => {
              if (!sound) playSound("click");
              setSettings({ sound: !sound });
            }}
            aria-pressed={sound}
            aria-label={sound ? "효과음 끄기" : "효과음 켜기"}
            className="ring-focus rounded-xl bg-slate-100 px-2.5 py-2 text-lg transition hover:bg-slate-200"
          >
            {sound ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      <main className={`mx-auto w-full px-3 py-4 sm:py-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {children}
      </main>
    </div>
  );
}
