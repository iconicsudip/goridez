'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Calendar, Search, Eye, Download, FileText, MapPin, Phone, Mail, User } from 'lucide-react';

interface BookingsTableProps {
  initialBookings: any[];
  initialStatus?: string;
}

const SERVICE_LABELS: Record<string, string> = {
  SELF_DRIVE: 'Self-Drive',
  CHAUFFEUR: 'Chauffeur',
  ONE_WAY: 'One-Way Taxi',
  ROUND_TRIP: 'Round-Trip Taxi',
  AIRPORT_TRANSFER: 'Airport Transfer',
};

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-50 border-green-200 text-green-700',
  COMPLETED: 'bg-blue-50 border-blue-200 text-blue-700',
  PENDING: 'bg-amber-50 border-amber-200 text-amber-700',
  CANCELLED: 'bg-gray-100 border-gray-300 text-gray-600',
  REJECTED: 'bg-red-50 border-red-200 text-red-700',
};

const inr = (n: number | null | undefined) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const shortId = (id: string) => id.slice(-8).toUpperCase();
const tripDays = (s: string | Date, e: string | Date) =>
  Math.max(1, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000) || 1);

function serviceLabel(b: any) {
  if (b.type === 'TOUR') return 'Tour Package';
  if (b.type === 'VILLA') return 'Villa Stay';
  return SERVICE_LABELS[b.serviceSubtype] || 'Car Rental';
}

function itemName(b: any) {
  if (b.car) return `${b.car.make} ${b.car.model}`;
  if (b.tour) return b.tour.title;
  if (b.villa) return b.villa.name;
  return '—';
}

function bookingRows(b: any): [string, string][] {
  return [
    ['Booking ID', b.id],
    ['Reference', shortId(b.id)],
    ['Status', b.status],
    ['Booked On', fmtDateTime(b.createdAt)],
    ['Service', serviceLabel(b)],
    ['Vehicle / Package', itemName(b)],
    ['Start Date', fmtDate(b.startDate)],
    ['End Date', fmtDate(b.endDate)],
    ['Duration (days)', String(tripDays(b.startDate, b.endDate))],
    ['Pickup', b.pickupStation || '—'],
    ['Drop', b.dropStation || '—'],
    ['Customer Name', b.driverName || b.user.name],
    ['Customer Phone', b.driverPhone || b.user.phone || '—'],
    ['Customer Email', b.driverEmail || b.user.email],
    ['Date of Birth', b.driverDob || '—'],
    ['Special Requests', b.specialRequests || '—'],
    ['Total Amount', inr(b.totalAmount)],
    ['Advance Paid', inr(b.advancePaid)],
    ['Balance Due', inr(b.remainingAmount)],
    ['Security Deposit', inr(b.depositAmount)],
    ['Delivery Fee', inr(b.deliveryFee)],
    ['Deposit Status', b.depositStatus || '—'],
    ['Refund Status', b.refundStatus || '—'],
    ['Rejection Reason', b.rejectionReason || '—'],
    ['Payment ID', b.razorpayPaymentId || '—'],
  ];
}

const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`;

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(bookings: any[], filename: string) {
  if (bookings.length === 0) return;
  const headers = bookingRows(bookings[0]).map(([k]) => k);
  const lines = [headers.map(csvCell).join(',')];
  bookings.forEach((b) => lines.push(bookingRows(b).map(([, v]) => csvCell(v)).join(',')));
  // BOM so Excel reads ₹ and other unicode correctly
  downloadFile(filename, '\ufeff' + lines.join('\n'), 'text/csv;charset=utf-8;');
}

function printBooking(b: any) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rows = bookingRows(b)
    .map(([k, v]) => `<tr><td class="k">${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join('');
  const w = window.open('', '_blank', 'width=800,height=900');
  if (!w) {
    alert('Please allow pop-ups to download the booking PDF.');
    return;
  }
  w.document.write(`<!doctype html><html><head><title>Booking ${shortId(b.id)}</title>
<style>
  body{font-family:Arial,sans-serif;padding:32px;color:#111}
  h1{margin:0 0 4px;font-size:22px} .sub{color:#666;font-size:12px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td{padding:8px 10px;border-bottom:1px solid #e5e5e5;vertical-align:top}
  td.k{width:35%;color:#555;font-weight:bold;background:#fafafa}
</style></head><body>
<h1>GoRidez — Booking ${shortId(b.id)}</h1>
<div class="sub">Generated ${fmtDateTime(new Date())}</div>
<table>${rows}</table>
<script>window.onload=function(){window.print()}</script>
</body></html>`);
  w.document.close();
}

