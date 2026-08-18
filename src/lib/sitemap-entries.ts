import { prisma } from '@/lib/prisma';
import { getCarSlug, normalizePagePath } from '@/lib/utils';
import { LEGAL_PAGES } from '@/lib/legal-pages';

export type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  path: string;
  title: string;
  group: 'Core Pages' | 'Legal Pages' | 'Vehicles' | 'Tours' | 'Blog Posts' | 'Custom';
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const STATIC_PAGES: { path: string; title: string; changeFrequency: ChangeFrequency; priority: number }[] = [
  { path: '/', title: 'Home', changeFrequency: 'daily', priority: 1 },
  { path: '/about', title: 'About Us', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/self-drive', title: 'Self Drive Fleet', changeFrequency: 'daily', priority: 0.9 },
  { path: '/taxi', title: 'Taxi & Outstation', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/cities', title: 'Cities We Serve', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blogs', title: 'Editorial Journal / Blogs', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/tours', title: 'Rajasthan Tours', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/villas', title: 'Villa Stays', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/contact', title: 'Contact Us', changeFrequency: 'yearly', priority: 0.4 },
];

/** Parses a newline-separated textarea value into clean, deduped relative paths. */
function parsePathList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => normalizePagePath(line))
    )
  );
}

/**
 * The single source of truth for every URL that appears in the sitemap — used by the live
 * /sitemap.xml, the human-readable /sitemap HTML page, the /rss.xml feed (blog posts only),
 * and the admin Sitemap manager's stats. Content-derived entries (cars, tours, blogs, static
 * pages) can't drift into broken links since they're read live from the database; on top of
 * that, admins can add extra paths or exclude specific ones via SiteSettings.
 */
export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [siteSettings, noIndexSettings, cars, tours, blogs] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.seoSetting.findMany({ where: { noIndex: true }, select: { pagePath: true } }),
    prisma.car.findMany({ select: { id: true, make: true, model: true, updatedAt: true } }),
    prisma.tour.findMany({ select: { id: true, title: true, updatedAt: true } }),
    prisma.blog.findMany({ where: { isDraft: false }, select: { title: true, slug: true, updatedAt: true } }),
  ]);

  const excluded = new Set([
    ...noIndexSettings.map((s) => s.pagePath),
    ...parsePathList(siteSettings?.sitemapExcludedPaths || ''),
  ]);

  const entries: SitemapEntry[] = [];
  const now = new Date();

  const add = (entry: Omit<SitemapEntry, 'path'> & { path: string }) => {
    if (excluded.has(entry.path)) return;
    entries.push(entry);
  };

  for (const page of STATIC_PAGES) {
    add({ ...page, group: 'Core Pages', lastModified: now });
  }
  for (const page of LEGAL_PAGES) {
    add({ path: page.path, title: page.defaultTitle, group: 'Legal Pages', lastModified: now, changeFrequency: 'yearly', priority: 0.3 });
  }
  for (const car of cars) {
    add({
      path: `/cars/${getCarSlug(car)}`,
      title: `${car.make} ${car.model}`,
      group: 'Vehicles',
      lastModified: car.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }
  for (const tour of tours) {
    add({ path: `/tours/${tour.id}`, title: tour.title, group: 'Tours', lastModified: tour.updatedAt, changeFrequency: 'monthly', priority: 0.7 });
  }
  for (const blog of blogs) {
    add({ path: `/blogs/${blog.slug}`, title: blog.title, group: 'Blog Posts', lastModified: blog.updatedAt, changeFrequency: 'monthly', priority: 0.6 });
  }

  const extraPaths = parsePathList(siteSettings?.sitemapExtraUrls || '');
  for (const path of extraPaths) {
    if (entries.some((e) => e.path === path)) continue; // already covered by a real content entry
    add({ path, title: path, group: 'Custom', lastModified: now, changeFrequency: 'monthly', priority: 0.5 });
  }

  return entries;
}
