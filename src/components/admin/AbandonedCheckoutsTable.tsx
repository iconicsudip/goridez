'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone, Mail, Trash2, ShoppingCart, UserX, MessageCircle, Calendar, ShieldAlert, Clock } from 'lucide-react';
import { deleteCheckoutLead } from '@/app/admin/actions';

interface Lead {
  id: string;
  visitorId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  dob: string | null;
  specialRequests: string | null;
  cartSnapshot: string | null;
  totalAmount: number | null;
  dropStage: string | null;
  pickupDate: string | null;
  returnDate: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function cartSummary(cartSnapshot: string | null, totalAmount: number | null): { count: number; total: number; titles: string[] } {
  if (!cartSnapshot) return { count: 0, total: totalAmount || 0, titles: [] };
  try {
    const items = JSON.parse(cartSnapshot);
    if (!Array.isArray(items)) return { count: 0, total: totalAmount || 0, titles: [] };
    return {
      count: items.length,
      total: totalAmount || items.reduce((acc: number, item: any) => acc + (item.price || 0), 0),
      titles: items.map((item: any) => item.title || item.name || 'Vehicle/Tour').filter(Boolean),
    };
  } catch {
    return { count: 0, total: totalAmount || 0, titles: [] };
  }
}

function renderDropStageBadge(stage: string | null, status: string) {
  if (status === 'CONVERTED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Converted
      </span>
    );
  }

  switch (stage) {
    case 'PAYMENT_DISMISSED':
    case 'PAYMENT_OPENED':
      return (
        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200" title="Opened payment gateway but closed/cancelled it">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Dropped at Payment
        </span>
      );
    case 'FILLING_FORM':
    case 'DROPPED_FORM':
      return (
        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200" title="Filled in form details and left">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Form Filled & Left
        </span>
      );
    case 'VIEWED_CHECKOUT':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200" title="Came to checkout with items in cart, left before submitting form">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Viewed Checkout & Left
        </span>
      );
  }
}

