import { prisma } from '@/lib/prisma';
import SelfDriveClient from './SelfDriveClient';
import { Suspense } from 'react';

export default async function SelfDrivePage() {
  const [cars, cities] = await Promise.all([
    prisma.car.findMany({ include: { packages: true, city: true, bookings: true } }),
    prisma.city.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-24 pb-20">
      <Suspense fallback={<div className="text-center py-20">Loading vehicles...</div>}>
        <SelfDriveClient initialCars={cars} initialCities={cities} />
      </Suspense>
    </div>
  );
}
