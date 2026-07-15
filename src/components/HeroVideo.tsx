'use client';

/**
 * HeroVideo — High-performance cinematic background video loader.
 * Renders a fallback image immediately as the base layer, and overlays
 * the auto-playing muted loop video on top as soon as it buffers.
 */
export default function HeroVideo({
  src,
  fallbackImage,
}: {
  src?: string | null;
  fallbackImage?: string | null;
}) {
  const hasVideo = !!src && src.trim() !== '';
  const imgSrc = fallbackImage?.trim() || null;

  return (
    <div className="relative w-full h-full bg-[#111]">
      {/* Placeholder/Fallback Image Layer */}
      {imgSrc && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imgSrc})` }}
        />
      )}
      
      {/* Cinematic Video Layer */}
      {hasVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          src={src}
        />
      )}
    </div>
  );
}
