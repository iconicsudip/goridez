import { Suspense } from 'react';
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
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-body pt-28 pb-20 border-t border-[#E7DFD5]">
      <Suspense fallback={<div className="text-center py-20 text-xs font-serif uppercase tracking-widest text-[#8C6D53] animate-pulse">✦ Initializing Secure Checkout... ✦</div>}>
        <CheckoutClient
          razorpayKeyId={settings?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123'}
          guestCheckoutEnabled={settings?.guestCheckoutEnabled || false}
        />
      </Suspense>
    </div>
  );
}
