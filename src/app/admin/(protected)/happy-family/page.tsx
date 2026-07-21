import { prisma } from '@/lib/prisma';
import HappyFamilyManager from '@/components/admin/HappyFamilyManager';

export const dynamic = 'force-dynamic';

export default async function AdminHappyFamilyPage() {
  const customers = await prisma.happyCustomer.findMany({ orderBy: { order: 'asc' } });

  return <HappyFamilyManager customers={customers} />;
}
