import { prisma } from '@/lib/prisma';
import CitiesClient from '@/components/admin/CitiesClient';

export default async function AdminCities() {
  const [cities, siteSettings] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <CitiesClient cities={cities} initialSiteSettings={siteSettings} />
    </div>
  );
}
