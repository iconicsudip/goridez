import { prisma } from '@/lib/prisma';
import AiSeoManager from '@/components/admin/AiSeoManager';
import { buildDefaultRobotsTxt } from '@/lib/robots-txt';
import { generateLlmsTxtDraft } from '@/lib/llms-txt';
import { getSiteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AiSeoPage() {
  const [siteSettings, noIndexPages, carCount, tourCount, blogCount] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.seoSetting.findMany({ where: { noIndex: true }, select: { pagePath: true, pageName: true } }),
    prisma.car.count(),
    prisma.tour.count(),
    prisma.blog.count({ where: { isDraft: false } }),
  ]);

  // Static + legal pages are the fixed set baked into sitemap.ts (home, about, self-drive, etc.
  // + the 5 legal pages) — kept in sync manually since it rarely changes.
  const staticPageCount = 9 + 5;

  const effectiveRobotsTxt = siteSettings?.customRobotsTxt?.trim() || buildDefaultRobotsTxt();
  const effectiveLlmsTxt = siteSettings?.llmsTxt?.trim() || (await generateLlmsTxtDraft());

  return (
    <AiSeoManager
      siteUrl={getSiteUrl()}
      isRobotsCustomized={!!siteSettings?.customRobotsTxt?.trim()}
      isLlmsCustomized={!!siteSettings?.llmsTxt?.trim()}
      initialRobotsTxt={effectiveRobotsTxt}
      initialLlmsTxt={effectiveLlmsTxt}
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