export default function AbandonedCheckoutsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ABANDONED' | 'CONVERTED' | 'ALL'>('ABANDONED');
  const [stageFilter, setStageFilter] = useState<'ALL' | 'PAYMENT' | 'FORM' | 'VIEWED'>('ALL');

  const filtered = initialLeads.filter((lead) => {
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    let matchesStage = true;
    if (stageFilter === 'PAYMENT') {
      matchesStage = lead.dropStage === 'PAYMENT_OPENED' || lead.dropStage === 'PAYMENT_DISMISSED';
    } else if (stageFilter === 'FORM') {
      matchesStage = lead.dropStage === 'FILLING_FORM' || lead.dropStage === 'DROPPED_FORM';
    } else if (stageFilter === 'VIEWED') {
      matchesStage = !lead.dropStage || lead.dropStage === 'VIEWED_CHECKOUT';
    }

    const haystack = `${lead.name || ''} ${lead.email || ''} ${lead.phone || ''} ${lead.specialRequests || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    return matchesStatus && matchesStage && matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (!confirm('Delete this checkout recovery lead permanently?')) return;
    startTransition(async () => {
      const res = await deleteCheckoutLead(id);
      if (!res.success) alert('Failed to delete: ' + res.error);
      else router.refresh();
    });
  };

  const openCount = initialLeads.filter((l) => l.status === 'ABANDONED').length;
  const paymentDroppedCount = initialLeads.filter(
    (l) => l.status === 'ABANDONED' && (l.dropStage === 'PAYMENT_OPENED' || l.dropStage === 'PAYMENT_DISMISSED')
  ).length;

  return (
    <div className="max-w-7xl mx-auto py-6 font-body space-y-6">
      {/* Header */}
      <div className="mb-2 border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <UserX size={16} /> Real-Time Lead Recovery
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">Checkout Drops & Leads</h1>
          <p className="text-gray-500 text-sm mt-1">
            Detects customers who reach the checkout page or fill in the form and drop before completing payment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-amber-700 font-mono uppercase font-bold">Open Leads</div>
            <div className="text-xl font-black text-amber-900">{openCount}</div>
          </div>
          <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-center">
            <div className="text-xs text-red-700 font-mono uppercase font-bold">Payment Drops</div>
            <div className="text-xl font-black text-red-900">{paymentDroppedCount}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-100 p-6 rounded-2xl border border-gray-200">
        <div className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-600"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {/* Status filter */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-300">
            {(['ABANDONED', 'CONVERTED', 'ALL'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  statusFilter === s ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {s === 'ABANDONED' ? 'Open' : s === 'CONVERTED' ? 'Converted' : 'All'}
              </button>
            ))}
          </div>

          {/* Stage filter */}
          <div className="flex bg-white p-1 rounded-xl border border-gray-300">
            {([
              { key: 'ALL', label: 'All Stages' },
              { key: 'PAYMENT', label: 'Payment Drop' },
              { key: 'FORM', label: 'Form Filled' },
              { key: 'VIEWED', label: 'Viewed Checkout' },
            ] as const).map((item) => (
              <button
                key={item.key}
                onClick={() => setStageFilter(item.key as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  stageFilter === item.key ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Cart & Reservation</th>
                <th className="px-6 py-4">Drop Stage</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4 text-right">Quick Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const cart = cartSummary(lead.cartSnapshot, lead.totalAmount);
                const rawPhone = lead.phone?.replace(/[^0-9]/g, '') || '';
                const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
                const whatsappMessage = encodeURIComponent(
                  `Hi ${lead.name || 'there'}, we noticed you were reserving ${
                    cart.titles[0] || 'a car'
                  } on GoRidez. Can we help you with any questions or assist with your booking?`
                );

                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Customer info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {lead.name || <span className="text-gray-400 italic">Guest / Unnamed Visitor</span>}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 font-mono mt-1">
                          <Phone size={11} className="text-gray-400" />
                          <a href={`tel:${lead.phone}`} className="hover:text-green-700 hover:underline">
                            {lead.phone}
                          </a>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Mail size={11} className="text-gray-400" />
                          <a href={`mailto:${lead.email}`} className="hover:text-green-700 hover:underline">
                            {lead.email}
                          </a>
                        </div>
                      )}
                      {lead.specialRequests && (
                        <div className="mt-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 max-w-xs truncate">
                          "{lead.specialRequests}"
                        </div>
                      )}
                    </td>

                    {/* Cart snapshot */}
                    <td className="px-6 py-4">
                      {cart.count > 0 || cart.total > 0 ? (
                        <div className="flex items-start gap-2">
                          <ShoppingCart size={14} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs text-gray-800 font-medium">
                              {cart.titles.length > 0 ? cart.titles.join(', ') : `${cart.count} item(s)`}
                            </div>
                            <div className="text-xs font-black text-gray-900 mt-0.5">
                              ₹{cart.total.toLocaleString()}
                            </div>
                            {(lead.pickupDate || lead.returnDate) && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 font-mono">
                                <Calendar size={10} />
                                {lead.pickupDate ? new Date(lead.pickupDate).toLocaleDateString('en-IN') : '—'}
                                {' → '}
                                {lead.returnDate ? new Date(lead.returnDate).toLocaleDateString('en-IN') : '—'}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No cart snapshot</span>
                      )}
                    </td>

                    {/* Drop stage badge */}
                    <td className="px-6 py-4">
                      {renderDropStageBadge(lead.dropStage, lead.status)}
                    </td>

                    {/* Last activity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                        <Clock size={12} className="text-gray-400" />
                        {timeAgo(lead.updatedAt)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {new Date(lead.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Quick Recovery Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lead.phone && (
                          <>
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-all border border-green-200"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-300"
                              title="Call Customer"
                            >
                              <Phone size={15} />
                            </a>
                          </>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}?subject=Your GoRidez Reservation&body=Hi ${lead.name || ''}, we noticed you were reserving on GoRidez.`}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all border border-gray-300"
                            title="Send Email"
                          >
                            <Mail size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={isPending}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    No matching checkout drops or leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
