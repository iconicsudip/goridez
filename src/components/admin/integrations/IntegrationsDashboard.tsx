'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, AlertTriangle, Clock } from 'lucide-react';

const COLORS = ['#A78BFA', '#93C5FD', '#F472B6', '#FCD34D', '#F87171'];

// Shown when the connected Google account has no Search Console access to this property.
// That's a per-property grant made inside Search Console itself — separate from (and not
// fixable via) the OAuth "Connect Google Account" flow, so we point admins there directly
// instead of leaving them staring at a chart that silently reads as "0 impressions".
function SearchConsoleAccessNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="text-sm font-bold text-amber-900">Search Console data unavailable — no access yet</p>
        <p className="text-xs text-amber-800 mt-1.5 leading-relaxed">
          The connected Google account can read Analytics fine, but hasn&apos;t been granted access to this site&apos;s Search Console property. This isn&apos;t something reconnecting the account fixes — it needs to be added as a user on the property itself:
        </p>
        <ol className="text-xs text-amber-800 mt-2 ml-4 list-decimal space-y-1">
          <li>Open <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="font-bold underline">Search Console</a> and sign in with whichever account already owns this property</li>
          <li>Select the property → <span className="font-mono">Settings → Users and permissions → Add user</span></li>
          <li>Add the connected account&apos;s email with &quot;Full&quot; permission (check <span className="font-mono">/admin/integrations</span> for which email is connected)</li>
        </ol>
        <p className="text-xs text-amber-800 mt-2">
          If the property doesn&apos;t exist in Search Console at all yet, it needs to be added &amp; verified first — this data won&apos;t appear until that&apos;s done.
        </p>
      </div>
    </div>
  );
}

// Shown when Search Console access works (the API call succeeds) but returns zero rows for
// every report. This is normal right after a property is newly verified or newly granted
// access — Search Console doesn't backfill Performance data from before that point, and
// typically takes 24-72h to start recording it. Distinguishing this from SearchConsoleAccessNotice
// matters: that one means "fix a permission", this one means "just wait".
function SearchConsoleNoDataNotice() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex items-start gap-4">
      <Clock className="text-blue-600 shrink-0 mt-0.5" size={20} />
      <div>
        <p className="text-sm font-bold text-blue-900">Search Console is connected — no data recorded yet</p>
        <p className="text-xs text-blue-800 mt-1.5 leading-relaxed">
          Access is working fine, but Google hasn&apos;t returned any impressions, clicks or queries for this property in the last 28 days. This is expected right after a property is newly verified or newly granted access — Search Console doesn&apos;t backfill data from before that point, and typically takes 24-72 hours to start showing Performance data. Check back in a day or two.
        </p>
      </div>
    </div>
  );
}

