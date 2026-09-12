import { prisma } from '@/lib/prisma';
import AbandonedCheckoutsTable from '@/components/admin/AbandonedCheckoutsTable';

export const dynamic = 'force-dynamic';

export default async function AbandonedCheckoutsPage() {
  const leads = await prisma.checkoutLead.findMany({ orderBy: { updatedAt: 'desc' }, take: 300 });

  return <AbandonedCheckoutsTable initialLeads={JSON.parse(JSON.stringify(leads))} />;
}
