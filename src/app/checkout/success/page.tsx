import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Calendar, Car, Navigation, MapPin } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface PageProps {
  searchParams: Promise<{ bookingIds?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const bookingIdsStr = resolvedSearchParams.bookingIds;
  const bookingIds = bookingIdsStr ? bookingIdsStr.split(',') : [];

  const bookings = bookingIds.length > 0
    ? await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        include: { car: true, tour: true, villa: true, user: true },
      })
    : [];

  const firstBooking = bookings[0];
  const customerName = firstBooking?.driverName || firstBooking?.user?.name || 'Valued Client';
  const customerEmail = firstBooking?.driverEmail || firstBooking?.user?.email || '';

  const totalAmount = bookings.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalAdvance = bookings.reduce((acc, b) => acc + b.advancePaid, 0);
  const totalRemaining = bookings.reduce((acc, b) => acc + b.remainingAmount, 0);
  const totalDeposit = bookings.reduce((acc, b) => acc + b.depositAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-4 pt-28 pb-20">
      <div className="bg-gray-100 border border-gray-200 p-8 md:p-12 rounded-3xl max-w-2xl w-full text-center shadow-[0_0_50px_rgba(196,240,0,0.05)]">
        <CheckCircle2 size={72} className="text-green-700 mx-auto mb-6 animate-pulse" />
        
        <div className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Reservation Confirmed</div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Sovereign Receipt</h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto text-xs leading-relaxed font-mono">
          Your advance hold payment has been verified successfully. Your booking is confirmed under ledger ID: <span className="text-green-700">{bookingIds.join(', ') || 'N/A'}</span>
        </p>

        {/* Customer Info Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 text-left">
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Primary Client Details</div>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-500 block mb-0.5">Name</span>
              <span className="text-gray-900 font-bold">{customerName}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Email</span>
              <span className="text-gray-900 font-bold truncate block">{customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Booked Items Summary */}
        <div className="space-y-4 mb-8 text-left">
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Reserved Items Ledger</div>
          {bookings.map((booking) => {
            let itemTitle = 'Luxury Reservation';
            let itemTypeLabel = 'Rental Service';
            let Icon = ShieldCheck;

            if (booking.type === 'CAR' && booking.car) {
              itemTitle = `${booking.car.make} ${booking.car.model}`;
              itemTypeLabel = 'Luxury Fleet';
              Icon = Car;
            } else if (booking.type === 'TOUR' && booking.tour) {
              itemTitle = booking.tour.title;
              itemTypeLabel = 'Private Tour';
              Icon = Navigation;
            } else if (booking.type === 'VILLA' && booking.villa) {
              itemTitle = booking.villa.name;
              itemTypeLabel = 'Exclusive Stay';
              Icon = MapPin;
            }

            return (
              <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-green-600/10 border border-green-600/20 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-green-700" />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{itemTypeLabel}</div>
                    <div className="text-sm font-black uppercase text-gray-900">{itemTitle}</div>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono mt-1">
                      <Calendar size={10} />
                      {booking.startDate.toLocaleDateString('en-GB')} - {booking.endDate.toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-gray-500 text-[9px] uppercase tracking-widest">Item Total</div>
                  <div className="text-gray-900 font-bold text-sm">₹{booking.totalAmount.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ledger Calculations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 font-mono text-xs text-left space-y-4">
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Financial Invoice Summaries</div>
          
          <div className="flex justify-between text-gray-600">
            <span>Total Package Price</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-green-700 font-bold">
            <span>Advance Hold Paid (30%)</span>
            <span>₹{totalAdvance.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Security Deposit Hold</span>
            <span>₹{totalDeposit.toLocaleString()}</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-3 text-orange-400 font-bold">
            <span>Payable at Counter/Delivery</span>
            <span>₹{(totalRemaining + totalDeposit).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="flex-1">
            <button className="w-full bg-green-600 text-white font-black uppercase tracking-widest py-4 px-6 rounded-xl hover:bg-brand-hover transition-all text-xs">
              Go to Client Dashboard
            </button>
          </Link>
          <Link href="/" className="flex-1">
            <button className="w-full bg-transparent border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold uppercase tracking-widest py-4 px-6 rounded-xl transition-all text-xs">
              Return to Garage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
