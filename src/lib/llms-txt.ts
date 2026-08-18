import { prisma } from '@/lib/prisma';
import { getCarSlug, getSiteUrl } from '@/lib/utils';
import { LEGAL_PAGES } from '@/lib/legal-pages';

/**
 * Builds a draft `llms.txt` file (see https://llmstxt.org) from live site content — the same
 * markdown-links-with-descriptions format the spec expects, generated deterministically from
 * the database rather than an LLM call (there's nothing to "hallucinate": every link below is
 * a real page). Used both as the live fallback served at /llms.txt when the admin hasn't saved
 * a custom version, and as the draft the "Generate" button in /admin/llms prefills — the
 * admin can then edit or fully rewrite it before saving.
 */
export async function generateLlmsTxtDraft(): Promise<string> {
  const base = getSiteUrl();

  const [siteSettings, cities, tours, cars, blogs] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.city.findMany({ select: { name: true } }),
    prisma.tour.findMany({ select: { id: true, title: true, description: true } }),
    prisma.car.findMany({
      where: { availability: true },
      select: { make: true, model: true, category: true, seatingCapacity: true, fuelType: true },
      take: 40,
    }),
    prisma.blog.findMany({
      where: { isDraft: false },
      select: { title: true, slug: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const lines: string[] = [];

  lines.push('# GoRidez');
  lines.push('');
  lines.push(
    '> Premium self-drive car rental, chauffeur-driven taxi service, and curated Rajasthan tours, based in Udaipur, India. Offers self-drive cars, one-way and round-trip taxis, airport transfers, guided multi-day Rajasthan tours, and luxury villa stays.'
  );
  lines.push('');

  lines.push('## Services');
  lines.push(`- [Self-Drive Cars](${base}/self-drive): Book a self-drive vehicle across Rajasthan, by the day or longer.`);
  lines.push(`- [Taxi & Outstation](${base}/taxi): Chauffeur-driven one-way and round-trip taxi service.`);
  lines.push(`- [Airport Transfers](${base}/taxi?mode=AIRPORT_TRANSFER): Fixed-fare airport pickup and drop.`);
  lines.push(`- [Rajasthan Tours](${base}/tours): Guided multi-day tours across Rajasthan.`);
  lines.push(`- [Villa Stays](${base}/villas): Luxury villa accommodation, with or without a car.`);
  lines.push('');

  if (cars.length > 0) {
    lines.push('## Vehicles Available');
    const seen = new Set<string>();
    for (const car of cars) {
      const slug = getCarSlug(car);
      if (seen.has(slug)) continue; // dedupe same make/model listed multiple times (different packages)
      seen.add(slug);
      const detail = [car.category, `${car.seatingCapacity} seater`, car.fuelType].filter(Boolean).join(', ');
      lines.push(`- [${car.make} ${car.model}](${base}/cars/${slug})${detail ? `: ${detail}` : ''}`);
    }
    lines.push('');
  }

  if (cities.length > 0) {
    // Cities have no dedicated detail route — link to the self-drive fleet pre-filtered to
    // that city (the same real, working URL Footer.tsx links to), not a fake /cities/[slug].
    lines.push('## Cities We Serve');
    for (const city of cities) {
      const formattedName = city.name.charAt(0).toUpperCase() + city.name.slice(1).toLowerCase();
      lines.push(`- [${formattedName}](${base}/self-drive?pickupCity=${encodeURIComponent(formattedName)})`);
    }
    lines.push('');
  }

  if (tours.length > 0) {
    lines.push('## Tours');
    for (const tour of tours) {
      const plainDesc = (tour.description || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 140);
      lines.push(`- [${tour.title}](${base}/tours/${tour.id})${plainDesc ? `: ${plainDesc}` : ''}`);
    }
    lines.push('');
  }

  if (blogs.length > 0) {
    lines.push('## Guides & Articles');
    for (const blog of blogs) {
      lines.push(`- [${blog.title}](${base}/blogs/${blog.slug})`);
    }
    lines.push('');
  }

  lines.push('## Company');
  lines.push(`- [About Us](${base}/about)`);
  lines.push(`- [Contact](${base}/contact)`);
  for (const page of LEGAL_PAGES) {
    lines.push(`- [${page.defaultTitle}](${base}${page.path})`);
  }
  if (siteSettings?.googlePlaceId) {
    lines.push('');
    lines.push(`Verified business — Google rating ${siteSettings.googleAverageRating.toFixed(1)}/5 from ${siteSettings.googleTotalReviews} reviews.`);
  }

  return lines.join('\n').trim() + '\n';
}
