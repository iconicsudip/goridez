import { prisma } from '@/lib/prisma';
import LegalPageLayout from '@/components/LegalPageLayout';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'privacy' } });
  return { title: `${data?.title || 'Privacy Policy'} | GoRidez` };
}

export default async function PrivacyPolicyPage() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'privacy' } });

  const title = data?.title || 'Privacy Policy';
  const content = data?.content || '<p class="text-gray-600 mb-6 leading-relaxed">This Privacy Policy describes how GoRidez collects, uses, and protects your information.</p>';

  return <LegalPageLayout title={title} imageUrl={data?.imageUrl} content={content} />;
}
