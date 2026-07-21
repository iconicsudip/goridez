import { prisma } from '@/lib/prisma';
import CitiesClient from './CitiesClient';

export const dynamic = 'force-dynamic';

export default async function CitiesPage() {
  const [cities, cars, villas, tours, airportZones] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.car.findMany({
      include: { packages: true, city: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.villa.findMany({ include: { city: true } }),
    prisma.tour.findMany({ include: { city: true } }),
    prisma.airportZone.findMany(),
  ]);

  return <CitiesClient initialCities={cities} initialCars={cars} initialVillas={villas} initialTours={tours} initialAirportZones={airportZones} />;
}
