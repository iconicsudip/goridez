import { prisma } from '@/lib/prisma';
import SitemapManager from '@/components/admin/SitemapManager';

export const dynamic = 'force-dynamic';

export default async function AdminSitemapPage() {
  const [noIndexPages, carCount, tourCount, blogCount] = await Promise.all([
    prisma.seoSetting.findMany({ where: { noIndex: true }, select: { pagePath: true, pageName: true } }),
    prisma.car.count(),
    prisma.tour.count(),
    prisma.blog.count({ where: { isDraft: false } }),
  ]);

  // Static + legal pages are the fixed set baked into sitemap.ts (home, about, self-drive, etc.
  // + the 5 legal pages) — kept in sync manually since it rarely changes.
  const staticPageCount = 9 + 5;

  return (
    <SitemapManager
      noIndexPages={noIndexPages}
      sitemapStats={{
        static: staticPageCount,
        cars: carCount,
        tours: tourCount,
        blogs: blogCount,
      }}
    />
  );
}
