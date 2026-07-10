'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * HeroVideo — Client Component
 *
 * • If `src` is provided — plays the video (muted, looping, auto-play).
 * • If `src` is empty/null OR the video fails to load — shows `fallbackImage`.
 *
 * Browsers require `video.muted = true` to be set imperatively via JS
 * (the HTML `muted` attribute alone is often ignored during SSR hydration).
 */
export default function HeroVideo({
  src,
  fallbackImage,
}: {
  src?: string | null;
  fallbackImage?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const hasVideo = !!src && src.trim() !== '';
  const showVideo = hasVideo && !videoFailed;

  useEffect(() => {
    if (!hasVideo) return;
    const video = videoRef.current;
    if (!video) return;

    // Force muted via JS — required by Chrome / Safari autoplay policies
    video.muted = true;
    video.defaultMuted = true;

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — silently fail; the poster/fallback is shown
      });
    };

    const handleError = () => setVideoFailed(true);

    video.addEventListener('error', handleError, { once: true });

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener('error', handleError);
    };
  }, [src, hasVideo]);

  // ── Fallback image ────────────────────────────────────────────────────────
  if (!showVideo) {
    const imgSrc = fallbackImage?.trim() || null;
    return (
      <div
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={imgSrc ? { backgroundImage: `url(${imgSrc})` } : { backgroundColor: '#111' }}
      />
    );
  }

  // ── Video ─────────────────────────────────────────────────────────────────
  return (
    <video
      ref={videoRef}
      src={src!}
      loop
      playsInline
      preload="auto"
      className="w-full h-full object-cover"
      muted
    />
  );
}