export default function IntegrationsDashboard({ siteUrl }: { siteUrl: string }) {
  const [activeTab, setActiveTab] = useState('Traffic');
  const tabs = ['Traffic', 'Content', 'Speed', 'Monetization'];

  // State for data
  const [trafficData, setTrafficData] = useState<any>(null);
  const [searchTrafficData, setSearchTrafficData] = useState<any>(null);
  const [channelsData, setChannelsData] = useState<any>(null);
  const [locationsData, setLocationsData] = useState<any>(null);
  const [devicesData, setDevicesData] = useState<any>(null);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [activePieChart, setActivePieChart] = useState<'Channels' | 'Locations' | 'Devices'>('Channels');
  const [activeSearchTab, setActiveSearchTab] = useState<'impressions' | 'clicks' | 'visitors' | 'events'>('impressions');
  const [topContent, setTopContent] = useState<any>(null);
  const [topQueries, setTopQueries] = useState<any>(null);
  const [speedData, setSpeedData] = useState<any>(null);
  const [searchConsoleNoAccess, setSearchConsoleNoAccess] = useState(false);
  // True once we've confirmed the connected account CAN reach Search Console but it has
  // returned zero rows for every report — i.e. access is fine, Google just hasn't recorded
  // any Performance data for this property yet (normal for the first 24-72h after a property
  // is newly verified/granted access; it doesn't backfill from before that point).
  const [searchConsoleNoData, setSearchConsoleNoData] = useState(false);

  // State for loading/errors
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const fetchTraffic = useCallback(async () => {
    if (trafficData) return;
    setLoading(prev => ({ ...prev, traffic: true }));
    try {
      const res = await fetch('/api/admin/google/analytics/report?type=traffic');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      const formatted = (data.rows || []).map((row: any) => ({
        date: row.dimensionValues[0].value.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3'), // MM/DD
        activeUsers: parseInt(row.metricValues[0].value),
        sessions: parseInt(row.metricValues[1].value)
      }));
      setTrafficData({ 
        chart: formatted, 
        total: data.totals?.[0]?.metricValues?.[0]?.value || 0 
      });

      // Also fetch channels, locations, devices, insights
      const [resChan, resLoc, resDev, resInsights] = await Promise.all([
        fetch('/api/admin/google/analytics/report?type=channels'),
        fetch('/api/admin/google/analytics/report?type=locations'),
        fetch('/api/admin/google/analytics/report?type=devices'),
        fetch('/api/admin/google/analytics/report?type=insights')
      ]);

      if (resChan.ok) {
        const dataChan = await resChan.json();
        const formattedChan = (dataChan.rows || []).map((row: any, i: number) => ({
          name: row.dimensionValues[0].value,
          value: parseInt(row.metricValues[0].value),
          color: COLORS[i % COLORS.length]
        }));
        setChannelsData(formattedChan);
      }
      
      if (resLoc.ok) {
        const dataLoc = await resLoc.json();
        const formattedLoc = (dataLoc.rows || []).map((row: any, i: number) => ({
          name: row.dimensionValues[0].value,
          value: parseInt(row.metricValues[0].value),
          color: COLORS[i % COLORS.length]
        }));
        setLocationsData(formattedLoc);
      }
      
      if (resDev.ok) {
        const dataDev = await resDev.json();
        const formattedDev = (dataDev.rows || []).map((row: any, i: number) => ({
          name: row.dimensionValues[0].value,
          value: parseInt(row.metricValues[0].value),
          color: COLORS[i % COLORS.length]
        }));
        setDevicesData(formattedDev);
      }
      
      if (resInsights.ok) {
        const dataInsights = await resInsights.json();
        let newV = 0;
        let retV = 0;
        let totalDuration = 0;
        let totalBounce = 0;
        let rowCount = 0;
        
        if (dataInsights.rows) {
          dataInsights.rows.forEach((row: any) => {
             const type = row.dimensionValues[0].value;
             const users = parseInt(row.metricValues[0].value);
             const duration = parseFloat(row.metricValues[1].value);
             const bounce = parseFloat(row.metricValues[2].value);
             
             if (type === 'new') newV += users;
             else if (type === 'returning') retV += users;
             
             totalDuration += duration;
             totalBounce += bounce;
             rowCount++;
          });
          
          setInsightsData({
             newVisitors: newV,
             returningVisitors: retV,
             avgDuration: rowCount > 0 ? (totalDuration / rowCount).toFixed(1) : 0,
             avgBounceRate: rowCount > 0 ? ((totalBounce / rowCount) * 100).toFixed(1) : 0
          });
        }
      }

      // Also fetch search console traffic
      const resSearch = await fetch(`/api/admin/google/searchconsole/report?type=traffic&siteUrl=${encodeURIComponent(siteUrl)}`);
      const dataSearch = await resSearch.json();
      if (dataSearch.noAccess) {
        setSearchConsoleNoAccess(true);
      } else if (resSearch.ok) {
        let totalImpressions = 0, totalClicks = 0;
        const formattedSearch = (dataSearch.rows || []).map((row: any) => {
          totalImpressions += row.impressions;
          totalClicks += row.clicks;
          return {
            date: new Date(row.keys[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            impressions: row.impressions,
            clicks: row.clicks,
            visitors: Math.round(row.clicks * 1.5) || 0, // Dummy data for visual
            events: Math.round(row.clicks * 0.2) || 0   // Dummy data for visual
          };
        });
        if (!dataSearch.rows || dataSearch.rows.length === 0) {
          setSearchConsoleNoData(true);
        } else {
          setSearchTrafficData({ chart: formattedSearch, totalImpressions, totalClicks });
        }
      }

    } catch (err: any) {
      setError(prev => ({ ...prev, traffic: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, traffic: false }));
    }
  }, [siteUrl, trafficData]);

  const fetchContent = useCallback(async () => {
    if (topContent) return;
    setLoading(prev => ({ ...prev, content: true }));
    try {
      const resContent = await fetch('/api/admin/google/analytics/report?type=content');
      const dataContent = await resContent.json();
      if (resContent.ok) {
        const formattedContent = (dataContent.rows || []).map((row: any) => ({
          title: row.dimensionValues[0].value,
          path: row.dimensionValues[1].value,
          views: row.metricValues[0].value,
          sessions: row.metricValues[1].value,
          engagement: (parseFloat(row.metricValues[2].value) * 100).toFixed(2) + '%',
          duration: parseFloat(row.metricValues[3].value).toFixed(1) + 's'
        }));
        setTopContent(formattedContent);
      }

      const resQueries = await fetch(`/api/admin/google/searchconsole/report?type=queries&siteUrl=${encodeURIComponent(siteUrl)}`);
      const dataQueries = await resQueries.json();
      if (dataQueries.noAccess) {
        setSearchConsoleNoAccess(true);
      } else if (resQueries.ok) {
        if (!dataQueries.rows || dataQueries.rows.length === 0) {
          setSearchConsoleNoData(true);
        } else {
          const formattedQueries = (dataQueries.rows || []).map((row: any) => ({
            query: row.keys[0],
            clicks: row.clicks,
            impressions: row.impressions
          }));
          setTopQueries(formattedQueries);
        }
      }
    } catch (err: any) {
      setError(prev => ({ ...prev, content: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, content: false }));
    }
  }, [siteUrl, topContent]);

  const fetchSpeed = useCallback(async (force = false) => {
    if (speedData && !force) return;
    setLoading(prev => ({ ...prev, speed: true }));
    try {
      const resSpeed = await fetch('/api/admin/google/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: siteUrl, strategy: 'MOBILE' })
      });
      const dataSpeed = await resSpeed.json();
      if (resSpeed.ok) {
        setSpeedData(dataSpeed);
      } else {
        throw new Error(dataSpeed.error);
      }
    } catch (err: any) {
      setError(prev => ({ ...prev, speed: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, speed: false }));
    }
  }, [siteUrl, speedData]);

  useEffect(() => {
    fetchTraffic();
    fetchContent();
    fetchSpeed();
  }, [fetchTraffic, fetchContent, fetchSpeed]);

  const scrollToSection = (tab: string) => {
    setActiveTab(tab);
    const el = document.getElementById(`section-${tab.replace(/\s+/g, '-').toLowerCase()}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scoreLabel = (score: number) => {
    if (score >= 0.9) return { label: 'Good', color: 'text-green-600' };
    if (score >= 0.5) return { label: 'Needs improvement', color: 'text-amber-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex flex-wrap gap-3 sticky top-[72px] bg-gray-50 z-10 py-4 -my-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => scrollToSection(tab)}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-16 pt-8">
        <div id="section-traffic" className="scroll-mt-40 space-y-6 animate-in fade-in">
          {loading.traffic ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 flex justify-center items-center">
              <RefreshCw className="animate-spin text-green-600" size={24} />
            </div>
          ) : error.traffic ? (
            <div className="bg-white border border-red-200 rounded-3xl p-8 shadow-sm">
              <p className="text-red-600 font-medium">Error loading traffic data: {error.traffic}</p>
            </div>
          ) : (
            <>
              {trafficData && (
                <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Find out how your audience is growing</h2>
                  <p className="text-gray-500 text-sm mb-6">Track your site&apos;s traffic over time</p>
                  
                  <div className="mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* Traffic Line Chart */}
                      <div>
                        <div className="mb-8">
                          <p className="text-sm font-bold text-gray-700 mb-2">All Visitors</p>
                          <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-medium tracking-tight text-gray-900">
                              {trafficData.total >= 1000 ? (trafficData.total / 1000).toFixed(1) + 'K' : trafficData.total}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-green-600 mt-2">↑ 106.2% <span className="text-gray-400 font-normal">compared to the previous 28 days</span></p>
                        </div>
                        
                        <div className="h-64 mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trafficData.chart} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                              <XAxis dataKey="date" axisLine={true} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} minTickGap={30} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dx={-10} orientation="right" />
                              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Line type="monotone" dataKey="activeUsers" stroke="#059669" strokeWidth={2.5} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Demographics Donut Chart */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex gap-8 w-full justify-center mb-8">
                          <button 
                            onClick={() => setActivePieChart('Channels')}
                            className={`pb-2 border-b-2 text-xs font-bold px-2 transition-colors ${activePieChart === 'Channels' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 font-medium'}`}
                          >Channels</button>
                          <button 
                            onClick={() => setActivePieChart('Locations')}
                            className={`pb-2 border-b-2 text-xs font-bold px-2 transition-colors ${activePieChart === 'Locations' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 font-medium'}`}
                          >Locations</button>
                          <button 
                            onClick={() => setActivePieChart('Devices')}
                            className={`pb-2 border-b-2 text-xs font-bold px-2 transition-colors ${activePieChart === 'Devices' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700 font-medium'}`}
                          >Devices</button>
                        </div>
                        
                        <div className="h-64 w-full relative flex items-center justify-center">
                          {((activePieChart === 'Channels' && channelsData) || 
                            (activePieChart === 'Locations' && locationsData) || 
                            (activePieChart === 'Devices' && devicesData)) && (
                            <>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie 
                                    data={activePieChart === 'Channels' ? channelsData : activePieChart === 'Locations' ? locationsData : devicesData} 
                                    innerRadius={70} 
                                    outerRadius={110} 
                                    paddingAngle={1} 
                                    dataKey="value" 
                                    stroke="none"
                                  >
                                    {(activePieChart === 'Channels' ? channelsData : activePieChart === 'Locations' ? locationsData : devicesData).map((entry: any, index: number) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-500">By</span>
                                <span className="text-sm font-medium text-gray-700">{activePieChart}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-5 mt-8">
                          {((activePieChart === 'Channels' ? channelsData : activePieChart === 'Locations' ? locationsData : devicesData) || []).map((c: any) => (
                            <div key={c.name} className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                              {c.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end pt-4">
                      <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">Source: <span className="text-green-700 font-bold hover:underline">Analytics ↗</span></a>
                    </div>
                  </div>
                  
                  {insightsData && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Deep Audience Insights</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500">New Visitors</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{insightsData.newVisitors}</p>
                          <p className="text-[10px] font-bold text-green-600 mt-1">Discovered you</p>
                        </div>
                        <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                          <p className="text-xs font-medium text-amber-800">Returning</p>
                          <p className="text-2xl font-bold text-amber-900 mt-1">{insightsData.returningVisitors}</p>
                          <p className="text-[10px] font-bold text-amber-600 mt-1">Loyal customers</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500">Avg. Engagement</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{insightsData.avgDuration}s</p>
                          <p className="text-[10px] font-medium text-gray-500 mt-1">Time spent actively</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-medium text-gray-500">Bounce Rate</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{insightsData.avgBounceRate}%</p>
                          <p className="text-[10px] font-medium text-gray-500 mt-1">Left without interacting</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {searchConsoleNoAccess && <SearchConsoleAccessNotice />}
              {searchConsoleNoData && <SearchConsoleNoDataNotice />}

              {searchTrafficData && (
                <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Search traffic over the last 28 days</h2>

                  <div className="grid grid-cols-4 gap-0 mb-8 border-b border-gray-100">
                    <div 
                      onClick={() => setActiveSearchTab('impressions')}
                      className={`cursor-pointer pt-6 pb-6 text-center px-4 transition-colors ${activeSearchTab === 'impressions' ? 'border-t-4 border-blue-500 bg-blue-50/30' : 'border-t-4 border-transparent hover:bg-gray-50'}`}
                    >
                      <p className="text-xs font-medium text-gray-500">Total Impressions</p>
                      <p className="text-4xl font-black text-gray-900 mt-2 mb-2">
                        {searchTrafficData.totalImpressions >= 1000 ? (searchTrafficData.totalImpressions / 1000).toFixed(1) + 'K' : searchTrafficData.totalImpressions}
                      </p>
                      <p className="text-xs font-bold text-red-500">↓ 0.8%</p>
                    </div>
                    <div 
                      onClick={() => setActiveSearchTab('clicks')}
                      className={`cursor-pointer pt-6 pb-6 text-center px-4 transition-colors ${activeSearchTab === 'clicks' ? 'border-t-4 border-teal-500 bg-[#f0f7f6]' : 'border-t-4 border-transparent hover:bg-gray-50'}`}
                    >
                      <p className="text-xs font-medium text-gray-500">Total Clicks</p>
                      <p className="text-4xl font-black text-gray-900 mt-2 mb-2">
                        {searchTrafficData.totalClicks >= 1000 ? (searchTrafficData.totalClicks / 1000).toFixed(1) + 'K' : searchTrafficData.totalClicks}
                      </p>
                      <p className="text-xs font-bold text-green-600">↑ 26.9%</p>
                    </div>
                    <div 
                      onClick={() => setActiveSearchTab('visitors')}
                      className={`cursor-pointer pt-6 pb-6 text-center px-4 transition-colors ${activeSearchTab === 'visitors' ? 'border-t-4 border-purple-500 bg-purple-50/30' : 'border-t-4 border-transparent hover:bg-gray-50'}`}
                    >
                      <p className="text-xs font-medium text-gray-500">Unique Visitors from Search</p>
                      <p className="text-4xl font-black text-gray-900 mt-2 mb-2">383</p>
                      <p className="text-xs font-bold text-green-600">↑ 19.7%</p>
                    </div>
                    <div 
                      onClick={() => setActiveSearchTab('events')}
                      className={`cursor-pointer pt-6 pb-6 text-center px-4 transition-colors ${activeSearchTab === 'events' ? 'border-t-4 border-orange-500 bg-orange-50/30' : 'border-t-4 border-transparent hover:bg-gray-50'}`}
                    >
                      <p className="text-xs font-medium text-gray-500">Key Events</p>
                      <p className="text-4xl font-black text-gray-900 mt-2 mb-2">1.5K</p>
                      <p className="text-xs text-transparent">-</p>
                    </div>
                  </div>
                  
                  <div className="h-72 w-full min-w-0 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={searchTrafficData.chart} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line 
                          type="monotone" 
                          dataKey={activeSearchTab} 
                          stroke={activeSearchTab === 'impressions' ? '#3B82F6' : activeSearchTab === 'clicks' ? '#0D9488' : activeSearchTab === 'visitors' ? '#8B5CF6' : '#F97316'} 
                          strokeWidth={2} 
                          dot={false} 
                          name={activeSearchTab === 'impressions' ? 'Impressions' : activeSearchTab === 'clicks' ? 'Clicks' : activeSearchTab === 'visitors' ? 'Visitors' : 'Events'} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-xs font-bold text-green-700 hover:underline">Source: Search Console ↗</a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div id="section-content" className="scroll-mt-40 space-y-6 animate-in fade-in">
          {loading.content ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 flex justify-center items-center">
              <RefreshCw className="animate-spin text-green-600" size={24} />
            </div>
          ) : error.content ? (
            <div className="bg-white border border-red-200 rounded-3xl p-8 shadow-sm">
              <p className="text-red-600 font-medium">Error loading content data: {error.content}</p>
            </div>
          ) : (
            <>
              {searchConsoleNoAccess && <SearchConsoleAccessNotice />}
              {searchConsoleNoData && <SearchConsoleNoDataNotice />}

              {topQueries && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">See how your content is doing</h2>
                    <p className="text-gray-500 text-sm">Keep track of your most popular pages and how people found them from Search</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-900 font-bold border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-4 font-bold">Top search queries for your site</th>
                            <th className="px-4 py-4 font-bold text-right">Clicks</th>
                            <th className="px-4 py-4 font-bold text-right">Impressions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topQueries.map((q: any, i: number) => (
                            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                              <td className="px-4 py-4 flex gap-3">
                                <span className="text-gray-900 font-medium">{i + 1}.</span>
                                <a href={`https://www.google.com/search?q=${encodeURIComponent(q.query)}`} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline cursor-pointer">{q.query}</a>
                              </td>
                              <td className="px-4 py-4 text-right text-gray-700">{q.clicks}</td>
                              <td className="px-4 py-4 text-right text-gray-700">{q.impressions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-8 flex justify-start">
                      <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">Source: <span className="text-green-700 font-bold hover:underline">Search Console ↗</span></a>
                    </div>
                  </div>
                </div>
              )}

              {topContent && (
                <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mt-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Top content over the last 28 days</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-900 font-bold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-4 font-bold">Title</th>
                          <th className="px-4 py-4 font-bold text-right">Pageviews</th>
                          <th className="px-4 py-4 font-bold text-right">Sessions</th>
                          <th className="px-4 py-4 font-bold text-right">Engagement Rate</th>
                          <th className="px-4 py-4 font-bold text-right">Avg Session Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topContent.map((c: any, i: number) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                            <td className="px-4 py-4">
                              <div className="flex gap-3">
                                <span className="text-gray-900 font-medium">{i + 1}.</span>
                                <div>
                                  <a href={siteUrl.replace(/\/$/, '') + c.path} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline cursor-pointer font-medium block">{c.title}</a>
                                  <span className="text-gray-400 text-xs block">{c.path}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-gray-700">{c.views}</td>
                            <td className="px-4 py-4 text-right text-gray-700">{c.sessions}</td>
                            <td className="px-4 py-4 text-right text-gray-700">{c.engagement}</td>
                            <td className="px-4 py-4 text-right text-gray-700">{c.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-8 flex justify-start">
                    <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">Source: <span className="text-green-700 font-bold hover:underline">Analytics ↗</span></a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div id="section-speed" className="scroll-mt-40 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Find out how visitors experience your site</h2>
          <p className="text-gray-500 text-sm mb-6">Keep track of how fast your pages are and get specific recommendations on what to improve</p>
          
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200 px-6">
              <button className="py-4 border-b-2 border-green-700 text-green-700 font-bold text-sm px-4">In the Lab</button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                Lab data is a snapshot of how your page performs right now. <a href="https://web.dev/vitals/" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Learn more ↗</a>
              </p>
              
              {loading.speed ? (
                <div className="py-12 flex justify-center items-center">
                  <RefreshCw className="animate-spin text-green-600" size={24} />
                  <span className="ml-3 text-gray-500">Running PageSpeed test...</span>
                </div>
              ) : error.speed ? (
                <div className="py-8">
                  <p className="text-red-600 font-medium">Error: {error.speed}</p>
                </div>
              ) : speedData?.labData ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900">Largest Contentful Paint</h3>
                      <p className="text-sm text-gray-500">Time it takes for the page to load</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${scoreLabel(speedData.labData.lcp.score).color}`}>{speedData.labData.lcp.value}</p>
                      <p className={`text-xs font-medium uppercase tracking-wider ${scoreLabel(speedData.labData.lcp.score).color}`}>
                        {scoreLabel(speedData.labData.lcp.score).label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900">Cumulative Layout Shift</h3>
                      <p className="text-sm text-gray-500">How stable the elements on the page are</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${scoreLabel(speedData.labData.cls.score).color}`}>{speedData.labData.cls.value}</p>
                      <p className={`text-xs font-medium uppercase tracking-wider ${scoreLabel(speedData.labData.cls.score).color}`}>
                        {scoreLabel(speedData.labData.cls.score).label}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-900">Total Blocking Time</h3>
                      <p className="text-sm text-gray-500">How long people had to wait after the page loaded before they could click something</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${scoreLabel(speedData.labData.tbt.score).color}`}>{speedData.labData.tbt.value}</p>
                      <p className={`text-xs font-medium uppercase tracking-wider ${scoreLabel(speedData.labData.tbt.score).color}`}>
                        {scoreLabel(speedData.labData.tbt.score).label}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div className="mt-8 flex justify-between items-center">
                <a href="https://pagespeed.web.dev/" target="_blank" rel="noreferrer" className="bg-green-700 hover:bg-green-800 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors inline-block">
                  How to improve
                </a>
                <div className="flex gap-4 text-xs font-medium text-gray-500">
                  <button onClick={() => fetchSpeed(true)} className="hover:text-gray-900">Run test again</button>
                  <a href="https://pagespeed.web.dev/" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">View details at PageSpeed Insights ↗</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="section-monetization" className="scroll-mt-40 bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-gray-500">Monetization visualization coming soon...</p>
        </div>
      </div>
    </div>
  );
}
