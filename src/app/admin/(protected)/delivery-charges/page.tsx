import { prisma } from '@/lib/prisma';
import DeliveryChargeClient from './DeliveryChargeClient';

export default async function DeliveryChargesPage() {
  const [charges, cities] = await Promise.all([
    prisma.deliveryCharge.findMany({ include: { city: true } }),
    prisma.city.findMany()
  ]);

  return <DeliveryChargeClient initialCharges={charges} cities={cities} />;
}
