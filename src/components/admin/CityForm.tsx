'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { createCity } from '@/app/admin/actions';

export default function CityForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createCity(formData);
    setLoading(false);
    
    if (res?.success) {
      (e.target as HTMLFormElement).reset();
    } else if (res?.error) {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-8 md:p-10">
      <h2 className="text-sm font-black uppercase tracking-widest mb-8">PROVISION NEW CITY HUB</h2>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">CITY NAME</label>
            <input name="name" required type="text" placeholder="e.g. Jodhpur" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xs text-gray-900 outline-none font-mono focus:border-green-600 focus:bg-white transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">TARGET URL SLUG (FOR LANDING PAGES)</label>
            <input name="slug" required type="text" placeholder="/self-drive-cars-in-jodhpur" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xs text-gray-900 outline-none font-mono focus:border-green-600 focus:bg-white transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">CITY FAQ SCHEMA QUESTION</label>
          <input name="faqQuestion" required type="text" placeholder="e.g. What is the standard security deposit in Jodhpur?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xs text-gray-900 outline-none font-mono focus:border-green-600 focus:bg-white transition-all" />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">CITY FAQ SCHEMA ANSWER</label>
          <textarea name="faqAnswer" required placeholder="e.g. We only reserve ₹4,000 for standard offroaders, released fully upon clean return." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-xs text-gray-900 outline-none font-mono focus:border-green-600 focus:bg-white transition-all resize-none"></textarea>
        </div>

        <div className="pt-4">
          <button disabled={loading} type="submit" className="bg-green-600 hover:bg-brand-hover text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md disabled:opacity-50">
            {loading ? 'PROVISIONING...' : 'PUBLISH LOCATION LANDING MODULE'} <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
