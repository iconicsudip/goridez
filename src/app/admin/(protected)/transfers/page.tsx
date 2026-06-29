import { prisma } from '@/lib/prisma';
import TransfersClient from '@/components/admin/TransfersClient';

export default async function AdminTransfers() {
  const taxiSettings = await prisma.taxiFareSetting.findMany({
    orderBy: { vehicleCategory: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <TransfersClient taxiSettings={taxiSettings} />
    </div>
  );
}
