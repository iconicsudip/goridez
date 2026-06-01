import { prisma } from '@/lib/prisma';
import FaqManager from '@/components/admin/FaqManager';

export const dynamic = 'force-dynamic';

export default async function AdminFaqsPage() {
  const faqs = await prisma.fAQ.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <FaqManager faqs={faqs} />;
}
