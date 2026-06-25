'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Calendar, DollarSign, Search, ShieldCheck } from 'lucide-react';

interface BookingsTableProps {
  initialBookings: any[];
}

export default function BookingsTable({ initialBookings }: BookingsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async (id: string) => {
    if (confirm('Approve this booking?')) {
      startTransition(async () => {
        try {
          const res = await fetch('/api/admin/bookings/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: id })
          });
          if (!res.ok) throw new Error((await res.json()).error || 'Failed to approve');
          router.refresh();
        } catch (err: any) {
          alert('Failed to approve: ' + err.message);
        }
      });
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingId || !rejectionReason) return;
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/bookings/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: rejectingId, reason: rejectionReason })
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to reject');
        const data = await res.json();
        alert(`Booking rejected. Refund status: ${data.refundStatus}`);
        setRejectingId(null);
        setRejectionReason('');
        router.refresh();
      } catch (err: any) {
        alert('Failed to reject: ' + err.message);
      }
    });
  };

  const filteredBookings = initialBookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.user.name.toLowerCase().includes(search.toLowerCase()) ||
      b.user.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 relative">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-100 p-6 rounded-2xl border border-gray-200">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client or ledger ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-green-600 text-gray-900 font-mono"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                statusFilter === status
                  ? 'bg-green-600 border-green-600 text-black shadow-[0_0_15px_rgba(196,240,0,0.15)]'
                  : 'bg-transparent border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Ledger */}
      <div className="bg-gray-100 border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-green-700 font-black tracking-widest uppercase mb-1 block">VIP Escrow Ledger</span>
            <h2 className="text-lg font-black uppercase text-gray-900">Live Booking Ledger</h2>
          </div>
          <span className="text-[10px] font-mono text-gray-400 uppercase">{filteredBookings.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] uppercase tracking-wider">
            <thead>
              <tr className="border-b border-gray-200 bg-[#0C0C0C] text-gray-500 font-bold">
                <th className="p-5">Ledger ID</th>
                <th className="p-5">Client Info</th>
                <th className="p-5">Service Type</th>
                <th className="p-5">Details</th>
                <th className="p-5">Dates Range</th>
                <th className="p-5">Financials</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400">
                    No matching reservation records found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  let details = 'Luxury Reservation';
                  if (b.type === 'CAR' && b.car) {
                    details = `${b.car.make} ${b.car.model}`;
                  } else if (b.type === 'TOUR' && b.tour) {
                    details = b.tour.title;
                  } else if (b.type === 'VILLA' && b.villa) {
                    details = b.villa.name;
                  }

                  return (
                    <tr key={b.id} className="hover:bg-gray-100 transition-colors">
                      <td className="p-5 text-gray-900/80 font-bold max-w-[100px] truncate">{b.id}</td>
                      <td className="p-5">
                        <div className="text-gray-900 font-bold">{b.driverName || b.user.name}</div>
                        <div className="text-gray-500 text-[9px] lowercase font-sans">{b.driverEmail || b.user.email}</div>
                        {(b.driverPhone || b.user.phone) && <div className="text-gray-500 text-[9px] font-sans">{b.driverPhone || b.user.phone}</div>}
                        {b.specialRequests && <div className="text-orange-300 text-[9px] font-sans mt-1 truncate max-w-[150px]" title={b.specialRequests}>Req: {b.specialRequests}</div>}
                      </td>
                      <td className="p-5">
                        <span className="bg-gray-100 border border-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded">
                          {b.type}
                        </span>
                      </td>
                      <td className="p-5 text-gray-900 font-semibold">{details}</td>
                      <td className="p-5 text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-green-700" />
                          <span>{new Date(b.startDate).toLocaleDateString('en-GB')} - {new Date(b.endDate).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="text-gray-900 font-bold">Total: ₹{b.totalAmount.toLocaleString()}</div>
                        <div className="text-green-700 font-semibold text-[10px]">Hold: ₹{b.advancePaid.toLocaleString()}</div>
                        <div className="text-gray-500 text-[9px]">Due: ₹{b.remainingAmount.toLocaleString()}</div>
                        {b.depositAmount > 0 && <div className="text-orange-400 text-[9px]">Escrow: ₹{b.depositAmount.toLocaleString()}</div>}
                      </td>
                      <td className="p-5">
                        <span
                          className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                            b.status === 'CONFIRMED'
                              ? 'bg-green-600/10 border-green-300 text-green-700 shadow-sm'
                              : b.status === 'PENDING'
                              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                              : 'bg-red-500/10 border-red-500/30 text-red-500'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.status === 'REJECTED' && b.refundStatus !== 'NONE' && (
                          <div className="mt-2 text-[8px] font-mono font-bold">
                            Refund: <span className={b.refundStatus === 'PROCESSED' ? 'text-green-700' : 'text-orange-400'}>{b.refundStatus}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          {b.status !== 'CONFIRMED' && b.status !== 'CANCELLED' && b.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleApprove(b.id)}
                              disabled={isPending}
                              className="w-7 h-7 bg-green-600/10 border border-green-300 hover:bg-green-600 hover:text-black rounded-lg flex items-center justify-center text-green-700 transition-all"
                              title="Approve Booking"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'REJECTED' && (
                            <button
                              onClick={() => setRejectingId(b.id)}
                              disabled={isPending}
                              className="w-7 h-7 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-gray-900 rounded-lg flex items-center justify-center text-red-500 transition-all"
                              title="Reject Booking"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <div className="bg-gray-100 border border-gray-300 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">Reject Booking</h3>
            <p className="text-[10px] text-gray-500 font-mono mb-4">Please provide a reason for rejecting this booking. This will be visible to the client and trigger an automatic refund of the advance paid.</p>
            <textarea
              className="w-full bg-white border border-gray-300 rounded-xl p-4 text-sm text-gray-900 font-body outline-none focus:border-green-600 mb-4 min-h-[100px]"
              placeholder="e.g., Fleet unavailable on requested dates"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectSubmit}
                disabled={!rejectionReason || isPending}
                className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-red-500 text-gray-900 hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
