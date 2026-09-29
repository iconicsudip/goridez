'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';

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

function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl })}
      className="w-full bg-[#FAF6F0] hover:bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] text-[#551A0C] font-serif font-bold text-xs uppercase tracking-[0.16em] py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer"
    >
      <GoogleIcon /> Authenticate with Google
    </button>
  );
}

function LoginForm({ googleSignInEnabled }: { googleSignInEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      setError(res.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {googleSignInEnabled && (
        <>
          <GoogleSignInButton callbackUrl={callbackUrl} />
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-[#E7DFD5]" />
            <span className="text-[10px] text-[#8C6D53] font-bold font-mono uppercase tracking-[0.2em]">Or Sign In With Key</span>
            <div className="h-px flex-1 bg-[#E7DFD5]" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Registered Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C89D5C]">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all placeholder:text-[#6A5749]/40"
              placeholder="client@domain.com"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold font-mono text-[#8C6D53] tracking-widest uppercase mb-1.5 block">Security Passkey</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#C89D5C]">
              <Lock size={16} />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl py-3 pl-11 pr-4 text-xs font-mono text-[#250903] outline-none focus:border-[#C89D5C] focus:bg-[#FEFBF8] transition-all placeholder:text-[#6A5749]/40"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-luxury btn-luxury-shine w-full font-serif font-bold uppercase tracking-[0.16em] py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 mt-4 text-xs cursor-pointer"
        >
          {loading ? 'Verifying Credentials...' : 'Access Private Portal'} <ChevronRight size={16} strokeWidth={2} />
        </button>
      </form>
    </>
  );
}

export default function LoginClient({ googleSignInEnabled }: { googleSignInEnabled: boolean }) {
  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 py-20 font-sans">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#551A0C] border-2 border-[#C89D5C] text-[#DFB574] font-serif font-black text-xs flex items-center justify-center shadow-md">
              GR
            </div>
            <div className="text-2xl font-black font-serif tracking-tight text-[#551A0C]">
              Go<span className="text-[#C89D5C]">Ridez</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-2">Private Member Gateway</h1>
          <p className="text-[10px] text-[#8C6D53] font-mono tracking-[0.25em] uppercase">256-Bit Encrypted &bull; Sovereign Authentication</p>
        </div>

        {/* Form Card */}
        <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 relative overflow-hidden shadow-2xl border-classic-frame">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C89D5C] to-transparent opacity-70"></div>

          <Suspense fallback={<div className="text-center text-[#8C6D53] py-10 font-mono text-[10px]">Loading secure gateway...</div>}>
            <LoginForm googleSignInEnabled={googleSignInEnabled} />
          </Suspense>

        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-4">
          <Link href="/register" className="text-xs text-[#6A5749] hover:text-[#551A0C] transition-colors font-medium">
            New client? <span className="text-[#551A0C] font-bold font-serif uppercase tracking-wider underline">Register Private Identity</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
