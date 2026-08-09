'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User, Phone, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { registerUser } from './actions';
import { signIn } from 'next-auth/react';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.3 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-8l-6.6 5.1C9.6 39.5 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.7 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

export default function RegisterClient({ googleSignInEnabled }: { googleSignInEnabled: boolean }) {
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

          {googleSignInEnabled && (
            <>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all mb-6"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or register with email</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
            </>
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
              className="w-full bg-green-600 hover:bg-brand-hover text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(41,75,50,0.15)] disabled:opacity-50 mt-4"
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
