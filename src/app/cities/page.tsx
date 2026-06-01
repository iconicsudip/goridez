import { prisma } from '@/lib/prisma';
import CitiesClient from './CitiesClient';

export default async function CitiesPage() {
  const [cities, cars, villas, tours] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.car.findMany({ include: { packages: true, city: true } }),
    prisma.villa.findMany({ include: { city: true } }),
    prisma.tour.findMany({ include: { city: true } })
  ]);
  
  return <CitiesClient initialCities={cities} initialCars={cars} initialVillas={villas} initialTours={tours} />;
}
