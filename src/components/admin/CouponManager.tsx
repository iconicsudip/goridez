'use client';

import { useState } from 'react';
import { Percent, X } from 'lucide-react';
import { createCoupon, toggleCoupon, deleteCoupon } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';

export default function CouponManager({ coupons }: { coupons: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountValue: '',
    discountType: 'PERCENTAGE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('code', formData.code);
    data.append('discountValue', formData.discountValue);
    data.append('discountType', formData.discountType);

    await createCoupon(data);

    setFormData({ code: '', discountValue: '', discountType: 'PERCENTAGE' });
    setLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleCoupon(id, !currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      await deleteCoupon(id);
    }
  };

  return (
    <div className="container">
      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          Marketing, Coupon & Abandoned Recovery
        </h1>
        <p className="text-white/50 text-[13px]">
          Add coupon codes, allocate flat cashbacks, and simulate lost booking triggers.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Side: Create Coupon */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 h-fit">
          <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-8">
            Generate Promotion Voucher
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                Promo Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="E.G. MEWARSTAY"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none uppercase font-mono transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                  Discount Value
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.discountValue}
                  onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder="15"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none font-mono transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                  Discount Formula
                </label>
                <select
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none font-mono transition-colors appearance-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat (₹)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-neon hover:bg-[#aacc00] text-black py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] disabled:opacity-50 mt-4"
            >
              {loading ? 'Publishing...' : 'Publish Coupon Rule →'}
            </button>
          </form>
        </div>

        {/* Right Side: List Coupons */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
          <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-8">
            Verified Active Coupons
          </div>

          <div className="space-y-4">
            {coupons.length === 0 ? (
              <div className="text-[11px] text-white/30 italic text-center py-10 font-mono">
                No active coupons found.
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="bg-[#050505] border border-white/5 rounded-xl p-4 flex items-center justify-between group relative overflow-hidden">
                  <div>
                    <div className="text-brand-neon font-black font-mono text-sm tracking-widest uppercase">
                      {coupon.code}
                    </div>
                    <div className="text-[10px] text-white/50 font-mono mt-1">
                      {coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.discountValue}% discount`
                        : `₹${coupon.discountValue} flat off`}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded border transition-colors ${coupon.isActive
                          ? 'border-[#00FF66]/30 text-[#00FF66] hover:bg-[#00FF66]/10'
                          : 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                        }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
