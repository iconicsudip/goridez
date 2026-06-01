import { prisma } from '@/lib/prisma';
import VehicleHeader from '@/components/admin/VehicleHeader';
import VehicleGrid from '@/components/admin/VehicleGrid';

export default async function AdminVehicles() {
  const [cars, cities, tiers] = await Promise.all([
    prisma.car.findMany({
      include: { packages: true, city: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.globalPackageTier.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <VehicleHeader cities={cities} tiers={tiers} />
      <VehicleGrid cars={cars} cities={cities} tiers={tiers} />
    </div>
  );
}
