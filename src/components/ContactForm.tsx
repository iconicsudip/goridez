'use client';

import { useState } from 'react';
import { User, Mail, Phone, MessageSquare, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitContactForm } from '@/app/contact/actions';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await submitContactForm(formData);

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      form.reset();
    }
  };

  if (success) {
    return (
      <div className="card-luxury bg-[#FEFBF8] border border-[#C89D5C]/40 rounded-3xl p-8 flex flex-col items-center text-center gap-3 border-classic-frame shadow-xl">
        <div className="w-16 h-16 rounded-full bg-[#551A0C]/10 border-2 border-[#C89D5C] flex items-center justify-center text-[#C89D5C] mb-2">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="font-serif font-bold uppercase tracking-widest text-base text-[#551A0C]">Message Dispatched</h3>
        <p className="text-xs text-[#6A5749] leading-relaxed max-w-sm">
          Thank you for reaching out to the GoRidez Concierge. Our senior travel curator will review your note and respond promptly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-[10px] font-bold font-mono uppercase tracking-[0.2em] text-[#C89D5C] hover:text-[#551A0C] mt-2 underline transition-colors"
        >
          Send another transmission
        </button>
      </div>
    );
  }

  return (
    <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 md:p-9 relative overflow-hidden shadow-2xl border-classic-frame">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C89D5C] to-transparent opacity-70"></div>

      <div className="mb-6">
        <h3 className="font-serif font-black text-xl uppercase tracking-tight text-[#551A0C]">Direct Inquiry</h3>
        <p className="text-xs text-[#8C6D53] font-mono mt-1">Direct channel to Rajasthan desk</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Full Legal Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C89D5C]">
              <User size={16} />
            </div>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all placeholder:text-[#6A5749]/40"
              placeholder="e.g. Maharaja Vikram Singh"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C89D5C]">
              <Mail size={16} />
            </div>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all placeholder:text-[#6A5749]/40"
              placeholder="client@domain.com"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Phone Contact (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C89D5C]">
              <Phone size={16} />
            </div>
            <input
              type="tel"
              name="phone"
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all placeholder:text-[#6A5749]/40"
              placeholder="+91 99999 99999"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Subject (Optional)</label>
          <input
            type="text"
            name="subject"
            className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 px-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all placeholder:text-[#6A5749]/40"
            placeholder="Chauffeur inquiry, multi-city booking, etc."
          />
        </div>

        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Message Details</label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none text-[#C89D5C]">
              <MessageSquare size={16} />
            </div>
            <textarea
              name="message"
              required
              rows={4}
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all resize-y placeholder:text-[#6A5749]/40"
              placeholder="Tell us about your requirements or dates..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-luxury btn-luxury-shine w-full font-serif font-bold uppercase tracking-[0.16em] py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-4 text-xs cursor-pointer"
        >
          {loading ? 'Transmitting...' : 'Dispatch Message'} <ChevronRight size={16} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}
