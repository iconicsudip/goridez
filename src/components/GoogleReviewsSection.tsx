'use client';

import Link from 'next/link';
import { Star, ShieldCheck, Check, Quote, ArrowUpRight } from 'lucide-react';

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
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          className={star <= rating ? 'text-[#C89D5C] fill-[#C89D5C]' : 'text-[#D4C3B2] fill-[#D4C3B2]/30'}
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
  <div className="card-luxury w-[380px] sm:w-[420px] lg:w-[450px] shrink-0 bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5 shadow-[0_16px_45px_rgba(42,14,7,0.10),0_2px_8px_rgba(42,14,7,0.05)] hover:shadow-[0_26px_65px_rgba(42,14,7,0.20)] transition-all duration-500 relative group select-none overflow-hidden">
    
    {/* Subtle Luxury Gradient Accent at Top Corner */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C89D5C]/15 via-transparent to-transparent pointer-events-none rounded-tr-3xl" />
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C89D5C]/40 to-transparent group-hover:via-[#C89D5C] transition-all duration-500" />

    {/* Top Row: Stars + Quote Icon + Google Tag */}
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-2">
        <StarRating rating={review.rating} />
        <span className="text-[11px] font-mono font-bold text-[#551A0C] bg-[#F8F3EA] border border-[#D4C3B2] px-2 py-0.5 rounded-md">
          {review.rating}.0
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Google Mini Badge */}
        <div className="w-6 h-6 rounded-full bg-white border border-[#D4C3B2] shadow-2xs flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>

        {/* Quote Badge */}
        <div className="w-7 h-7 rounded-lg bg-[#551A0C]/10 text-[#551A0C] border border-[#C89D5C]/40 flex items-center justify-center shrink-0">
          <Quote size={13} className="text-[#551A0C] fill-[#551A0C]/20" />
        </div>
      </div>
    </div>

    {/* Review Text Body */}
    <div className="relative z-10 flex-1 min-h-[76px] flex items-center">
      <p className="text-[#250903] text-[14.5px] sm:text-[15px] leading-relaxed line-clamp-4 text-left font-editorial italic font-normal tracking-wide">
        {review.text ? `“${review.text}”` : <span className="italic text-[#8C6D53]">“Exceptional luxury and punctual service throughout our journey in Rajasthan.”</span>}
      </p>
    </div>

    {/* Bottom Author Dossier Pod */}
    <div className="pt-4 border-t border-[#F0E9DF] flex items-center justify-between gap-3 relative z-10">
      <div className="flex items-center gap-3 min-w-0">
        {review.authorPhoto ? (
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#C89D5C]/60 shrink-0 shadow-xs">
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
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#551A0C] to-[#250903] text-[#DFB574] flex items-center justify-center font-heading font-black text-sm shrink-0 border border-[#C89D5C]/60 shadow-xs">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 text-left">
          <div className="font-heading font-black text-[#250903] text-sm uppercase tracking-tight truncate group-hover:text-[#551A0C] transition-colors">
            {review.authorName}
          </div>
          <div className="text-[10px] text-[#8C6D53] font-mono flex items-center gap-1.5 mt-0.5">
            <span>{review.relativeTime}</span>
            <span className="text-[#C89D5C]">✦</span>
            <span className="text-[#551A0C] font-bold flex items-center gap-1">
              <ShieldCheck size={11} className="text-[#C89D5C]" /> Verified
            </span>
          </div>
        </div>
      </div>

      <span className="text-[9px] font-mono font-bold text-[#8C6D53] uppercase tracking-widest bg-[#F8F3EA] border border-[#D4C3B2] px-2.5 py-1 rounded-md shrink-0">
        Google Patron
      </span>
    </div>

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
    <section className="py-24 bg-[#F0E9DF] border-y-2 border-[#D4C3B2] overflow-hidden relative font-body">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-[#C89D5C]/[0.08] blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-[#551A0C]/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-8 border-b border-[#D4C3B2] pb-10">
          <div>
            <div className="flex items-center gap-3 mb-3.5">
              <span className="h-[2px] w-8 bg-[#C89D5C] rounded-full"></span>
              <span className="text-[#551A0C] text-xs font-bold tracking-[0.25em] uppercase font-mono">
                ✦ PATRON TESTIMONIALS ✦
              </span>
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight text-[#250903] uppercase leading-none mb-4">
              What Our <span className="italic font-editorial font-normal text-[#551A0C]">Patrons Say</span>
            </h2>

            {/* Overall Prestige Google Rating Banner */}
            <div className="inline-flex flex-wrap items-center gap-3.5 bg-white border border-[#D4C3B2] px-4.5 py-2.5 rounded-2xl shadow-sm mt-2">
              <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#D4C3B2] shadow-2xs flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-heading font-black text-[#250903] leading-none">{displayRating}</span>
                <StarRating rating={Math.round(Number(displayRating))} />
                <span className="text-xs text-[#8C6D53] font-mono font-bold">({displayTotal.toLocaleString()} Google Reviews)</span>
              </div>

              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#C89D5C]" />
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono">
                <Check size={12} strokeWidth={3} className="text-emerald-600" /> Verified Excellence
              </span>
            </div>
          </div>

          <Link
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] border border-[#C89D5C]/60 hover:border-[#DFB574] text-xs font-heading font-bold uppercase tracking-[0.2em] px-7 py-4 rounded-full transition-all shadow-md shadow-[#551A0C]/25 hover:shadow-xl hover:scale-105 active:scale-95 inline-flex items-center gap-2.5 whitespace-nowrap cursor-pointer"
          >
            Share Your Experience <ArrowUpRight size={15} />
          </Link>
        </div>

      </div>

      {/* Marquee Rows Container */}
      <div className="flex flex-col gap-6 w-full overflow-hidden mt-4">
        
        {/* Row 1: Moves Left */}
        <div className="relative flex overflow-x-hidden py-2 w-full mask-gradient">
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
        <div className="relative flex overflow-x-hidden py-2 w-full mask-gradient">
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
          className="inline-flex items-center gap-3 text-xs font-heading font-bold uppercase tracking-[0.2em] text-[#551A0C] hover:text-[#DFB574] bg-white hover:bg-[#551A0C] border border-[#D4C3B2] hover:border-[#C89D5C] rounded-full px-9 py-4 shadow-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          Inspect All Google Map Verifications
          <ArrowUpRight size={14} className="text-[#C89D5C]" />
        </Link>
      </div>
    </section>
  );
}
