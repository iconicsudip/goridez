import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Secure Checkout | Sovereign Travel-Tech',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-28 pb-20">
      <CheckoutClient />
    </div>
  );
}
