import { prisma } from '@/lib/prisma';
import VillasClient from '@/components/admin/VillasClient';

export default async function AdminVillas() {
  const [villas, cities] = await Promise.all([
    prisma.villa.findMany({
      include: { city: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <VillasClient villas={villas} cities={cities} />
    </div>
  );
}
