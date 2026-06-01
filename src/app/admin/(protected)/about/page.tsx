import { prisma } from '@/lib/prisma';
import AboutManager from '@/components/admin/AboutManager';

export const dynamic = 'force-dynamic';

export default async function AdminAboutPage() {
  const aboutSettings = await prisma.aboutPage.findUnique({
    where: { id: 'singleton' }
  });

  return <AboutManager initialData={aboutSettings} />;
}
