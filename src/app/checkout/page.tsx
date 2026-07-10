import CheckoutClient from './CheckoutClient';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Secure Checkout | Sovereign Travel-Tech',
};

export default async function CheckoutPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'singleton' },
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-28 pb-20">
      <CheckoutClient razorpayKeyId={settings?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123'} />
    </div>
  );
}
