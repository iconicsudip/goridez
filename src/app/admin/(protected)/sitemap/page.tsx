import { prisma } from '@/lib/prisma';
import SitemapManager from '@/components/admin/SitemapManager';
import { getSitemapEntries } from '@/lib/sitemap-entries';

export const dynamic = 'force-dynamic';

export default async function AdminSitemapPage() {
  const [siteSettings, noIndexPages, entries] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.seoSetting.findMany({ where: { noIndex: true }, select: { pagePath: true, pageName: true } }),
    getSitemapEntries(),
  ]);

  const groupCounts: Record<string, number> = {};
  for (const entry of entries) {
    groupCounts[entry.group] = (groupCounts[entry.group] || 0) + 1;
  }

  return (
    <SitemapManager
      groupCounts={groupCounts}
      totalUrls={entries.length}
      noIndexPages={noIndexPages}
      initialExtraUrls={siteSettings?.sitemapExtraUrls || ''}
      initialExcludedPaths={siteSettings?.sitemapExcludedPaths || ''}
    />
  );
}
