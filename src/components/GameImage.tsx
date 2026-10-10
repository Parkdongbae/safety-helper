import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  emoji?: string;
  className?: string;
};

/** 이미지 로드 실패 시 이모지 폴백을 보여주는 이미지 컴포넌트 */
export function GameImage({ src, alt, emoji = "🧩", className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-slate-100 text-5xl ${className}`}
      >
        <span aria-hidden="true">{emoji}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
