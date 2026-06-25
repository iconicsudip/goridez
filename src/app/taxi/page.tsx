import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import TaxiClient from './TaxiClient';

export default async function TaxiPage() {
  const [cars, cities, routes, airportRoutes] = await Promise.all([
    prisma.car.findMany({ 
      where: { serviceTypes: { has: 'TAXI' } },
      include: { packages: true, city: true, bookings: true } 
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.roundTripRoute.findMany({ orderBy: { routeTitle: 'asc' } }),
    prisma.airportTransferRoute.findMany({ orderBy: { zone: 'asc' } })
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-green-700 animate-pulse font-black tracking-widest uppercase">Loading Routes...</div></div>}>
      <TaxiClient initialCars={cars} initialCities={cities} initialRoutes={routes} initialAirportRoutes={airportRoutes} />
    </Suspense>
  );
}
