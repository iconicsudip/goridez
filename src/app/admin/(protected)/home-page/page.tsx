import { prisma } from '@/lib/prisma';
import HomePageManager from '@/components/admin/HomePageManager';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const [homePageSettings, siteSettings] = await Promise.all([
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
  ]);

  return <HomePageManager initialData={{ ...homePageSettings, siteSettings }} />;
}
