import { prisma } from '@/lib/prisma';
import HomePageManager from '@/components/admin/HomePageManager';

export const dynamic = 'force-dynamic';

export default async function AdminHomePage() {
  const homePageSettings = await prisma.homePage.findUnique({
    where: { id: 'singleton' }
  });

  return <HomePageManager initialData={homePageSettings} />;
}
