import { prisma } from '@/lib/prisma';
import RobotsTxtManager from '@/components/admin/RobotsTxtManager';
import { buildDefaultRobotsTxt } from '@/lib/robots-txt';

export const dynamic = 'force-dynamic';

export default async function AdminRobotsPage() {
  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const isCustomized = !!siteSettings?.customRobotsTxt?.trim();
  const effectiveRobotsTxt = siteSettings?.customRobotsTxt?.trim() || buildDefaultRobotsTxt();

  return <RobotsTxtManager isCustomized={isCustomized} initialRobotsTxt={effectiveRobotsTxt} />;
}
