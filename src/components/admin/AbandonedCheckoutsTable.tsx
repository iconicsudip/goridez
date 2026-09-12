'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Phone, Mail, Trash2, ShoppingCart, UserX } from 'lucide-react';
import { deleteCheckoutLead } from '@/app/admin/actions';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  specialRequests: string | null;
  cartSnapshot: string | null;
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

function cartSummary(cartSnapshot: string | null): { count: number; total: number; titles: string[] } {
  if (!cartSnapshot) return { count: 0, total: 0, titles: [] };
  try {
    const items = JSON.parse(cartSnapshot);
    if (!Array.isArray(items)) return { count: 0, total: 0, titles: [] };
    return {
      count: items.length,
      total: items.reduce((acc: number, item: any) => acc + (item.price || 0), 0),
      titles: items.map((item: any) => item.title).filter(Boolean),
    };
  } catch {
    return { count: 0, total: 0, titles: [] };
  }
}

export default function AbandonedCheckoutsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ABANDONED' | 'CONVERTED' | 'ALL'>('ABANDONED');

  const filtered = initialLeads.filter((lead) => {
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const haystack = `${lead.name || ''} ${lead.email || ''} ${lead.phone || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (!confirm('Delete this lead permanently?')) return;
    startTransition(async () => {
      const res = await deleteCheckoutLead(id);
      if (!res.success) alert('Failed to delete: ' + res.error);
      else router.refresh();
    });
  };

  const openCount = initialLeads.filter((l) => l.status === 'ABANDONED').length;

  return (
    <div className="max-w-7xl mx-auto py-6 font-body space-y-6">
      {/* Header */}
      <div className="mb-2 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
          <UserX size={16} /> Recovery
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">Abandoned Checkouts</h1>
        <p className="text-gray-500 text-sm mt-1">
          Captured automatically as customers fill in the checkout form, even if they never complete payment — {openCount} open right now.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-100 p-6 rounded-2xl border border-gray-200">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-green-600"
          />
        </div>
        <div className="flex gap-2">
          {(['ABANDONED', 'CONVERTED', 'ALL'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                statusFilter === s ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s === 'ABANDONED' ? 'Open' : s === 'CONVERTED' ? 'Converted' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Cart at Time of Capture</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Activity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((lead) => {
                const cart = cartSummary(lead.cartSnapshot);
                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{lead.name || 'Unnamed'}</div>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 mt-1">
                          <Mail size={11} /> {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 mt-0.5">
                          <Phone size={11} /> {lead.phone}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cart.count > 0 ? (
                        <div className="flex items-start gap-2">
                          <ShoppingCart size={13} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs text-gray-700">{cart.titles.join(', ')}</div>
                            <div className="text-xs font-bold text-gray-900 mt-0.5">₹{cart.total.toLocaleString()}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        lead.status === 'CONVERTED'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {lead.status === 'CONVERTED' ? 'Converted' : 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{timeAgo(lead.updatedAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id)}
                        disabled={isPending}
                        className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">
                    No {statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} leads found.
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
