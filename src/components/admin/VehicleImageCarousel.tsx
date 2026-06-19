'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  alt: string;
}

export default function VehicleImageCarousel({ images, alt }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
        <span className="text-[10px] font-mono text-white/30 uppercase">No Images</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((src, index) => (
        <Image
          key={`${src}-${index}`}
          src={src}
          alt={`${alt} - Image ${index + 1}`}
          fill
          unoptimized
          className={`object-cover transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-3 bg-brand-neon' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
