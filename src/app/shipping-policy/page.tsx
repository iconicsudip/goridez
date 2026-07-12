import { prisma } from '@/lib/prisma';
import LegalPageLayout from '@/components/LegalPageLayout';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'shipping-policy' } });
  return { title: `${data?.title || 'Shipping & Service Delivery Policy'} | GoRidez` };
}

export default async function ShippingPolicyPage() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'shipping-policy' } });

  const title = data?.title || 'Shipping & Service Delivery Policy';
  const content = data?.content || '<p class="text-gray-600 mb-6 leading-relaxed">GoRidez provides on-demand vehicle rental, chauffeur, and villa booking services with no physical shipping of goods. This page explains how our services are delivered.</p>';

  return <LegalPageLayout title={title} imageUrl={data?.imageUrl} content={content} />;
}
