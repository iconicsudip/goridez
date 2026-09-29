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
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'text-[#DFB574] fill-[#DFB574]' : 'text-[#E7DFD5] fill-[#E7DFD5]'}
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
  <div className="w-[410px] shrink-0 bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] rounded-3xl p-6 flex flex-col justify-between gap-4 hover:shadow-[0_20px_45px_rgba(85,26,12,0.12)] transition-all duration-300 relative group select-none">
    {/* Watermark quotation symbol */}
    <span className="absolute top-4 right-6 text-6xl font-editorial font-bold text-[#C89D5C]/20 pointer-events-none select-none">
      “
    </span>

    {/* Author row */}
    <div className="flex items-center gap-3.5 relative z-10">
      {review.authorPhoto ? (
        <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E7DFD5] shrink-0 ring-2 ring-[#C89D5C]/30">
          <img
            src={review.authorPhoto}
            alt={review.authorName}
            width={44}
            height={44}
            className="object-cover w-full h-full"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-full bg-[#551A0C] text-[#DFB574] flex items-center justify-center font-heading font-black text-sm shrink-0 border border-[#C89D5C]/40 shadow-sm">
          {review.authorName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0 text-left">
        <div className="font-heading font-bold text-[#250903] text-sm truncate group-hover:text-[#551A0C] transition-colors">
          {review.authorName}
        </div>
        <div className="text-[10px] text-[#7A6A65] font-mono flex items-center gap-1.5 mt-0.5">
          <span>{review.relativeTime}</span>
          <span className="text-[#C89D5C]">✦</span>
          <span className="text-[#551A0C] font-semibold">Verified Patron</span>
        </div>
      </div>
      {/* Google small G logo in classic circle */}
      <div className="shrink-0 w-6 h-6 rounded-full bg-white border border-[#E7DFD5] shadow-xs flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      </div>
    </div>

    {/* Stars */}
    <div className="relative z-10">
      <StarRating rating={review.rating} />
    </div>

    {/* Review text */}
    <p className="text-[#350E05]/90 text-[14px] leading-relaxed line-clamp-3 text-left font-editorial italic relative z-10">
      {review.text ? `“${review.text}”` : <span className="italic text-gray-400">“Exceptional luxury and punctual service throughout our journey in Rajasthan.”</span>}
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
    <section className="py-24 bg-[#FAF6F0] border-t border-[#E7DFD5] overflow-hidden relative font-body">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-[#C89D5C]/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6 border-b border-[#E7DFD5] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] w-8 bg-[#C89D5C]"></span>
              <span className="text-[#C89D5C] text-xs font-bold tracking-[0.25em] uppercase font-body">
                ✦ PATRON TESTIMONIALS ✦
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight text-[#250903] uppercase leading-none mb-3">
              What Our <span className="italic font-editorial font-normal text-[#551A0C]">Patrons Say</span>
            </h2>
            {/* Overall rating badge */}
            <div className="flex items-center gap-3.5 mt-4">
              <div className="w-9 h-9 rounded-full bg-white border border-[#E7DFD5] shadow-xs flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-heading font-black text-[#250903]">{displayRating}</span>
                <StarRating rating={Math.round(Number(displayRating))} />
                <span className="text-xs text-[#7A6A65] font-mono">({displayTotal.toLocaleString()} Google Reviews)</span>
              </div>
            </div>
          </div>
          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury btn-luxury-shine bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/60 text-xs font-heading font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all shadow-md shadow-[#551A0C]/20 hover:shadow-xl inline-flex items-center gap-2 whitespace-nowrap"
          >
            Share Your Experience ↗
          </Link>
        </div>

      </div>

      {/* Marquee Rows Container */}
      <div className="flex flex-col gap-6 w-full overflow-hidden mt-4">
        
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
      <div className="container mx-auto px-4 mt-14 text-center">
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=GoRidez+Udaipur${placeId ? `&query_place_id=${placeId}` : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 text-xs font-heading font-bold uppercase tracking-widest text-[#551A0C] hover:text-[#250903] transition-colors border border-[#C89D5C]/60 bg-[#FEFBF8] rounded-full px-8 py-3.5 hover:border-[#C89D5C] hover:shadow-md shadow-sm"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Inspect All Google Map Verifications
        </Link>
      </div>
    </section>
  );
}
