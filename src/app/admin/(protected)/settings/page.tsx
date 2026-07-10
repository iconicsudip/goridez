import { prisma } from '@/lib/prisma';
import SiteSettingsManager from '@/components/admin/SiteSettingsManager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const siteSettings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' }
  });

  return <SiteSettingsManager initialData={siteSettings} />;
}
