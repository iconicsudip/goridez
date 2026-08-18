import type { MetadataRoute } from 'next';
import { getSitemapEntries } from '@/lib/sitemap-entries';
import { getSiteUrl } from '@/lib/utils';

// Regenerated at most once an hour — cheap enough for how often crawlers actually re-fetch
// sitemap.xml, and keeps it from re-querying every field on every hit.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const entries = await getSitemapEntries();

  return entries.map((entry) => ({
    url: `${base}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
