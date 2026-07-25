import { prisma } from '@/lib/prisma';
import CartClient from './CartClient';

export const metadata = {
  title: 'Your Garage | GoRidez',
  description: 'View your luxury fleet reservations and manage your cart.',
};

export const revalidate = 300;

export default async function CartPage() {
  const [selfDriveLocations, cars] = await Promise.all([
    prisma.selfDriveLocation.findMany({ orderBy: { order: 'asc' } }),
    prisma.car.findMany({ select: { id: true, cityId: true } }),
  ]);

  return <CartClient selfDriveLocations={selfDriveLocations} cars={cars} />;
}
