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
  
  const baseFare = Math.round(totalAmount / 1.18);
  const gstAmount = totalAmount - baseFare;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] flex flex-col items-center justify-center p-4 pt-32 pb-24 font-sans">
      <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-8 md:p-14 rounded-3xl max-w-2xl w-full text-center shadow-2xl border-classic-frame relative overflow-hidden">
        {/* Royal Crest / Medallion */}
        <div className="w-20 h-20 rounded-full bg-[#551A0C]/10 border-2 border-[#C89D5C] mx-auto mb-6 flex items-center justify-center shadow-lg relative">
          <CheckCircle2 size={44} className="text-[#C89D5C]" />
          <span className="absolute -bottom-2 bg-[#551A0C] text-[#DFB574] text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border border-[#C89D5C]/40">
            ROYAL SEAL
          </span>
        </div>
        
        <div className="text-[10px] font-bold font-mono text-[#C89D5C] uppercase tracking-[0.25em] mb-2">Reservation Confirmed</div>
        <h1 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-4">
          Sovereign <span className="font-editorial italic font-normal text-[#C89D5C]">Receipt</span>
        </h1>
        
        <p className="text-[#6A5749] mb-8 max-w-md mx-auto text-xs leading-relaxed font-mono">
          Your advance hold payment has been verified successfully. Your booking is confirmed under ledger ID: <span className="font-bold text-[#551A0C]">{bookingIds.join(', ') || 'N/A'}</span>
        </p>
 
        {/* Customer Info Card */}
        <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-5 mb-6 text-left border-classic-frame">
          <div className="text-[9px] font-bold font-mono text-[#8C6D53] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
            <span className="text-[#C89D5C]">✦</span> PRIMARY CLIENT CREDENTIALS
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#8C6D53] block mb-0.5 text-[10px] uppercase">Client Name</span>
              <span className="text-[#250903] font-bold font-serif text-sm">{customerName}</span>
            </div>
            <div>
              <span className="text-[#8C6D53] block mb-0.5 text-[10px] uppercase">Registered Email</span>
              <span className="text-[#250903] font-bold truncate block">{customerEmail}</span>
            </div>
          </div>
        </div>
 
        {/* Booked Items Summary */}
        <div className="space-y-4 mb-8 text-left">
          <div className="text-[9px] font-bold font-mono text-[#8C6D53] uppercase tracking-[0.2em] pl-1 flex items-center gap-1.5">
            <span className="text-[#C89D5C]">✦</span> RESERVED FLEET LEDGER
          </div>
          {bookings.map((booking) => {
            let itemTitle = 'Luxury Reservation';
            let itemTypeLabel = 'Rental Service';
            let Icon = ShieldCheck;
 
            if (booking.type === 'CAR' && booking.car) {
              itemTitle = `${booking.car.make} ${booking.car.model}`;
              itemTypeLabel = 'Sovereign Fleet';
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
              <div key={booking.id} className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-classic-frame">
                <div className="flex gap-4 items-center">
                  <div className="w-11 h-11 rounded-xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center shrink-0 text-[#551A0C]">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-[#C89D5C] font-mono uppercase tracking-widest font-bold">{itemTypeLabel}</div>
                    <div className="text-base font-bold font-serif uppercase text-[#551A0C]">{itemTitle}</div>
                    <div className="flex items-center gap-1.5 text-[9px] text-[#8C6D53] font-mono mt-1">
                      <Calendar size={11} className="text-[#C89D5C]" />
                      {booking.startDate.toLocaleDateString('en-GB')} - {booking.endDate.toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-[#8C6D53] text-[9px] uppercase tracking-widest">Rate Locked</div>
                  <div className="text-[#551A0C] font-bold font-serif text-lg">₹{booking.totalAmount.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Ledger Calculations */}
        <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-6 mb-8 font-mono text-xs text-left space-y-3.5 border-classic-frame">
          <div className="text-[9px] font-bold text-[#8C6D53] uppercase tracking-[0.2em] border-b border-[#E7DFD5] pb-2 flex items-center gap-1.5">
            <span className="text-[#C89D5C]">✦</span> FINANCIAL INVOICE SUMMARY
          </div>
          
          <div className="flex justify-between text-[#6A5749]">
            <span>Base Fare Component</span>
            <span className="font-bold text-[#250903]">₹{baseFare.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-[#6A5749]">
            <span>Taxes (18% GST)</span>
            <span className="font-bold text-[#250903]">₹{gstAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-[#250903] font-bold border-t border-[#E7DFD5] pt-2">
            <span>Gross Total Package</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-[#551A0C] font-bold bg-[#FEFBF8] p-2.5 rounded-lg border border-[#C89D5C]/30">
            <span>Advance Hold Paid (30%)</span>
            <span className="text-[#C89D5C] font-black">₹{totalAdvance.toLocaleString()}</span>
          </div>
 
          <div className="flex justify-between text-[#6A5749]">
            <span>Security Deposit (Refundable)</span>
            <span className="font-bold text-[#250903]">₹{totalDeposit.toLocaleString()}</span>
          </div>
 
          <div className="flex justify-between border-t border-dashed border-[#C89D5C]/40 pt-3 text-[#551A0C] font-bold font-serif text-sm">
            <span>Payable at Counter / Delivery</span>
            <span>₹{(totalRemaining + totalDeposit).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="flex-1">
            <button className="btn-luxury btn-luxury-shine w-full font-serif font-bold uppercase tracking-[0.16em] py-4 px-6 rounded-xl text-xs shadow-lg">
              Access Client Portal
            </button>
          </Link>
          <Link href="/" className="flex-1">
            <button className="w-full bg-[#FAF6F0] border border-[#E7DFD5] text-[#551A0C] hover:border-[#C89D5C] hover:bg-[#FEFBF8] font-bold uppercase tracking-[0.16em] py-4 px-6 rounded-xl transition-all text-xs font-mono">
              Return to Concierge
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
