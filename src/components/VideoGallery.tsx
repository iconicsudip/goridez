'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';
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
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
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
    <section id="video-gallery" className="py-24 bg-white border-t border-brand-border relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/4 left-0 w-[550px] h-[550px] bg-brand-gold/[0.015] blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-1.5 justify-center md:justify-start">
                <Video size={14} /> Video Gallery
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900 font-serif">
              CUSTOMER <span className="text-[#8dbb00] font-sans font-black">STORIES</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-xl">
              Watch reels, reviews, walkarounds, and memories shared by our premium customers across Rajasthan.
            </p>
          </div>

          {/* Navigation Controls */}
          {filteredReels.length > 1 && (
            <div className="hidden md:flex gap-3 mt-auto">
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-md active:scale-95 ${
                  prevBtnEnabled 
                    ? 'bg-white hover:bg-brand-gold hover:text-white text-gray-800 border-gray-200 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                }`}
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-md active:scale-95 ${
                  nextBtnEnabled 
                    ? 'bg-white hover:bg-brand-gold hover:text-white text-gray-800 border-gray-200 cursor-pointer' 
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                }`}
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-12 scrollbar-hide justify-start border-b border-brand-border/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20'
                  : 'bg-gray-100 border border-gray-200 text-gray-500 hover:text-brand-gold hover:border-brand-gold hover:bg-brand-gold/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden px-1" ref={emblaRef} key={activeTab}>
          <div className="flex -ml-6">
            {filteredReels.length === 0 ? (
              <div className="w-full ml-6 text-center py-20 text-gray-500 font-mono text-sm border border-dashed border-gray-200 rounded-3xl">
                No videos found in this category.
              </div>
            ) : (
              filteredReels.map((reel) => (
                <div 
                  key={reel.id} 
                  className="flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] min-w-0 pl-6"
                >
                  <div 
                    className="bg-white border border-gray-200 rounded-3xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group"
                  >
                    {/* Embed Area */}
                    <div className="w-full relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[450px]">
                      <InstagramEmbed url={reel.url} caption={reel.caption} />
                    </div>
                    
                    {/* Category Badge */}
                    <div className="mt-4 pt-3 w-full border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span className="uppercase tracking-widest font-black text-brand-gold">
                        {reel.category}
                      </span>
                      <span>Goridez Experience</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination Dots representing visible page groups */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === index 
                    ? 'w-8 bg-brand-gold shadow-md shadow-brand-gold/20' 
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
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
