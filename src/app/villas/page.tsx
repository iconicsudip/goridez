import { prisma } from '@/lib/prisma';
import VillaComboPage from './VillaComboPage';

export default async function VillasPage() {
  const [villas, cities, cars] = await Promise.all([
    prisma.villa.findMany({ include: { city: true, bookings: true } }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.car.findMany({ include: { packages: true, city: true, bookings: true } })
  ]);
  
  return <VillaComboPage initialVillas={villas} cities={cities} initialCars={cars} />;
}
