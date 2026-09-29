import { prisma } from '@/lib/prisma';
import SelfDriveClient from './SelfDriveClient';
import { Suspense } from 'react';
import { generatePageMetadata, getSeoForPath } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata() {
  return generatePageMetadata('/self-drive');
}

export default async function SelfDrivePage() {
  const [cars, cities, seoSetting] = await Promise.all([
    prisma.car.findMany({ 
      where: { serviceTypes: { has: 'SELF_DRIVE' } },
      include: { packages: true, city: true, bookings: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    getSeoForPath('/self-drive'),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-body pt-28 pb-24 border-t border-[#E7DFD5]">
      {seoSetting?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSetting.structuredData }}
        />
      )}
      <Suspense fallback={<div className="text-center py-20 text-[#551A0C] font-heading text-sm animate-pulse">✦ Loading Royal Fleet...</div>}>
        <SelfDriveClient initialCars={cars} initialCities={cities} />
      </Suspense>
    </div>
  );
}
