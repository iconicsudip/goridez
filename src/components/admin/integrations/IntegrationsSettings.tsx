'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3, Search, Tags, Banknote, Megaphone, Gauge, LogIn, KeyRound,
  CheckCircle2, CircleDashed, Save, Plug, RefreshCw, Unplug, X, AlertCircle, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { updateGoogleIntegration, updateGoogleSignInToggle, updateGoogleCredentials } from '@/app/admin/actions';

const SCOPE = {
  analytics: 'https://www.googleapis.com/auth/analytics.readonly',
  searchconsole: 'https://www.googleapis.com/auth/webmasters.readonly',
  tagmanager: 'https://www.googleapis.com/auth/tagmanager.readonly',
  adsense: 'https://www.googleapis.com/auth/adsense.readonly',
  ads: 'https://www.googleapis.com/auth/adwords',
};

// --- Shared Bits ---

function SaveRow({ onSave, saving, msg }: { onSave: () => void; saving: boolean; msg: { type: 'success' | 'error'; text: string } | null }) {
  return (
    <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
      {msg && (
        <span className={`text-[10px] font-bold ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {msg.text}
        </span>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="ml-auto bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2 rounded-md transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

function AccordionItem({
  icon: Icon,
  title,
  connected,
  children,
  defaultExpanded = false
}: {
  icon: any;
  title: string;
  connected: boolean;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-5 px-6 hover:bg-gray-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <Icon size={24} className="text-gray-700" />
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          {connected && (
            <div className="flex items-center gap-1.5 text-sm text-gray-700">
              Connected
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white">
                <CheckCircle2 size={12} strokeWidth={3} />
              </div>
            </div>
          )}
          {!connected && (
            <div className="text-sm text-gray-500 font-medium">Not Connected</div>
          )}
          {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </button>
      
      {expanded && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// --- Module Components ---

function PickerModule({
  description, fieldValue, onSaveField, placeholder, help, fetchUrl, fetchLabel, requiredScope, connection, connectHref, oauthConfigured, renderOption
}: any) {
  const router = useRouter();
  const [value, setValue] = useState(fieldValue);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<any[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const hasScope = connection.connected && connection.scopes.includes(requiredScope);

  const handleSave = async (v: string, rawItem?: any) => {
    setSaving(true);
    setMsg(null);
    const res = await onSaveField(v, rawItem);
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
    <div>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      {oauthConfigured && !hasScope && (
        <a href={connectHref} className="mb-4 bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-md inline-flex items-center gap-2">
          <Plug size={14} /> Connect to auto-import
        </a>
      )}

      {oauthConfigured && hasScope && (
        <div className="mb-4">
          <button type="button" onClick={handleFetch} disabled={fetching} className="bg-green-50 text-green-700 font-bold text-xs px-4 py-2.5 rounded-md border border-green-200 hover:bg-green-100 flex items-center gap-2 disabled:opacity-50">
            <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} /> {fetching ? 'Fetching…' : fetchLabel}
          </button>
          {fetchError && <p className="text-xs text-red-600 font-bold mt-2">{fetchError}</p>}
          {options && options.length > 0 && (
            <select
              className="w-full mt-3 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 outline-none"
              defaultValue=""
              onChange={(e) => {
                if (!e.target.value) return;
                setValue(e.target.value);
                const selectedItem = options?.find(opt => renderOption(opt).value === e.target.value);
                handleSave(e.target.value, selectedItem);
              }}
            >
              <option value="" disabled>-- Select to auto-fill --</option>
              {options.map((item: any, i: number) => {
                const { value: v, label } = renderOption(item);
                return <option key={i} value={v}>{label}</option>;
              })}
            </select>
          )}
        </div>
      )}

      <div className="space-y-1 mt-2">
        <label className="text-xs font-bold text-gray-700">Tracking ID</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-green-600 outline-none"
        />
        <p className="text-[10px] text-gray-500">{help}</p>
      </div>

      <SaveRow onSave={() => handleSave(value)} saving={saving} msg={msg} />
    </div>
  );
}

// ... Additional modules can be converted similar to PickerModule

export default function IntegrationsSettings({
  initialData, connection, credentials, oauthConfigured, pageSpeedConfigured, adsDeveloperTokenConfigured, defaultSiteUrl
}: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'connected' | 'more' | 'admin'>('connected');

  const data = {
    googleAnalyticsId: initialData?.googleAnalyticsId || '',
    googleSearchConsoleVerification: initialData?.googleSearchConsoleVerification || '',
    googleTagManagerId: initialData?.googleTagManagerId || '',
    googleAdsensePublisherId: initialData?.googleAdsensePublisherId || '',
    googleAdsCustomerId: initialData?.googleAdsCustomerId || '',
    googleSignInEnabled: initialData?.googleSignInEnabled || false,
  };

  const isConnected = (id: string) => !!id?.trim();

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('connected')}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'connected' ? 'text-green-700 border-b-2 border-green-700 bg-green-50/20' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Connected Services
          </button>
          <button 
            onClick={() => setActiveTab('more')}
            className={`flex-1 py-4 text-sm font-bold transition-colors border-l border-gray-100 ${activeTab === 'more' ? 'text-green-700 border-b-2 border-green-700 bg-green-50/20' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Connect More Services
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-4 text-sm font-bold transition-colors border-l border-gray-100 ${activeTab === 'admin' ? 'text-green-700 border-b-2 border-green-700 bg-green-50/20' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Admin Settings
          </button>
        </div>

        {activeTab === 'connected' && (
          <div className="flex flex-col">
            {isConnected(data.googleSearchConsoleVerification) && (
              <AccordionItem icon={Search} title="Search Console" connected={true} defaultExpanded={true}>
                {editingId === 'searchConsole' ? (
                 <PickerModule 
                   description="Verifies domain ownership and pulls in your Google Search traffic and performance data."
                   fieldValue={data.googleSearchConsoleVerification}
                   onSaveField={async (v: string) => {
                     const res = await updateGoogleIntegration('googleSearchConsoleVerification', v);
                     if (res.success) setEditingId(null);
                     return res;
                   }}
                   placeholder="Verification Tag"
                   help="Manual mode — paste the verification HTML tag."
                   requiredScope={SCOPE.searchconsole}
                   connection={connection}
                   connectHref="/api/admin/google/connect?groups=core"
                   oauthConfigured={oauthConfigured}
                 />
                ) : (
                <div className="pt-2">
                  <p className="text-sm font-bold text-gray-900 mb-1">Connected Property</p>
                  <p className="text-sm text-gray-600 mb-6">{defaultSiteUrl}</p>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <button onClick={() => setEditingId('searchConsole')} className="text-teal-600 hover:underline flex items-center gap-1">Edit <span className="text-[10px]">✎</span></button>
                    <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">See full details in Search Console <ExternalLink size={14}/></a>
                  </div>
                </div>
                )}
              </AccordionItem>
            )}
            
            {isConnected(data.googleAdsCustomerId) && (
              <AccordionItem icon={Megaphone} title="Ads" connected={true}>
                {editingId === 'ads' ? (
                 <PickerModule 
                    description="Grow the business with Google Ads campaigns."
                    fieldValue={data.googleAdsCustomerId}
                    onSaveField={async (v: string) => {
                      const res = await updateGoogleIntegration('googleAdsCustomerId', v);
                      if (res.success) setEditingId(null);
                      return res;
                    }}
                    placeholder="123-456-7890"
                    help="Customer ID"
                    fetchUrl="/api/admin/google/ads"
                    fetchLabel="Fetch my Ads accounts"
                    requiredScope={SCOPE.ads}
                    connection={connection}
                    connectHref="/api/admin/google/connect?groups=ads"
                    oauthConfigured={oauthConfigured}
                    renderOption={(p: any) => ({ value: p, label: p })}
                 />
                ) : (
                <div className="pt-2 space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Customer ID</p>
                    <p className="text-sm text-gray-600">{data.googleAdsCustomerId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Plugin conversion tracking</p>
                    <p className="text-sm text-gray-600">Enabled</p>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium pt-2">
                    <button onClick={() => setEditingId('ads')} className="text-teal-600 hover:underline flex items-center gap-1">Edit <span className="text-[10px]">✎</span></button>
                    <a href="https://ads.google.com" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">See full details in Ads <ExternalLink size={14}/></a>
                  </div>
                </div>
                )}
              </AccordionItem>
            )}

            {isConnected(data.googleAnalyticsId) && (
              <AccordionItem icon={BarChart3} title="Analytics" connected={true}>
                {editingId === 'analytics' ? (
                 <PickerModule 
                    description="Tells you how visitors find, use and engage with this site (GA4)."
                    fieldValue={data.googleAnalyticsId}
                    onSaveField={async (v: string, rawItem?: any) => {
                      let res = await updateGoogleIntegration('googleAnalyticsId', v);
                      if (res.success && rawItem?.propertyId) {
                        res = await updateGoogleIntegration('googleAnalyticsPropertyId', rawItem.propertyId);
                      }
                      if (res.success) setEditingId(null);
                      return res;
                    }}
                    placeholder="G-XXXXXXXXXX"
                    help="Admin → Data Streams → Web → Measurement ID"
                    fetchUrl="/api/admin/google/analytics"
                    fetchLabel="Fetch my Analytics properties"
                    requiredScope={SCOPE.analytics}
                    connection={connection}
                    connectHref="/api/admin/google/connect?groups=core"
                    oauthConfigured={oauthConfigured}
                    renderOption={(p: any) => ({ value: p.measurementId, label: `${p.displayName} (${p.measurementId || 'no web stream'})` })}
                 />
                ) : (
                <div className="pt-2">
                   <p className="text-sm font-bold text-gray-900 mb-1">Measurement ID</p>
                   <p className="text-sm text-gray-600 mb-6">{data.googleAnalyticsId}</p>
                   <div className="flex justify-between items-center text-sm font-medium">
                    <button onClick={() => setEditingId('analytics')} className="text-teal-600 hover:underline flex items-center gap-1">Edit <span className="text-[10px]">✎</span></button>
                    <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline flex items-center gap-1">See full details in Analytics <ExternalLink size={14}/></a>
                  </div>
                </div>
                )}
              </AccordionItem>
            )}
            
            {pageSpeedConfigured && (
              <AccordionItem icon={Gauge} title="PageSpeed Insights" connected={true}>
                 <div className="pt-2">
                   <p className="text-sm font-bold text-gray-900 mb-1">API Key Configured</p>
                   <p className="text-sm text-gray-600 mb-4">You are using your own API key to bypass rate limits.</p>
                 </div>
              </AccordionItem>
            )}

            {data.googleSignInEnabled && (
              <AccordionItem icon={Search} title="Google Sign-In" connected={true}>
                 <div className="pt-2">
                   <p className="text-sm font-bold text-gray-900 mb-1">Sign-In Enabled</p>
                   <p className="text-sm text-gray-600 mb-6">Users can log in and register using their Google accounts.</p>
                   <div className="flex justify-between items-center text-sm font-medium">
                     <button onClick={async () => { await updateGoogleSignInToggle(false); router.refresh(); }} className="text-red-600 hover:underline">Disable Google Sign-In</button>
                   </div>
                 </div>
              </AccordionItem>
            )}

            {(!isConnected(data.googleSearchConsoleVerification) && !isConnected(data.googleAdsCustomerId) && !isConnected(data.googleAnalyticsId) && !pageSpeedConfigured && !data.googleSignInEnabled) && (
              <div className="p-12 text-center text-gray-500">
                <p>No services connected yet. Go to "Connect More Services" to set them up.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'more' && (
          <div className="flex flex-col">
             {!isConnected(data.googleSearchConsoleVerification) && (
               <AccordionItem icon={Search} title="Search Console" connected={false}>
                 <PickerModule 
                   description="Verifies domain ownership and pulls in your Google Search traffic and performance data."
                   fieldValue={data.googleSearchConsoleVerification}
                   onSaveField={(v: string) => updateGoogleIntegration('googleSearchConsoleVerification', v)}
                   placeholder="Verification Tag"
                   help="Manual mode — paste the verification HTML tag."
                   requiredScope={SCOPE.searchconsole}
                   connection={connection}
                   connectHref="/api/admin/google/connect?groups=core"
                   oauthConfigured={oauthConfigured}
                 />
               </AccordionItem>
             )}
             
             {!isConnected(data.googleAnalyticsId) && (
               <AccordionItem icon={BarChart3} title="Analytics" connected={false}>
                 <PickerModule 
                    description="Tells you how visitors find, use and engage with this site (GA4)."
                    fieldValue={data.googleAnalyticsId}
                    onSaveField={async (v: string, rawItem?: any) => {
                      let res = await updateGoogleIntegration('googleAnalyticsId', v);
                      if (res.success && rawItem?.propertyId) {
                        res = await updateGoogleIntegration('googleAnalyticsPropertyId', rawItem.propertyId);
                      }
                      return res;
                    }}
                    placeholder="G-XXXXXXXXXX"
                    help="Admin → Data Streams → Web → Measurement ID"
                    fetchUrl="/api/admin/google/analytics"
                    fetchLabel="Fetch my Analytics properties"
                    requiredScope={SCOPE.analytics}
                    connection={connection}
                    connectHref="/api/admin/google/connect?groups=core"
                    oauthConfigured={oauthConfigured}
                    renderOption={(p: any) => ({ value: p.measurementId, label: `${p.displayName} (${p.measurementId || 'no web stream'})` })}
                 />
               </AccordionItem>
             )}

             {!isConnected(data.googleAdsCustomerId) && (
               <AccordionItem icon={Megaphone} title="Ads" connected={false}>
                 <PickerModule 
                    description="Grow the business with Google Ads campaigns."
                    fieldValue={data.googleAdsCustomerId}
                    onSaveField={(v: string) => updateGoogleIntegration('googleAdsCustomerId', v)}
                    placeholder="123-456-7890"
                    help="Customer ID"
                    fetchUrl="/api/admin/google/ads"
                    fetchLabel="Fetch my Ads accounts"
                    requiredScope={SCOPE.ads}
                    connection={connection}
                    connectHref="/api/admin/google/connect?groups=ads"
                    oauthConfigured={oauthConfigured}
                    renderOption={(p: any) => ({ value: p, label: p })}
                 />
               </AccordionItem>
             )}

             {!data.googleSignInEnabled && (
               <AccordionItem icon={Search} title="Google Sign-In" connected={false}>
                 <div className="pt-2">
                   <p className="text-sm font-bold text-gray-900 mb-2">Allow users to log in with Google</p>
                   <p className="text-sm text-gray-600 mb-6">Enabling this adds a "Continue with Google" button to the login and registration pages.</p>
                   <button
                     onClick={async () => { await updateGoogleSignInToggle(true); router.refresh(); }}
                     className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-green-700 transition-colors"
                   >
                     Enable Google Sign-In
                   </button>
                 </div>
               </AccordionItem>
             )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Admin Settings</h3>
            <p className="text-gray-600 mb-6 text-sm">Configure your Google OAuth credentials here. These are required for automatic fetching of Analytics, Search Console, and Ads data.</p>
            {/* The credentials form could go here, or a link to it */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
               <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
               <div>
                 <p className="text-sm font-bold text-amber-900">Advanced Setup</p>
                 <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                   To fully utilize the Google Integrations (like fetching live data and connecting accounts automatically), you must have a valid Google Cloud Project with the necessary APIs enabled (Analytics Data API, Search Console API, etc.) and OAuth credentials configured in the environment or database.
                 </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
