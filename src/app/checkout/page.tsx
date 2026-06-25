import CheckoutClient from './CheckoutClient';

export const metadata = {
  title: 'Secure Checkout | Sovereign Travel-Tech',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-28 pb-20">
      <CheckoutClient />
    </div>
  );
}
