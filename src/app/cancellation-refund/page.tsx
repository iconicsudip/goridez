import { prisma } from '@/lib/prisma';
import LegalPageLayout from '@/components/LegalPageLayout';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'cancellation-refund' } });
  return { title: `${data?.title || 'Cancellation & Refund Policy'} | GoRidez` };
}

export default async function CancellationRefundPage() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'cancellation-refund' } });

  const title = data?.title || 'Cancellation & Refund Policy';
  const content = data?.content || '<p class="text-gray-600 mb-6 leading-relaxed">This Cancellation & Refund Policy explains how booking cancellations and refunds are handled by GoRidez.</p>';

  return <LegalPageLayout title={title} imageUrl={data?.imageUrl} content={content} />;
}
