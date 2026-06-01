import { prisma } from '@/lib/prisma';
import ToursClientPage from './ToursClientPage';

export default async function ToursPage() {
  const [tours, cities] = await Promise.all([
    prisma.tour.findMany({ include: { city: true, bookings: true } }),
    prisma.city.findMany({ orderBy: { name: 'asc' } })
  ]);
  
  return <ToursClientPage initialTours={tours} cities={cities} />;
}
