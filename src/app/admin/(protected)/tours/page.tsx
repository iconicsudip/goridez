import { prisma } from '@/lib/prisma';
import ToursClient from '@/components/admin/ToursClient';

export default async function AdminTours() {
  const [tours, cities] = await Promise.all([
    prisma.tour.findMany({
      include: { city: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <ToursClient tours={tours} cities={cities} />
    </div>
  );
}
