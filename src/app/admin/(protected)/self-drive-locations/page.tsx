import { prisma } from '@/lib/prisma';
import SelfDriveLocationManager from '@/components/admin/SelfDriveLocationManager';

export const dynamic = 'force-dynamic';

export default async function AdminSelfDriveLocationsPage() {
  const [locations, cities] = await Promise.all([
    prisma.selfDriveLocation.findMany({
      include: { city: true },
      orderBy: [{ cityId: 'asc' }, { order: 'asc' }],
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return <SelfDriveLocationManager locations={locations} cities={cities} />;
}
