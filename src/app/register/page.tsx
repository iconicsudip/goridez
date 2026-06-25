'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, Phone, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { registerUser } from './actions';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const res = await registerUser(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Auto login after registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!signInRes?.error) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="bg-green-600 text-white font-black text-xs w-8 h-8 rounded-lg flex items-center justify-center tracking-tighter">
              GR
            </div>
            <div className="text-xl font-black tracking-tight">
              <span className="text-gray-900">Go</span><span className="text-green-700">Ridez</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2">Register Digital Identity</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">GDPR Security Framework Verified</p>
        </div>

        {/* Form Card */}
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
              <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Full Legal Name</label>
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
              <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Phone Contact</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={16} className="text-gray-400" />
                </div>
                <input 
                  type="tel"
                  name="phone"
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors"
                  placeholder="+91 99999 99999"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">Master Passkey</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input 
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
               <CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" />
               <p className="text-[9px] text-gray-500 leading-relaxed font-mono">By registering, you agree to Rajputana Mobility's Terms of Service and authorize encrypted storage of identity logs.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-brand-hover text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)] disabled:opacity-50 mt-4"
            >
              {loading ? 'Encrypting Identity...' : 'Create Secure Profile'} <ChevronRight size={16} strokeWidth={3} />
            </button>
          </form>

        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-4">
          <Link href="/login" className="text-[11px] text-gray-600 hover:text-gray-900 transition-colors font-medium">
            Already registered? <span className="text-green-700 font-bold">Access Terminal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
