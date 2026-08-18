import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getCarSlug, getSiteUrl } from '@/lib/utils';
import { LEGAL_PAGES } from '@/lib/legal-pages';

// Regenerated at most once an hour — cheap enough for how often crawlers actually re-fetch
// sitemap.xml, and keeps it from re-querying every field on every hit.
export const revalidate = 3600;

const STATIC_PAGES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/self-drive', changeFrequency: 'daily', priority: 0.9 },
  { path: '/taxi', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/cities', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blogs', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tours', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/villas', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const [noIndexSettings, cars, tours, blogs] = await Promise.all([
    prisma.seoSetting.findMany({ where: { noIndex: true }, select: { pagePath: true } }),
    prisma.car.findMany({ select: { id: true, make: true, model: true, updatedAt: true } }),
    prisma.tour.findMany({ select: { id: true, updatedAt: true } }),
    prisma.blog.findMany({ where: { isDraft: false }, select: { slug: true, updatedAt: true } }),
    // Note: cities have no dedicated detail route (only /blogs/[slug], /tours/[id], /cars/[id]
    // exist) — City.slug is unused leftover data, not a real path, so no per-city entries here.
  ]);

  const excluded = new Set(noIndexSettings.map((s) => s.pagePath));
  const entries: MetadataRoute.Sitemap = [];

  const addEntry = (
    path: string,
    lastModified: Date,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number
  ) => {
    if (excluded.has(path)) return; // respects the noIndex flag set in /admin/seo
    entries.push({ url: `${base}${path}`, lastModified, changeFrequency, priority });
  };

  const now = new Date();
  for (const page of STATIC_PAGES) {
    addEntry(page.path, now, page.changeFrequency, page.priority);
  }
  for (const page of LEGAL_PAGES) {
    addEntry(page.path, now, 'yearly', 0.3);
  }
  for (const car of cars) {
    addEntry(`/cars/${getCarSlug(car)}`, car.updatedAt, 'weekly', 0.8);
  }
  for (const tour of tours) {
    addEntry(`/tours/${tour.id}`, tour.updatedAt, 'monthly', 0.7);
  }
  for (const blog of blogs) {
    addEntry(`/blogs/${blog.slug}`, blog.updatedAt, 'monthly', 0.6);
  }

  return entries;
}
