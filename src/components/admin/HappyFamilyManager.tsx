'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';
import { createHappyCustomer, updateHappyCustomer, reorderHappyCustomer, deleteHappyCustomer } from '@/app/admin/actions';
import ImageUpload from '@/components/admin/ImageUpload';

interface Customer {
  id: string;
  imageUrl: string;
  name: string | null;
  location: string | null;
  isActive: boolean;
  order: number;
}

export default function HappyFamilyManager({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    const data = new FormData();
    data.append('imageUrl', imageUrl);
    data.append('name', name);
    data.append('location', location);

    const res = await createHappyCustomer(data);
    setAdding(false);

    if (res.success) {
      setImageUrl('');
      setName('');
      setLocation('');
      router.refresh();
    } else {
      setError(res.error || 'Failed to add photo.');
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    startTransition(async () => {
      await updateHappyCustomer(id, { isActive: !isActive });
      router.refresh();
    });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      await reorderHappyCustomer(id, direction);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this photo?')) return;
    startTransition(async () => {
      await deleteHappyCustomer(id);
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <Heart className="text-green-700" size={32} /> GoRidez Happy Family
          </h1>
          <p className="text-gray-500 text-[13px]">
            Upload real customer photos to display in the "Happy Family" gallery on the About page. Hide or reorder them anytime.
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="max-w-2xl bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-4 mb-10">
        {error && (
          <div className="p-3 rounded-xl text-xs font-mono border bg-red-500/5 border-red-500/20 text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
            Customer Photo <span className="text-red-500">*</span>
          </label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Udaipur, Rajasthan"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding || !imageUrl}
          className="bg-green-600 hover:bg-brand-hover text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Plus size={14} /> {adding ? 'Adding...' : 'Add Photo'}
        </button>
      </form>

      {customers.length === 0 ? (
        <div className="p-10 text-center text-gray-400 text-xs font-mono uppercase border border-dashed border-gray-300 rounded-3xl">
          No photos added yet
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {customers.map((customer, idx) => (
            <div key={customer.id} className="bg-gray-100 border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative w-full aspect-square bg-white">
                <img src={customer.imageUrl} alt={customer.name || 'Happy customer'} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate">{customer.name || 'Unnamed'}</p>
                  {customer.location && <p className="text-xs text-gray-500 truncate">{customer.location}</p>}
                </div>
                <span
                  className={`self-start inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${
                    customer.isActive
                      ? 'bg-green-600/10 text-green-700 border-green-600/20'
                      : 'bg-gray-250 text-gray-500 border-gray-300'
                  }`}
                >
                  {customer.isActive ? 'Active' : 'Hidden'}
                </span>
                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-200 mt-auto">
                  <button
                    disabled={isPending}
                    onClick={() => handleToggleActive(customer.id, customer.isActive)}
                    className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {customer.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    disabled={isPending || idx === 0}
                    onClick={() => handleMove(customer.id, 'up')}
                    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={isPending || idx === customers.length - 1}
                    onClick={() => handleMove(customer.id, 'down')}
                    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50 ml-auto cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
