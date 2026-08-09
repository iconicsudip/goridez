'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3, Search, Tags, Banknote, Megaphone, Gauge, LogIn, KeyRound,
  CheckCircle2, CircleDashed, Save, Plug, RefreshCw, Unplug, X, AlertCircle, ExternalLink,
} from 'lucide-react';
import { updateGoogleIntegration, updateGoogleSignInToggle, updateGoogleCredentials } from '@/app/admin/actions';

interface IntegrationsData {
  googleAnalyticsId: string;
  googleSearchConsoleVerification: string;
  googleTagManagerId: string;
  googleAdsensePublisherId: string;
  googleAdsCustomerId: string;
  googleSignInEnabled: boolean;
}

interface ConnectionInfo {
  connected: boolean;
  email: string;
  scopes: string[];
}

interface CredentialsInfo {
  clientId: string;
  clientSecret: string;
  pagespeedApiKey: string;
  adsDeveloperToken: string;
}

const SCOPE = {
  analytics: 'https://www.googleapis.com/auth/analytics.readonly',
  searchconsole: 'https://www.googleapis.com/auth/webmasters.readonly',
  tagmanager: 'https://www.googleapis.com/auth/tagmanager.readonly',
  adsense: 'https://www.googleapis.com/auth/adsense.readonly',
  ads: 'https://www.googleapis.com/auth/adwords',
};

// --- Small shared bits ------------------------------------------------------

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border shrink-0 ${
        connected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'
      }`}
    >
      {connected ? <CheckCircle2 size={11} /> : <CircleDashed size={11} />}
      {connected ? 'Connected' : 'Not Connected'}
    </span>
  );
}

function CardShell({
  icon: Icon,
  title,
  status,
  children,
}: {
  icon: typeof BarChart3;
  title: string;
  status: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-green-700" />
          </div>
          <h2 className="text-base font-black text-gray-900 uppercase font-serif tracking-tight">{title}</h2>
        </div>
        {status}
      </div>
      {children}
    </div>
  );
}

function SaveRow({
  onSave,
  saving,
  msg,
}: {
  onSave: () => void;
  saving: boolean;
  msg: { type: 'success' | 'error'; text: string } | null;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mt-3">
      {msg && (
        <span className={`text-[10px] font-bold ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg.text}
        </span>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="ml-auto bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-green-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Save size={13} />
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

// --- Field-backed module card (Analytics / Tag Manager / AdSense share this shape) ---

