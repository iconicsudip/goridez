'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Video, Sparkles, ArrowUpRight } from 'lucide-react';
import InstagramEmbed, { InstagramEmbedScript, useInstagramEmbedProcess } from './InstagramEmbed';

interface Reel {
  id: string;
  url: string;
  caption: string | null;
  category: string;
}

export default function VideoGallery({ reels }: { reels: Reel[] }) {
  const [activeTab, setActiveTab] = useState<string>('All');

  const tabs = [
    'All',
    'Customer Reels',
    'Vehicle Walkarounds'
  ];

  const filteredReels = useMemo(() => {
    if (activeTab === 'All') return reels;
    return reels.filter((r) => r.category === activeTab);
  }, [activeTab, reels]);

  // Process Instagram scripts when tabs or slides change
  useInstagramEmbedProcess([reels, activeTab, filteredReels.length]);

  // Initialize Embla Carousel with Autoplay and page-based scrolling
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      slidesToScroll: 'auto',
      loop: filteredReels.length > 1,
      dragFree: false,
    },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onInit = useCallback((api: any) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevBtnEnabled(api.canScrollPrev());
    setNextBtnEnabled(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('init', onInit);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  // Reset Carousel state when active tab/slides length changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, false);
      emblaApi.reInit();
    }
    setSelectedIndex(0);
  }, [activeTab, filteredReels.length, emblaApi]);

  return (
    <section id="video-gallery" className="py-24 bg-[#F0E9DF] border-t-2 border-[#D4C3B2] relative overflow-hidden font-body text-[#250903]">
      {/* Decorative Atmospheric Lighting */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-[#C89D5C]/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#551A0C]/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading */}
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#D4C3B2] rounded-full px-4 py-1.5 mb-4 bg-white shadow-xs">
              <Sparkles size={13} className="text-[#C89D5C]" />
              <span className="text-[#551A0C] text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase font-mono">
                Stories in Motion &bull; Visual Chronicles
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif uppercase tracking-tight text-[#250903] leading-none mb-4">
              GUEST STORIES &amp; <span className="font-editorial italic font-normal text-[#551A0C] lowercase">chronicles</span>
            </h2>
            <p className="text-[#6A5749] text-sm md:text-base max-w-xl font-normal leading-relaxed">
              Explore authentic road chronicles, carriage walkarounds, and unscripted guest moments captured across royal Rajasthan.
            </p>
          </div>

          {/* Navigation Controls */}
          {filteredReels.length > 1 && (
            <div className="hidden md:flex items-center gap-3 mt-auto">
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-95 cursor-pointer ${
                  prevBtnEnabled 
                    ? 'bg-white hover:bg-[#551A0C] hover:text-[#DFB574] text-[#551A0C] border-[#D4C3B2] hover:border-[#C89D5C]' 
                    : 'bg-white/50 text-[#8C6D53]/40 border-[#D4C3B2] cursor-not-allowed opacity-50'
                }`}
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-95 cursor-pointer ${
                  nextBtnEnabled 
                    ? 'bg-white hover:bg-[#551A0C] hover:text-[#DFB574] text-[#551A0C] border-[#D4C3B2] hover:border-[#C89D5C]' 
                    : 'bg-white/50 text-[#8C6D53]/40 border-[#D4C3B2] cursor-not-allowed opacity-50'
                }`}
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-12 hide-scrollbar justify-start border-b border-[#D4C3B2]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#551A0C] text-[#DFB574] border-[#551A0C] shadow-md'
                    : 'bg-white border-[#D4C3B2] text-[#551A0C] hover:border-[#C89D5C] shadow-2xs'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden px-1" ref={emblaRef} key={activeTab}>
          <div className="flex -ml-4 sm:-ml-5">
            {filteredReels.length === 0 ? (
              <div className="w-full ml-4 sm:ml-5 text-center py-20 text-[#8C6D53] font-editorial italic text-base border border-dashed border-[#C89D5C]/40 rounded-3xl bg-white">
                No reels currently catalogued in this chronicle category.
              </div>
            ) : (
              filteredReels.map((reel) => (
                <div 
                  key={reel.id} 
                  className="flex-[0_0_82%] sm:flex-[0_0_46%] md:flex-[0_0_32%] lg:flex-[0_0_24%] xl:flex-[0_0_20%] min-w-0 pl-3.5 sm:pl-4"
                >
                  <div 
                    className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl p-3 sm:p-3.5 shadow-[0_16px_45px_rgba(42,14,7,0.11),0_2px_8px_rgba(42,14,7,0.05)] hover:shadow-[0_26px_65px_rgba(42,14,7,0.22)] transition-all duration-500 flex flex-col justify-between h-full group"
                  >
                    {/* Top Exhibition Badge Bar */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#F0E9DF]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C] border border-[#DFB574]/40 flex items-center justify-center text-[#DFB574] text-[9px] shadow-2xs shrink-0">
                          ✦
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#551A0C] truncate">
                          {reel.category}
                        </span>
                      </div>
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#8C6D53] px-2 py-0.5 rounded-full bg-[#FAF6F0] border border-[#D4C3B2] shrink-0">
                        Verified Voyage
                      </span>
                    </div>

                    {/* Embed Area — Compact, Proportional & Cleanly Framed */}
                    <div className="w-full relative rounded-2xl overflow-hidden bg-[#FEFBF8] border border-[#D4C3B2] flex items-start justify-center h-[330px] sm:h-[345px] shadow-2xs">
                      <div className="w-full h-full overflow-hidden flex items-start justify-center">
                        <InstagramEmbed url={reel.url} caption={reel.caption} />
                      </div>
                    </div>
                    
                    {/* Footer Attribution */}
                    <div className="mt-2.5 pt-2.5 w-full border-t border-[#F0E9DF] flex items-center justify-between text-xs">
                      <span className="text-[10.5px] font-editorial italic text-[#8C6D53] truncate pr-2">
                        Rajasthan Royal Mobility
                      </span>
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[#551A0C] hover:text-[#C89D5C] transition-colors shrink-0"
                      >
                        <svg className="w-2.5 h-2.5 fill-current text-[#C89D5C]" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                        <span>Watch</span>
                        <ArrowUpRight size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Dots representing visible page groups */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === index 
                    ? 'w-8 bg-[#551A0C] shadow-sm' 
                    : 'w-2.5 bg-[#E7DFD5] hover:bg-[#C89D5C]/50'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>

      {/* Render Script */}
      <InstagramEmbedScript />
    </section>
  );
}