export default function BookingsTable({ initialBookings, initialStatus = 'ALL' }: BookingsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [viewing, setViewing] = useState<any | null>(null);

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

  const filteredBookings = useMemo(() => {
    const q = search.toLowerCase();
    return initialBookings.filter((b) => {
      const haystack = [
        b.id, b.user.name, b.user.email, b.user.phone, b.driverName, b.driverEmail, b.driverPhone, itemName(b),
      ].join(' ').toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchesService = serviceFilter === 'ALL' || b.type === serviceFilter;
      return matchesSearch && matchesStatus && matchesService;
    });
  }, [initialBookings, search, statusFilter, serviceFilter]);

  const stats = useMemo(() => {
    const live = filteredBookings.filter((b) => b.status !== 'CANCELLED' && b.status !== 'REJECTED');
    return {
      count: filteredBookings.length,
      revenue: live.reduce((a, b) => a + b.totalAmount, 0),
      collected: live.reduce((a, b) => a + b.advancePaid, 0),
      due: live.reduce((a, b) => a + b.remainingAmount, 0),
    };
  }, [filteredBookings]);

  const canAct = (b: any) => !['CONFIRMED', 'CANCELLED', 'REJECTED'].includes(b.status);
  const canReject = (b: any) => !['CANCELLED', 'REJECTED'].includes(b.status);

  return (
    <div className="space-y-6 relative">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bookings', value: String(stats.count) },
          { label: 'Total Value', value: inr(stats.revenue) },
          { label: 'Advance Collected', value: inr(stats.collected) },
          { label: 'Balance Due', value: inr(stats.due) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{s.label}</div>
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-gray-100 p-5 rounded-2xl border border-gray-200">
        <div className="relative w-full xl:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone, vehicle or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-green-600 text-gray-900"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
          <div className="flex bg-white p-1 rounded-xl border border-gray-300">
            {['ALL', 'CONFIRMED', 'CANCELLED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  statusFilter === status ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-gray-300">
            {[
              { k: 'ALL', l: 'All Types' },
              { k: 'CAR', l: 'Cars' },
              { k: 'TOUR', l: 'Tours' },
              { k: 'VILLA', l: 'Villas' },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setServiceFilter(t.k)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  serviceFilter === t.k ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          <button
            onClick={() => exportCsv(filteredBookings, `bookings-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={filteredBookings.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Download size={14} /> Download CSV
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase text-gray-900">Booking Records</h2>
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{filteredBookings.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <th className="px-5 py-4">Booking</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Service &amp; Vehicle</th>
                <th className="px-5 py-4">Trip</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 text-sm">
                    No matching bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const paidPct = b.totalAmount > 0 ? Math.min(100, Math.round((b.advancePaid / b.totalAmount) * 100)) : 0;
                  const days = tripDays(b.startDate, b.endDate);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-colors align-top">
                      <td className="px-5 py-4">
                        <div className="font-mono font-black text-green-700 text-xs">{shortId(b.id)}</div>
                        <div className="text-[10px] text-gray-400 mt-1">Booked {fmtDate(b.createdAt)}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 text-xs">{b.driverName || b.user.name}</div>
                        {(b.driverPhone || b.user.phone) && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1">
                            <Phone size={10} className="text-gray-400" /> {b.driverPhone || b.user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                          <Mail size={10} className="text-gray-400" /> {b.driverEmail || b.user.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          {serviceLabel(b)}
                        </span>
                        <div className="font-bold text-gray-900 text-xs mt-1.5">{itemName(b)}</div>
                        {(b.pickupStation || b.dropStation) && (
                          <div className="flex items-start gap-1.5 text-[11px] text-gray-500 mt-1">
                            <MapPin size={10} className="text-gray-400 mt-0.5 shrink-0" />
                            <span>
                              {b.pickupStation || '—'}
                              {b.dropStation && b.dropStation !== b.pickupStation ? ` → ${b.dropStation}` : ''}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-800 font-semibold">
                          <Calendar size={12} className="text-green-700" />
                          {fmtDate(b.startDate)}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 pl-[18px]">to {fmtDate(b.endDate)}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 pl-[18px]">{days} day{days > 1 ? 's' : ''}</div>
                      </td>

                      <td className="px-5 py-4 min-w-[170px]">
                        <div className="text-gray-900 font-black text-sm">{inr(b.totalAmount)}</div>
                        <div className="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-green-600" style={{ width: `${paidPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                          <span className="text-green-700 font-bold">Paid {inr(b.advancePaid)}</span>
                          <span className="text-gray-500">Due {inr(b.remainingAmount)}</span>
                        </div>
                        {b.depositAmount > 0 && <div className="text-[10px] text-amber-600 mt-0.5">Deposit {inr(b.depositAmount)}</div>}
                        {b.deliveryFee > 0 && <div className="text-[10px] text-gray-500">Delivery {inr(b.deliveryFee)}</div>}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${STATUS_STYLES[b.status] || STATUS_STYLES.CANCELLED}`}>
                          {b.status}
                        </span>
                        {b.status === 'REJECTED' && b.refundStatus !== 'NONE' && (
                          <div className="mt-1.5 text-[10px] font-bold">
                            Refund:{' '}
                            <span className={b.refundStatus === 'PROCESSED' ? 'text-green-700' : 'text-amber-600'}>{b.refundStatus}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewing(b)}
                            className="w-8 h-8 bg-gray-100 border border-gray-300 hover:bg-gray-900 hover:text-white rounded-lg flex items-center justify-center text-gray-700 transition-all cursor-pointer"
                            title="View full details"
                          >
                            <Eye size={14} />
                          </button>
                          {canAct(b) && (
                            <button
                              onClick={() => handleApprove(b.id)}
                              disabled={isPending}
                              className="w-8 h-8 bg-green-50 border border-green-300 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center text-green-700 transition-all cursor-pointer"
                              title="Approve Booking"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {canReject(b) && (
                            <button
                              onClick={() => setRejectingId(b.id)}
                              disabled={isPending}
                              className="w-8 h-8 bg-red-50 border border-red-200 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center text-red-500 transition-all cursor-pointer"
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

      {/* Details Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewing(null)}>
          <div
            className="bg-white border border-gray-200 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4 sticky top-0 bg-white rounded-t-3xl">
              <div>
                <div className="text-[10px] text-green-700 font-black uppercase tracking-widest mb-1">Booking {shortId(viewing.id)}</div>
                <h3 className="text-xl font-black text-gray-900">{itemName(viewing)}</h3>
                <div className="text-xs text-gray-500 mt-1">{serviceLabel(viewing)} • Booked {fmtDateTime(viewing.createdAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${STATUS_STYLES[viewing.status] || STATUS_STYLES.CANCELLED}`}>
                  {viewing.status}
                </span>
                <button onClick={() => setViewing(null)} className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Customer',
                  icon: <User size={13} />,
                  rows: bookingRows(viewing).filter(([k]) => ['Customer Name', 'Customer Phone', 'Customer Email', 'Date of Birth', 'Special Requests'].includes(k)),
                },
                {
                  title: 'Trip',
                  icon: <Calendar size={13} />,
                  rows: bookingRows(viewing).filter(([k]) => ['Start Date', 'End Date', 'Duration (days)', 'Pickup', 'Drop'].includes(k)),
                },
                {
                  title: 'Payment',
                  icon: <FileText size={13} />,
                  rows: bookingRows(viewing).filter(([k]) => ['Total Amount', 'Advance Paid', 'Balance Due', 'Security Deposit', 'Delivery Fee', 'Deposit Status', 'Payment ID'].includes(k)),
                },
                {
                  title: 'Status & Refund',
                  icon: <Check size={13} />,
                  rows: bookingRows(viewing).filter(([k]) => ['Status', 'Refund Status', 'Rejection Reason', 'Booking ID'].includes(k)),
                },
              ].map((section) => (
                <div key={section.title} className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                    {section.icon} {section.title}
                  </div>
                  <dl className="space-y-2">
                    {section.rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 text-xs">
                        <dt className="text-gray-500 shrink-0">{k}</dt>
                        <dd className="text-gray-900 font-semibold text-right break-all">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}

              {(viewing.aadharFile || viewing.dlFile) && (
                <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Uploaded Documents</div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {[
                      { label: 'Aadhar / Passport', value: viewing.aadharFile },
                      { label: 'Driving License', value: viewing.dlFile },
                    ].filter((d) => d.value).map((d) =>
                      String(d.value).startsWith('/') ? (
                        <a key={d.label} href={d.value} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-green-700 font-bold hover:bg-green-50">
                          View {d.label}
                        </a>
                      ) : (
                        <span key={d.label} className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700" title="This booking was made before document upload was enabled; only the file name was saved.">
                          {d.label}: {d.value} (file not stored)
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => exportCsv([viewing], `booking-${shortId(viewing.id)}.csv`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 cursor-pointer"
              >
                <Download size={14} /> CSV
              </button>
              <button
                onClick={() => printBooking(viewing)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-700 cursor-pointer"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-gray-300 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">Reject Booking</h3>
            <p className="text-xs text-gray-500 mb-4">Please provide a reason for rejecting this booking. This will be visible to the client and trigger an automatic refund of the advance paid.</p>
            <textarea
              className="w-full bg-white border border-gray-300 rounded-xl p-4 text-sm text-gray-900 outline-none focus:border-green-600 mb-4 min-h-[100px]"
              placeholder="e.g., Fleet unavailable on requested dates"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason || isPending}
                className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
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
