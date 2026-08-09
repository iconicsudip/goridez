import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
  pagespeedApiKey: string;
  adsDeveloperToken: string;
}

// Google API credentials are managed from the admin Google Integrations page (stored on the
// SiteSettings singleton) so they can be rotated without a redeploy. The matching env vars
// (GOOGLE_OAUTH_CLIENT_ID, etc.) are kept as a fallback for the initial bootstrap / local dev.
// Cached briefly since this is read on every NextAuth request; `updateGoogleCredentials`
// busts the 'google-credentials' tag immediately on save.
export const getGoogleCredentials = unstable_cache(
  async (): Promise<GoogleCredentials> => {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    return {
      clientId: settings?.googleOAuthClientId || process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      clientSecret: settings?.googleOAuthClientSecret || process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      pagespeedApiKey: settings?.googlePagespeedApiKey || process.env.GOOGLE_PAGESPEED_API_KEY || '',
      adsDeveloperToken: settings?.googleAdsDeveloperToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    };
  },
  ['google-credentials'],
  { revalidate: 30, tags: ['google-credentials'] }
);
