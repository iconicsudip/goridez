'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import InstagramEmbed, { InstagramEmbedScript, useInstagramEmbedProcess } from './InstagramEmbed';

interface Reel {
  id: string;
  url: string;
  caption: string | null;
}

const CARD_WIDTH = 360;
const CARD_GAP = 24;
const STEP = CARD_WIDTH + CARD_GAP;
const AUTO_SCROLL_MS = 4500;

export default function InstagramReelsSection({ reels }: { reels: Reel[] }) {
  useInstagramEmbedProcess([reels]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(reels.length - 1, index));
    el.scrollTo({ left: clamped * STEP, behavior: 'smooth' });
    setActiveIndex(clamped);
  }, [reels.length]);

  // Auto-advance, looping back to the start
  useEffect(() => {
    if (reels.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1 >= reels.length ? 0 : prev + 1;
        scrollRef.current?.scrollTo({ left: next * STEP, behavior: 'smooth' });
        return next;
      });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(timer);
  }, [reels.length, isPaused]);

  // Keep dots in sync with manual/touch scrolling
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / STEP);
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, []);

  if (reels.length === 0) return null;

  return (
    <section
      className="py-24 bg-white border-t border-brand-border relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                <Camera size={14} /> Follow the Journey
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-gray-900">
              Latest <span className="text-outline-neon">Reels</span>
            </h2>
            <div className="w-20 h-1 bg-brand-gold mt-6 rounded-full"></div>
          </div>

          {reels.length > 1 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => scrollToIndex(activeIndex - 1)}
                aria-label="Previous reel"
                className="w-11 h-11 rounded-full border border-brand-border bg-white hover:bg-gray-50 hover:border-brand-gold text-gray-700 hover:text-brand-gold flex items-center justify-center transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollToIndex(activeIndex + 1)}
                aria-label="Next reel"
                className="w-11 h-11 rounded-full border border-brand-border bg-white hover:bg-gray-50 hover:border-brand-gold text-gray-700 hover:text-brand-gold flex items-center justify-center transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {reels.map((reel) => (
            <div key={reel.id} className="shrink-0 snap-start" style={{ width: CARD_WIDTH }}>
              <InstagramEmbed url={reel.url} caption={reel.caption} />
            </div>
          ))}
        </div>

        {reels.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {reels.map((reel, i) => (
              <button
                key={reel.id}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to reel ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-brand-gold' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <InstagramEmbedScript />
    </section>
  );
}
