import { prisma } from '@/lib/prisma';
import ChauffeurClient from './ChauffeurClient';
import { Suspense } from 'react';

export default async function ChauffeurPage() {
  const [cars, cities] = await Promise.all([
    prisma.car.findMany({ 
      where: { serviceTypes: { has: 'WITH_DRIVER' } },
      include: { packages: true, city: true, bookings: true } 
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-24 pb-20">
      <Suspense fallback={<div className="text-center py-20">Loading luxury chauffeur fleet...</div>}>
        <ChauffeurClient initialCars={cars} initialCities={cities} />
      </Suspense>
    </div>
  );
}
