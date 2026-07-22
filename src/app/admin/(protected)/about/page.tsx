import { prisma } from '@/lib/prisma';
import AboutManager from '@/components/admin/AboutManager';

export const dynamic = 'force-dynamic';

export default async function AdminAboutPage() {
  const [aboutSettings, homePageSettings] = await Promise.all([
    prisma.aboutPage.findUnique({ where: { id: 'singleton' } }),
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
  ]);

  return (
    <AboutManager
      initialData={aboutSettings}
      trustData={{
        trustBadge: homePageSettings?.trustBadge || '✦ PROMISE OF EXCELLENCE',
        trustTitle: homePageSettings?.trustTitle || 'EVERY JOURNEY BEGINS WITH TRUST. EVERY TRUST BEGINS WITH GORIDEZ.',
        trustDescription: homePageSettings?.trustDescription || 'We combine 100% vetted luxury vehicles, professional chauffeurs, transparent pricing, and 24/7 concierge support to make your Rajasthan travel completely seamless.',
        trustImage: homePageSettings?.trustImage || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
      }}
    />
  );
}
