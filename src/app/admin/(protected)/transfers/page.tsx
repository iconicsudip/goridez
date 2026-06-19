import { prisma } from '@/lib/prisma';
import TransfersClient from '@/components/admin/TransfersClient';

export default async function AdminTransfers() {
  const [roundTrips, airportTransfers, cities] = await Promise.all([
    prisma.roundTripRoute.findMany({
      include: { city: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.airportTransferRoute.findMany({
      include: { city: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <TransfersClient roundTrips={roundTrips} airportTransfers={airportTransfers} cities={cities} />
    </div>
  );
}
