import { prisma } from '@/lib/prisma';
import LegalPageManager from '@/components/admin/LegalPageManager';

export const dynamic = 'force-dynamic';

const DEFAULTS: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: '<p class="text-gray-600 mb-6 leading-relaxed">This Privacy Policy describes how GoRidez collects, uses, and protects your information.</p>',
  },
  terms: {
    title: 'Terms of Service',
    content: '<p class="text-gray-600 mb-6 leading-relaxed">These Terms of Service govern your use of GoRidez\'s vehicles, tours, and villa booking services.</p>',
  },
  'cancellation-refund': {
    title: 'Cancellation & Refund Policy',
    content: '<p class="text-gray-600 mb-6 leading-relaxed">This Cancellation & Refund Policy explains how booking cancellations and refunds are handled by GoRidez.</p>',
  },
  'shipping-policy': {
    title: 'Shipping & Service Delivery Policy',
    content: '<p class="text-gray-600 mb-6 leading-relaxed">GoRidez provides on-demand vehicle rental, chauffeur, and villa booking services with no physical shipping of goods. This page explains how our services are delivered.</p>',
  },
  contact: {
    title: 'Contact Us',
    content: '<p class="text-gray-600 mb-6 leading-relaxed">Have a question about a booking? Reach out to our team using the form below.</p>',
  },
};

export default async function AdminLegalPage() {
  const [rows, submissions] = await Promise.all([
    prisma.legalPage.findMany({ where: { id: { in: Object.keys(DEFAULTS) } } }),
    prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  const pages = Object.fromEntries(
    Object.keys(DEFAULTS).map((id) => {
      const row = rows.find((r) => r.id === id);
      return [id, { id, title: row?.title || DEFAULTS[id].title, content: row?.content || DEFAULTS[id].content, imageUrl: row?.imageUrl || null }];
    })
  );

  return <LegalPageManager pages={pages} submissions={submissions} />;
}
