'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarDetailsGalleryProps {
  mainImage: string;
  galleryJson: string;
  alt: string;
}

export default function CarDetailsGallery({ mainImage, galleryJson, alt }: CarDetailsGalleryProps) {
  let images: string[] = [mainImage];
  try {
    if (galleryJson && galleryJson !== '[]') {
      const parsed = JSON.parse(galleryJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse gallery JSON:', e);
  }

  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Large display */}
      <div className="bg-white rounded-[24px] border border-gray-200 flex justify-center items-center h-[350px] md:h-[450px] relative overflow-hidden group">
        <Image
          src={images[activeIndex] || '/placeholder-car.png'}
          alt={`${alt} - View ${activeIndex + 1}`}
          fill
          className="object-contain p-2 group-hover:scale-102 transition-transform duration-700 z-10"
          unoptimized
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-md hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white border border-gray-200 flex items-center justify-center text-gray-700 shadow-md hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${idx === activeIndex
                  ? 'border-green-600 ring-2 ring-green-600/20 scale-95 shadow-md'
                  : 'border-gray-250 hover:border-gray-400 opacity-70 hover:opacity-100'
                }`}
            >
              <Image
                src={img}
                alt={`${alt} Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
