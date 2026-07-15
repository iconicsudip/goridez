'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CarImageSliderProps {
  mainImage: string;
  galleryJson?: string;
  alt: string;
  imageClassName?: string;
}

export default function CarImageSlider({ mainImage, galleryJson, alt, imageClassName = 'object-cover' }: CarImageSliderProps) {
  const [images, setImages] = useState<string[]>([mainImage]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    try {
      if (galleryJson) {
        const parsed = JSON.parse(galleryJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const allImages = [mainImage, ...parsed].filter(Boolean);
          setImages(allImages);
        }
      }
    } catch (e) {
      // fallback
    }
  }, [mainImage, galleryJson]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // 3 seconds transitions
    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((img, idx) => (
        <div
          key={img + idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={img}
            alt={alt}
            fill
            className={imageClassName}
            unoptimized
          />
        </div>
      ))}
      {/* Indicator overlay dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-4 bg-green-500' : 'w-1.5 bg-gray-400/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