function PickerModuleCard({
  icon,
  title,
  description,
  fieldValue,
  onSaveField,
  placeholder,
  help,
  fetchUrl,
  fetchLabel,
  requiredScope,
  connection,
  connectHref,
  oauthConfigured,
  renderOption,
}: {
  icon: typeof BarChart3;
  title: string;
  description: string;
  fieldValue: string;
  onSaveField: (value: string) => Promise<{ success: boolean; error?: string }>;
  placeholder: string;
  help: string;
  fetchUrl: string;
  fetchLabel: string;
  requiredScope: string;
  connection: ConnectionInfo;
  connectHref: string;
  oauthConfigured: boolean;
  renderOption: (item: any) => { value: string; label: string };
}) {
  const router = useRouter();
  const [value, setValue] = useState(fieldValue);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<any[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const hasScope = connection.connected && connection.scopes.includes(requiredScope);
  const isConnected = !!fieldValue?.trim();

  const handleSave = async (v: string) => {
    setSaving(true);
    setMsg(null);
    const res = await onSaveField(v);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'Saved!' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  const handleFetch = async () => {
    setFetching(true);
    setFetchError(null);
    setOptions(null);
    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      const list = Object.values(data)[0] as any[];
      setOptions(list);
      if (list.length === 0) setFetchError('No results found on this Google account.');
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  };

  return (
    <CardShell icon={icon} title={title} status={<StatusBadge connected={isConnected} />}>
      <p className="text-gray-500 text-xs leading-relaxed mb-4">{description}</p>

      {oauthConfigured && !hasScope && (
        <a
          href={connectHref}
          className="w-full mb-3 bg-gray-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plug size={13} /> Connect to auto-import
        </a>
      )}

      {oauthConfigured && hasScope && (
        <div className="mb-3">
          <button
            type="button"
            onClick={handleFetch}
            disabled={fetching}
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={13} className={fetching ? 'animate-spin' : ''} /> {fetching ? 'Fetching…' : fetchLabel}
          </button>

          {fetchError && <p className="text-[10px] text-red-600 font-bold mt-2">{fetchError}</p>}

          {options && options.length > 0 && (
            <select
              className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-green-600 outline-none text-gray-900"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                setValue(e.target.value);
                handleSave(e.target.value);
              }}
            >
              <option value="" disabled>
                -- Select to auto-fill --
              </option>
              {options.map((item, i) => {
                const { value: v, label } = renderOption(item);
                return (
                  <option key={i} value={v}>
                    {label}
                  </option>
                );
              })}
            </select>
          )}
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900 transition-colors mb-2"
      />
      <p className="text-[10px] text-gray-400 mb-1">{help}</p>

      <SaveRow onSave={() => handleSave(value)} saving={saving} msg={msg} />
    </CardShell>
  );
}

// --- Search Console: two-step auto-verify -----------------------------------

function SearchConsoleCard({
  fieldValue,
  connection,
  oauthConfigured,
  defaultSiteUrl,
}: {
  fieldValue: string;
  connection: ConnectionInfo;
  oauthConfigured: boolean;
  defaultSiteUrl: string;
}) {
  const router = useRouter();
  const hasScope = connection.connected && connection.scopes.includes(SCOPE.searchconsole);
  const isConnected = !!fieldValue?.trim();
  const [siteUrl, setSiteUrl] = useState(defaultSiteUrl);
  const [step, setStep] = useState<'idle' | 'started'>(fieldValue ? 'started' : 'idle');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleStart = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/google/searchconsole/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('started');
      setMsg({ type: 'success', text: 'Verification tag is live on your site. Wait a moment, then confirm ownership below.' });
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/google/searchconsole/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: 'success', text: 'Ownership verified! This site now shows up in your Search Console account.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <CardShell icon={Search} title="Search Console" status={<StatusBadge connected={isConnected} />}>
      <p className="text-gray-500 text-xs leading-relaxed mb-4">
        Verifies domain ownership and pulls in your Google Search traffic and performance data.
      </p>

      {oauthConfigured && !hasScope && (
        <a
          href="/api/admin/google/connect?groups=core"
          className="w-full mb-3 bg-gray-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plug size={13} /> Connect to auto-verify
        </a>
      )}

      {oauthConfigured && hasScope && (
        <div className="space-y-2 mb-2">
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://goridez.com/"
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={busy}
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              1. Get Verification Tag
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy || step !== 'started'}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              2. Confirm Ownership
            </button>
          </div>
        </div>
      )}

      {!oauthConfigured && (
        <p className="text-[10px] text-gray-400 mb-2">
          Manual mode — paste the verification code from Search Console → Settings → Ownership verification → HTML tag (just the `content` value).
        </p>
      )}

      {msg && (
        <p className={`text-[10px] font-bold mt-2 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg.text}
        </p>
      )}

      {fieldValue && (
        <p className="text-[10px] text-gray-400 font-mono mt-3 truncate">Current tag: {fieldValue}</p>
      )}
    </CardShell>
  );
}

// --- Google Ads ---------------------------------------------------------------

function AdsCard({
  fieldValue,
  connection,
  oauthConfigured,
  developerTokenConfigured,
}: {
  fieldValue: string;
  connection: ConnectionInfo;
  oauthConfigured: boolean;
  developerTokenConfigured: boolean;
}) {
  const router = useRouter();
  const hasScope = connection.connected && connection.scopes.includes(SCOPE.ads);
  const isConnected = !!fieldValue?.trim();
  const [value, setValue] = useState(fieldValue);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [customers, setCustomers] = useState<string[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleSave = async (v: string) => {
    setSaving(true);
    setMsg(null);
    const res = await updateGoogleIntegration('googleAdsCustomerId', v);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'Saved!' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  const handleFetch = async () => {
    setFetching(true);
    setFetchError(null);
    setCustomers(null);
    try {
      const res = await fetch('/api/admin/google/ads');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      setCustomers(data.customers);
      if (data.customers.length === 0) setFetchError('No accessible Ads accounts found.');
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  };

  return (
    <CardShell icon={Megaphone} title="Google Ads" status={<StatusBadge connected={isConnected} />}>
      <p className="text-gray-500 text-xs leading-relaxed mb-4">Grow the business with Google Ads campaigns.</p>

      {!developerTokenConfigured && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-relaxed">
            Auto-import needs a Developer Token from the{' '}
            <a href="https://ads.google.com/aw/apicenter" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">
              Google Ads API Center <ExternalLink size={9} />
            </a>{' '}
            (separate Google approval). You can still paste a Customer ID manually below.
          </p>
        </div>
      )}

      {oauthConfigured && developerTokenConfigured && !hasScope && (
        <a
          href="/api/admin/google/connect?groups=ads"
          className="w-full mb-3 bg-gray-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Plug size={13} /> Grant Ads Access
        </a>
      )}

      {oauthConfigured && developerTokenConfigured && hasScope && (
        <div className="mb-3">
          <button
            type="button"
            onClick={handleFetch}
            disabled={fetching}
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={13} className={fetching ? 'animate-spin' : ''} /> {fetching ? 'Fetching…' : 'Fetch my Ads accounts'}
          </button>
          {fetchError && <p className="text-[10px] text-red-600 font-bold mt-2">{fetchError}</p>}
          {customers && customers.length > 0 && (
            <select
              className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-mono focus:border-green-600 outline-none text-gray-900"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                setValue(e.target.value);
                handleSave(e.target.value);
              }}
            >
              <option value="" disabled>-- Select to auto-fill --</option>
              {customers.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="123-456-7890"
        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900 transition-colors mb-2"
      />
      <SaveRow onSave={() => handleSave(value)} saving={saving} msg={msg} />
    </CardShell>
  );
}

// --- PageSpeed Insights --------------------------------------------------------

function PageSpeedCard({ pageSpeedConfigured, defaultSiteUrl }: { pageSpeedConfigured: boolean; defaultSiteUrl: string }) {
  const [url, setUrl] = useState(defaultSiteUrl);
  const [running, setRunning] = useState(false);
  const [scores, setScores] = useState<{ performance: number; accessibility: number; bestPractices: number; seo: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setScores(null);
    try {
      const res = await fetch('/api/admin/google/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, strategy: 'MOBILE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScores(data.scores);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  const scoreColor = (n: number) => (n >= 90 ? 'text-green-600' : n >= 50 ? 'text-amber-600' : 'text-red-600');

  return (
    <CardShell icon={Gauge} title="PageSpeed Insights" status={<StatusBadge connected={!!scores} />}>
      <p className="text-gray-500 text-xs leading-relaxed mb-4">Analyzes a page and suggests ways to make it faster. No connection needed — just an API key.</p>

      {!pageSpeedConfigured && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          Add <code className="font-mono">GOOGLE_PAGESPEED_API_KEY</code> to your environment to enable this module.
        </p>
      )}

      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://goridez.com/"
        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900 mb-3"
      />

      <button
        type="button"
        onClick={run}
        disabled={running || !pageSpeedConfigured}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <RefreshCw size={13} className={running ? 'animate-spin' : ''} /> {running ? 'Running test…' : 'Run Test'}
      </button>

      {error && <p className="text-[10px] text-red-600 font-bold mt-3">{error}</p>}

      {scores && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            ['Perf', scores.performance],
            ['A11y', scores.accessibility],
            ['Best Pr.', scores.bestPractices],
            ['SEO', scores.seo],
          ].map(([label, n]) => (
            <div key={label as string} className="text-center bg-gray-50 rounded-xl py-3 border border-gray-200">
              <div className={`text-lg font-black ${scoreColor(n as number)}`}>{n}</div>
              <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      )}
    </CardShell>
  );
}

// --- Sign in with Google (customer-facing) -------------------------------------

function SignInCard({ enabled, oauthConfigured }: { enabled: boolean; oauthConfigured: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setSaving(true);
    await updateGoogleSignInToggle(next);
    setSaving(false);
    router.refresh();
  };

  return (
    <CardShell icon={LogIn} title="Sign in with Google" status={<StatusBadge connected={on} />}>
      <p className="text-gray-500 text-xs leading-relaxed mb-4">
        Lets customers sign up and log in to their booking account with their existing Google account, on the /login and /register pages.
      </p>

      {!oauthConfigured && (
        <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
          Needs <code className="font-mono">GOOGLE_OAUTH_CLIENT_ID</code> / <code className="font-mono">GOOGLE_OAUTH_CLIENT_SECRET</code> configured first.
        </p>
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={saving || !oauthConfigured}
        className={`w-full font-bold text-[10px] uppercase tracking-wider px-4 py-3 rounded-xl transition-all disabled:opacity-50 ${
          on ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {saving ? 'Saving…' : on ? 'Disable on Login Pages' : 'Enable on Login Pages'}
      </button>
    </CardShell>
  );
}

// --- Root ------------------------------------------------------------------

function ConnectBanner({ connection, oauthConfigured }: { connection: ConnectionInfo; oauthConfigured: boolean }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  const disconnect = async () => {
    if (!confirm('Disconnect this Google account? All modules using it will stop auto-importing until you reconnect.')) return;
    setDisconnecting(true);
    await fetch('/api/admin/google/disconnect', { method: 'POST' });
    setDisconnecting(false);
    router.refresh();
  };

  if (!oauthConfigured) {
    return (
      <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-900">OAuth not configured yet</p>
          <p className="text-[11px] text-amber-800 mt-1">
            Add <code className="font-mono">GOOGLE_OAUTH_CLIENT_ID</code> and <code className="font-mono">GOOGLE_OAUTH_CLIENT_SECRET</code> to your environment to enable one-click Connect &amp; auto-import. Until then, every module below still works with manual ID entry.
          </p>
        </div>
      </div>
    );
  }

  if (connection.connected) {
    return (
      <div className="mb-8 p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-green-700" />
          </div>
          <div>
            <p className="text-xs font-bold text-green-900">Google Account Connected</p>
            <p className="text-[11px] text-green-700 font-mono">{connection.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={disconnect}
          disabled={disconnecting}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-700 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
        >
          <Unplug size={13} /> {disconnecting ? 'Disconnecting…' : 'Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-white border border-gray-200 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
      <div>
        <p className="text-sm font-black text-gray-900 uppercase font-serif tracking-tight">Connect Google Account</p>
        <p className="text-xs text-gray-500 mt-1 max-w-lg">
          One connection powers Analytics, Search Console and Tag Manager below. AdSense and Ads request additional access separately, only if you enable them.
        </p>
      </div>
      <a
        href="/api/admin/google/connect?groups=core"
        className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-md shadow-green-600/20 flex items-center justify-center gap-2"
      >
        <Plug size={15} /> Connect Google Account
      </a>
    </div>
  );
}

function CallbackBanner() {
  const searchParams = useSearchParams();
  const connected = searchParams.get('connected');
  const error = searchParams.get('error');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (connected || error) {
      const url = new URL(window.location.href);
      url.searchParams.delete('connected');
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [connected, error]);

  if (dismissed || (!connected && !error)) return null;

  return (
    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
      connected ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {connected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="flex-1">{connected ? 'Google account connected successfully!' : `Connection failed: ${error}`}</span>
      <button onClick={() => setDismissed(true)} type="button" className="opacity-50 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

function CredentialsCard({ credentials }: { credentials: CredentialsInfo }) {
  const router = useRouter();
  const [values, setValues] = useState(credentials);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expanded, setExpanded] = useState(!credentials.clientId);

  const configured = !!credentials.clientId && !!credentials.clientSecret;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const fd = new FormData();
    fd.append('googleOAuthClientId', values.clientId);
    fd.append('googleOAuthClientSecret', values.clientSecret);
    fd.append('googlePagespeedApiKey', values.pagespeedApiKey);
    fd.append('googleAdsDeveloperToken', values.adsDeveloperToken);
    const res = await updateGoogleCredentials(fd);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'Credentials saved — takes effect immediately, no redeploy needed.' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  return (
    <div className="mb-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
            <KeyRound size={18} className="text-gray-700" />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-gray-900 uppercase font-serif tracking-tight">Google API Credentials</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Managed here, not in .env — changes apply instantly, no redeploy.</p>
          </div>
        </div>
        <StatusBadge connected={configured} />
      </button>

      {expanded && (
        <form onSubmit={handleSave} className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">OAuth Client ID</label>
            <input
              type="text"
              value={values.clientId}
              onChange={(e) => setValues({ ...values, clientId: e.target.value })}
              placeholder="xxxxx.apps.googleusercontent.com"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">OAuth Client Secret</label>
            <input
              type="password"
              value={values.clientSecret}
              onChange={(e) => setValues({ ...values, clientSecret: e.target.value })}
              placeholder="GOCSPX-…"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">PageSpeed Insights API Key</label>
            <input
              type="password"
              value={values.pagespeedApiKey}
              onChange={(e) => setValues({ ...values, pagespeedApiKey: e.target.value })}
              placeholder="AIza…"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Google Ads Developer Token</label>
            <input
              type="password"
              value={values.adsDeveloperToken}
              onChange={(e) => setValues({ ...values, adsDeveloperToken: e.target.value })}
              placeholder="Optional — from Ads API Center"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3">
            {msg && (
              <span className={`text-[10px] font-bold ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {msg.text}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto bg-gray-900 hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={13} /> {saving ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function IntegrationsManager({
  initialData,
  connection,
  credentials,
  oauthConfigured,
  pageSpeedConfigured,
  adsDeveloperTokenConfigured,
  defaultSiteUrl,
}: {
  initialData: Partial<IntegrationsData> | null;
  connection: ConnectionInfo;
  credentials: CredentialsInfo;
  oauthConfigured: boolean;
  pageSpeedConfigured: boolean;
  adsDeveloperTokenConfigured: boolean;
  defaultSiteUrl: string;
}) {
  const data: IntegrationsData = {
    googleAnalyticsId: initialData?.googleAnalyticsId || '',
    googleSearchConsoleVerification: initialData?.googleSearchConsoleVerification || '',
    googleTagManagerId: initialData?.googleTagManagerId || '',
    googleAdsensePublisherId: initialData?.googleAdsensePublisherId || '',
    googleAdsCustomerId: initialData?.googleAdsCustomerId || '',
    googleSignInEnabled: initialData?.googleSignInEnabled || false,
  };

  return (
    <div className="max-w-6xl mx-auto py-6 font-body">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
          <Plug size={16} /> Third-Party Connections
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">
          Google Integrations
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Easily set up Google tools on this site — Analytics, Search Console, Tag Manager, AdSense, Ads, PageSpeed Insights and Sign in with Google — from one dashboard, similar to Site Kit by Google.
        </p>
      </div>

      <CallbackBanner />
      <CredentialsCard credentials={credentials} />
      <ConnectBanner connection={connection} oauthConfigured={oauthConfigured} />

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PickerModuleCard
          icon={BarChart3}
          title="Google Analytics"
          description="Tells you how visitors find, use and engage with this site (GA4)."
          fieldValue={data.googleAnalyticsId}
          onSaveField={(v) => updateGoogleIntegration('googleAnalyticsId', v)}
          placeholder="G-XXXXXXXXXX"
          help="Admin → Data Streams → Web → Measurement ID"
          fetchUrl="/api/admin/google/analytics"
          fetchLabel="Fetch my Analytics properties"
          requiredScope={SCOPE.analytics}
          connection={connection}
          connectHref="/api/admin/google/connect?groups=core"
          oauthConfigured={oauthConfigured}
          renderOption={(p) => ({ value: p.measurementId, label: `${p.displayName} (${p.measurementId || 'no web stream'})` })}
        />

        <SearchConsoleCard
          fieldValue={data.googleSearchConsoleVerification}
          connection={connection}
          oauthConfigured={oauthConfigured}
          defaultSiteUrl={defaultSiteUrl}
        />

        <PickerModuleCard
          icon={Tags}
          title="Tag Manager"
          description="Creates and manages all tracking/marketing tags on this site without code changes."
          fieldValue={data.googleTagManagerId}
          onSaveField={(v) => updateGoogleIntegration('googleTagManagerId', v)}
          placeholder="GTM-XXXXXXX"
          help="Admin → Container Settings → Container ID"
          fetchUrl="/api/admin/google/tagmanager"
          fetchLabel="Fetch my GTM containers"
          requiredScope={SCOPE.tagmanager}
          connection={connection}
          connectHref="/api/admin/google/connect?groups=core"
          oauthConfigured={oauthConfigured}
          renderOption={(c) => ({ value: c.publicId, label: `${c.name} (${c.publicId})` })}
        />

        <PickerModuleCard
          icon={Banknote}
          title="AdSense"
          description="Helps this site earn money from online content."
          fieldValue={data.googleAdsensePublisherId}
          onSaveField={(v) => updateGoogleIntegration('googleAdsensePublisherId', v)}
          placeholder="ca-pub-XXXXXXXXXXXXXXXX"
          help="Account → Account information → Publisher ID"
          fetchUrl="/api/admin/google/adsense"
          fetchLabel="Fetch my AdSense accounts"
          requiredScope={SCOPE.adsense}
          connection={connection}
          connectHref="/api/admin/google/connect?groups=adsense"
          oauthConfigured={oauthConfigured}
          renderOption={(a) => ({ value: a.publisherId, label: `${a.displayName} (${a.publisherId})` })}
        />

        <AdsCard
          fieldValue={data.googleAdsCustomerId}
          connection={connection}
          oauthConfigured={oauthConfigured}
          developerTokenConfigured={adsDeveloperTokenConfigured}
        />

        <PageSpeedCard pageSpeedConfigured={pageSpeedConfigured} defaultSiteUrl={defaultSiteUrl} />

        <SignInCard enabled={data.googleSignInEnabled} oauthConfigured={oauthConfigured} />
      </div>
    </div>
  );
}
