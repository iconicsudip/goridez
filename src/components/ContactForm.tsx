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
      <div className="bg-green-600/5 border border-green-600/20 rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <CheckCircle2 size={32} className="text-green-700" />
        <h3 className="font-black uppercase tracking-widest text-sm text-gray-900">Message Sent</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-[10px] font-black uppercase tracking-widest text-green-700 hover:text-green-800 mt-2"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-neon to-transparent opacity-50"></div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={16} className="text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              required
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors"
              placeholder="name@domain.com"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Phone (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone size={16} className="text-gray-400" />
            </div>
            <input
              type="tel"
              name="phone"
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors"
              placeholder="+91 99999 99999"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Subject (Optional)</label>
          <input
            type="text"
            name="subject"
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors"
            placeholder="Booking enquiry, feedback, etc."
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Message</label>
          <div className="relative">
            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
              <MessageSquare size={16} className="text-gray-400" />
            </div>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors resize-y"
              placeholder="How can we help?"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-brand-hover text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)] disabled:opacity-50 mt-4"
        >
          {loading ? 'Sending...' : 'Send Message'} <ChevronRight size={16} strokeWidth={3} />
        </button>
      </form>
    </div>
  );
}
