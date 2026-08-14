'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import IntegrationsDashboard from './IntegrationsDashboard';
import IntegrationsSettings from './IntegrationsSettings';

export default function IntegrationsTabs({
  initialData,
  connection,
  credentials,
  oauthConfigured,
  pageSpeedConfigured,
  adsDeveloperTokenConfigured,
  defaultSiteUrl,
}: {
  initialData: any;
  connection: any;
  credentials: any;
  oauthConfigured: boolean;
  pageSpeedConfigured: boolean;
  adsDeveloperTokenConfigured: boolean;
  defaultSiteUrl: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as 'dashboard' | 'configuration' | 'settings' | null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (tabParam === 'configuration' || tabParam === 'settings') {
      scrollToSection('configuration');
    } else if (tabParam === 'dashboard') {
      scrollToSection('dashboard');
    }
  }, [tabParam]);

  const handleTabChange = (newTab: 'dashboard' | 'configuration') => {
    router.push(`/admin/integrations?tab=${newTab}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 font-body">
      <div className="mb-8 flex gap-6 border-b border-gray-200 sticky top-4 bg-gray-50 z-10 pt-4 px-2 -mx-2">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`pb-3 text-sm font-bold transition-colors ${
            tabParam !== 'configuration' && tabParam !== 'settings'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleTabChange('configuration')}
          className={`pb-3 text-sm font-bold transition-colors ${
            tabParam === 'configuration' || tabParam === 'settings'
              ? 'border-b-2 border-green-600 text-green-700'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Configuration
        </button>
      </div>

      <div className="space-y-16">
        <div id="dashboard" className="scroll-mt-24">
          <IntegrationsDashboard siteUrl={defaultSiteUrl} />
        </div>

        <div id="configuration" className="scroll-mt-24">
          <IntegrationsSettings
            initialData={initialData}
            connection={connection}
            credentials={credentials}
            oauthConfigured={oauthConfigured}
            pageSpeedConfigured={pageSpeedConfigured}
            adsDeveloperTokenConfigured={adsDeveloperTokenConfigured}
            defaultSiteUrl={defaultSiteUrl}
          />
        </div>
      </div>
    </div>
  );
}
