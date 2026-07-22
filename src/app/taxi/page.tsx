import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import TaxiClient from './TaxiClient';
import { generatePageMetadata, getSeoForPath } from '@/lib/seo';

export const dynamic = 'force-dynamic';

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-green-700 animate-pulse font-black tracking-widest uppercase">Loading Routes...</div></div>}>
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
