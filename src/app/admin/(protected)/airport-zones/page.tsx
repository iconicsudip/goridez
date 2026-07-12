import { prisma } from '@/lib/prisma';
import AirportZoneManager from '@/components/admin/AirportZoneManager';

export const dynamic = 'force-dynamic';

export default async function AdminAirportZonesPage() {
  const [zones, cities] = await Promise.all([
    prisma.airportZone.findMany({
      include: { city: true, fares: { orderBy: { vehicleCategory: 'asc' } } },
      orderBy: [{ cityId: 'asc' }, { order: 'asc' }],
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return <AirportZoneManager zones={zones} cities={cities} />;
}
