import { prisma } from '@/lib/prisma';
import BookingsTable from '@/components/admin/BookingsTable';

export const metadata = {
  title: 'Reservation Ledger | GoRidez Admin ERP',
};

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      car: true,
      tour: true,
      villa: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
          RESERVATION <span className="text-outline-neon">LEDGER</span>
        </h1>
        <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
          Sovereign Travel-Tech Fleet & Stay reservations catalog
        </p>
      </div>

      <BookingsTable initialBookings={bookings} />
    </div>
  );
}
