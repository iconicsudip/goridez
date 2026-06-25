'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    errorParam === 'AccessDenied' ? 'Access denied. You do not have admin privileges.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-start gap-3 animate-fade-in">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">
          Admin Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail size={15} className="text-gray-400" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors placeholder:text-gray-400"
            placeholder="admin@goridez.com"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2 block">
          Admin Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock size={15} className="text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-12 text-sm text-gray-900 outline-none focus:border-green-600/50 transition-colors placeholder:text-gray-400"
            placeholder="••••••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        id="admin-login-submit"
        className="w-full bg-green-600 hover:bg-brand-hover text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(196,240,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
            Verifying Access...
          </>
        ) : (
          <>
            Enter Admin Panel <ArrowRight size={16} strokeWidth={3} />
          </>
        )}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="bg-green-600 text-white font-black text-xs w-10 h-10 rounded-xl flex items-center justify-center tracking-tighter shadow-[0_0_20px_rgba(196,240,0,0.3)]">
              GR
            </div>
            <div className="text-2xl font-black tracking-tight">
              <span className="text-gray-900">Go</span><span className="text-green-700">Ridez</span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-green-700" />
            <span className="text-[10px] text-green-700 font-bold tracking-widest uppercase">Admin Control Panel</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight mb-2 text-gray-900">Secure Admin Login</h1>
          <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
            Restricted Access • Admin Credentials Only
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-neon/60 to-transparent" />

          {/* Corner badge */}
          <div className="absolute top-4 right-4 bg-green-600/10 border border-green-600/20 px-2 py-1 rounded-lg">
            <span className="text-green-700 text-[8px] font-bold tracking-widest uppercase">ADMIN ONLY</span>
          </div>

          <Suspense fallback={
            <div className="text-center text-gray-400 py-10 font-mono text-[10px]">
              Loading secure gateway...
            </div>
          }>
            <AdminLoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <Link
            href="/"
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors font-mono tracking-widest uppercase block"
          >
            ← Return to public site
          </Link>
          <p className="text-[9px] text-gray-400 font-mono">
            Unauthorized access attempts are logged
          </p>
        </div>

      </div>
    </div>
  );
}
