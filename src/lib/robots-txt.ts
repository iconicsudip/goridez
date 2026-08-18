import { getSiteUrl } from '@/lib/utils';

/** The default robots.txt served until an admin saves a custom one on /admin/robots. */
export function buildDefaultRobotsTxt(): string {
  const base = getSiteUrl();
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    'Disallow: /checkout',
    'Disallow: /cart',
    'Disallow: /dashboard',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}
