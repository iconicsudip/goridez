import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// RapidAPI Google Reviews Scraper — 25 hard requests / month
const RAPIDAPI_KEY =
  process.env.RAPIDAPI_REVIEWS_KEY || '66c9854608mshd7ee5ebe6e4afb7p16cdd9jsn2cfd36611be1';
const RAPIDAPI_HOST = 'google-reviews-scraper.p.rapidapi.com';
const SEARCH_ID =
  process.env.RAPIDAPI_REVIEWS_SEARCH_ID ||
  'U2FsdGVkX19DQKaHczi72qIWRpZ%252BnF4PapaG0l3YRy%252BpuVl098YG7ZyIj6Zemn87n2UiXP%252FN98lxFAi9K8nWJA%253D%253D';

const MONTHLY_LIMIT = 24; // keep 1 spare out of 25

/** Strip HTML tags from review text (e.g. <br><br> ) */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

export async function POST() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

    // ── Monthly usage guard ──────────────────────────────────────────────
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`; // e.g. "2026-7"
    const storedMonthKey = (settings as any)?.reviewSyncMonthKey || '';
    const storedCount   = (settings as any)?.reviewSyncMonthCount || 0;
    const currentCount  = storedMonthKey === monthKey ? storedCount : 0; // reset each month

    if (currentCount >= MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          error: `Monthly limit reached (${currentCount}/${MONTHLY_LIMIT} calls used). Resets 1st of next month.`,
        },
        { status: 429 }
      );
    }

    // ── Fetch from RapidAPI ──────────────────────────────────────────────
    const url =
      `https://${RAPIDAPI_HOST}/getReviewsV2` +
      `?searchId=${SEARCH_ID}&sort=relevant&nextpage=false&lang=en&country=us`;

    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      cache: 'no-store',
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      return NextResponse.json(
        { error: `RapidAPI error ${apiRes.status}`, detail: errBody },
        { status: 502 }
      );
    }

    // ── Confirmed response shape:
    // { placeId, averageRating, totalReviews, reviews: [...], nextPage }
    const data = await apiRes.json();
    const reviews: any[]    = data.reviews        || [];
    const avgRating: number  = data.averageRating  ?? 0;
    const totalReviews: number = data.totalReviews ?? 0;

    if (reviews.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No reviews returned from API.' });
    }

    // ── Upsert reviews (only 4★ and above — skip negative/spam) ─────────
    let synced  = 0;
    let skipped = 0;

    for (const r of reviews) {
      const uid   = r.reviewId || `${r.authorId}_${r.dateExact}`;
      const text  = stripHtml(r.comment || r.translatedComment || '');
      const stars = Number(r.ratingValue) || 0;

      // Skip reviews with no text or rating below 4
      if (!uid || !text || stars < 4) { skipped++; continue; }

      await prisma.googleReview.upsert({
        where: { id: uid },
        create: {
          id: uid,
          authorName:   r.author        || 'Anonymous',
          authorPhoto:  r.authorImage   || '',
          rating:       stars,
          text,
          relativeTime: r.date          || 'recently',
          publishedAt:  r.dateExact ? new Date(r.dateExact) : now,
        },
        update: {
          authorName:   r.author        || 'Anonymous',
          authorPhoto:  r.authorImage   || '',
          rating:       stars,
          text,
          relativeTime: r.date          || 'recently',
          publishedAt:  r.dateExact ? new Date(r.dateExact) : now,
          syncedAt:     now,
        },
      });
      synced++;
    }

    // ── Persist usage counter + overall rating stats ─────────────────────
    await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        lastReviewSync:       now,
        reviewSyncMonthKey:   monthKey,
        reviewSyncMonthCount: 1,
        googleAverageRating:  avgRating,
        googleTotalReviews:   totalReviews,
      },
      update: {
        lastReviewSync:       now,
        reviewSyncMonthKey:   monthKey,
        reviewSyncMonthCount: currentCount + 1,
        googleAverageRating:  avgRating,
        googleTotalReviews:   totalReviews,
      },
    });

    return NextResponse.json({
      synced,
      skipped,
      averageRating: avgRating,
      totalReviews,
      callsUsedThisMonth:  currentCount + 1,
      callsRemaining:      MONTHLY_LIMIT - (currentCount + 1),
      message: `Synced ${synced} review(s) (skipped ${skipped} low-rated/empty). ${MONTHLY_LIMIT - (currentCount + 1)} API calls left this month.`,
    });
  } catch (err: any) {
    console.error('[sync-reviews]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
