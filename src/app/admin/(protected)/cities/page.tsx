import { prisma } from '@/lib/prisma';
import CitiesClient from '@/components/admin/CitiesClient';

export default async function AdminCities() {
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <CitiesClient cities={cities} />
    </div>
  );
}
