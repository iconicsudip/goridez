'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';

interface GoogleReview {
  id: string;
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishedAt: Date;
}

interface Props {
  reviews: GoogleReview[];
  placeId?: string;
  averageRating?: number; // from SiteSettings (actual Google overall rating)
  totalReviews?: number;  // from SiteSettings (total review count on Google)
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

function fillMarquee(items: GoogleReview[], minCount = 10) {
  if (items.length === 0) return [];
  let result = [...items];
  while (result.length < minCount) {
    result = [...result, ...items];
  }
  return result;
}

const ReviewCard = ({ review }: { review: GoogleReview }) => (
  <div className="w-[380px] shrink-0 bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 hover:border-brand-gold/30 hover:shadow-md transition-all select-none">
    {/* Author row */}
    <div className="flex items-center gap-3">
      {review.authorPhoto ? (
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shrink-0">
          <img
            src={review.authorPhoto}
            alt={review.authorName}
            width={36}
            height={36}
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold font-black text-sm shrink-0">
          {review.authorName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0 text-left">
        <div className="font-black text-gray-900 text-xs truncate">{review.authorName}</div>
        <div className="text-[9px] text-gray-400 font-mono">{review.relativeTime}</div>
      </div>
      {/* Google small G logo */}
      <div className="shrink-0 w-5 h-5 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="11" height="11">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    </div>

    {/* Stars */}
    <StarRating rating={review.rating} />

    {/* Review text */}
    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3 text-left whitespace-normal">
      {review.text || <span className="italic text-gray-400">No text provided.</span>}
    </p>
  </div>
);

export default function GoogleReviewsSection({ reviews, placeId, averageRating = 0, totalReviews = 0 }: Props) {
  if (reviews.length === 0) return null;

  // Split reviews into odd and even rows
  const oddReviews = reviews.filter((_, idx) => idx % 2 === 0);
  const evenReviews = reviews.filter((_, idx) => idx % 2 !== 0);

  // Fill up rows with duplicate items if array is too small to loop smoothly
  const row1 = fillMarquee(oddReviews.length > 0 ? oddReviews : reviews, 8);
  const row2 = fillMarquee(evenReviews.length > 0 ? evenReviews : reviews, 8);

  const displayRating = averageRating > 0
    ? averageRating.toFixed(1)
    : (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const displayTotal = totalReviews > 0 ? totalReviews : reviews.length;

  const mapsUrl = placeId
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : 'https://google.com';

  return (
    <section className="py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Verified Customer Reviews</div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-3">
              WHAT OUR <span className="text-outline-neon">GUESTS SAY</span>
            </h2>
            {/* Overall rating badge */}
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900">{displayRating}</span>
                <StarRating rating={Math.round(Number(displayRating))} />
                <span className="text-xs text-gray-400 font-mono">({displayTotal.toLocaleString()} Google reviews)</span>
              </div>
            </div>
          </div>
          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-[#8dbb00] transition-colors border-b border-brand-gold pb-1 whitespace-nowrap"
          >
            Write a Review ↗
          </Link>
        </div>

      </div>

      {/* Marquee Rows Container */}
      <div className="flex flex-col gap-6 w-full overflow-hidden mt-6">
        
        {/* Row 1: Moves Left */}
        <div className="relative flex overflow-x-hidden py-1 w-full mask-gradient">
          <div className="flex gap-6 animate-marquee-left hover:[animation-play-state:paused] whitespace-nowrap min-w-full">
            {row1.map((r, i) => (
              <ReviewCard key={`r1-${r.id}-${i}`} review={r} />
            ))}
            {row1.map((r, i) => (
              <ReviewCard key={`r1-dup-${r.id}-${i}`} review={r} />
            ))}
          </div>
        </div>

        {/* Row 2: Moves Right */}
        <div className="relative flex overflow-x-hidden py-1 w-full mask-gradient">
          <div className="flex gap-6 animate-marquee-right hover:[animation-play-state:paused] whitespace-nowrap min-w-full">
            {row2.map((r, i) => (
              <ReviewCard key={`r2-${r.id}-${i}`} review={r} />
            ))}
            {row2.map((r, i) => (
              <ReviewCard key={`r2-dup-${r.id}-${i}`} review={r} />
            ))}
          </div>
        </div>

      </div>

      {/* View all button */}
      <div className="container mx-auto px-4 mt-12 text-center">
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=GoRidez+Udaipur${placeId ? `&query_place_id=${placeId}` : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors border border-gray-200 rounded-xl px-6 py-3 hover:border-gray-400"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          View all reviews on Google Maps
        </Link>
      </div>
    </section>
  );
}
