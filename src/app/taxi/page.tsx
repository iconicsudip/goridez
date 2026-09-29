import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import TaxiClient from './TaxiClient';
import { generatePageMetadata, getSeoForPath } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata() {
  return generatePageMetadata('/taxi');
}

export default async function TaxiPage() {
  const [cars, cities, taxiSettings, siteSettings, seoSetting] = await Promise.all([
    prisma.car.findMany({
      where: { serviceTypes: { hasSome: ['TAXI', 'AIRPORT_TRANSFER'] } },
      include: { packages: true, city: true, bookings: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.taxiFareSetting.findMany({ orderBy: { vehicleCategory: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    getSeoForPath('/taxi'),
  ]);

  // Airport Transfers currently operate out of Udaipur only (matches the hardcoded
  // Udaipur airport/city coordinates used elsewhere in this flow).
  const udaipur = cities.find(c => c.name.toLowerCase() === 'udaipur');
  const airportZones = udaipur
    ? await prisma.airportZone.findMany({
        where: { cityId: udaipur.id },
        include: { fares: true },
        orderBy: { order: 'asc' },
      })
    : [];

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]"><div className="text-[#551A0C] font-serif animate-pulse font-bold tracking-widest uppercase text-sm">✦ Loading Sovereign Routes... ✦</div></div>}>
      <TaxiClient
        initialCars={cars}
        initialCities={cities}
        taxiSettings={taxiSettings}
        airportZones={airportZones}
        airportName={udaipur?.airportName || 'the Airport'}
        siteSettings={siteSettings}
      />
    </Suspense>
  );
}
