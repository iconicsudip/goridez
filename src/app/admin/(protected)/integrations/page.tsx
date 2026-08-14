import { prisma } from '@/lib/prisma';
import IntegrationsTabs from '@/components/admin/integrations/IntegrationsTabs';
import { getConnectionStatus } from '@/lib/google-oauth';
import { getGoogleCredentials } from '@/lib/google-credentials';

export const dynamic = 'force-dynamic';

export default async function AdminIntegrationsPage() {
  const [siteSettings, connection, credentials] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    getConnectionStatus(),
    getGoogleCredentials(),
  ]);

  const defaultSiteUrl = (process.env.NEXTAUTH_URL || 'https://goridez.com').replace(/\/$/, '') + '/';

  return (
    <IntegrationsTabs
      initialData={siteSettings}
      connection={connection}
      credentials={credentials}
      oauthConfigured={!!credentials.clientId && !!credentials.clientSecret}
      pageSpeedConfigured={!!credentials.pagespeedApiKey}
      adsDeveloperTokenConfigured={!!credentials.adsDeveloperToken}
      defaultSiteUrl={defaultSiteUrl}
    />
  );
}
