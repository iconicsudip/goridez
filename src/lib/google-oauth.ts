import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getGoogleCredentials } from '@/lib/google-credentials';

// --- Scope catalogue ------------------------------------------------------
// Each admin module requests only the scopes it needs. "Connect Google
// Account" (module = 'core') covers the three read-only modules that don't
// touch money or ad accounts; AdSense and Ads are opt-in add-ons requested
// incrementally on top of the same connection (Google keeps prior grants
// when `include_granted_scopes` is used).
export const GOOGLE_SCOPES = {
  core: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/siteverification',
    'https://www.googleapis.com/auth/tagmanager.readonly',
  ],
  adsense: ['https://www.googleapis.com/auth/adsense.readonly'],
  ads: ['https://www.googleapis.com/auth/adwords'],
} as const;

// Always requested, regardless of which module group(s) triggered Connect — needed so
// `exchangeCodeAndStore` can look up *which* Google account just connected (userinfo.get()).
const IDENTITY_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export type GoogleModuleGroup = keyof typeof GOOGLE_SCOPES;

function getRedirectUri() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/admin/google/callback`;
}

export async function getOAuthClient() {
  const { clientId, clientSecret } = await getGoogleCredentials();

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth Client ID / Secret are not configured yet — set them on the Google Integrations admin page.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, getRedirectUri());
}

export async function buildConsentUrl(groups: GoogleModuleGroup[], state: string) {
  const oauth2Client = await getOAuthClient();
  const scopes = Array.from(new Set([...IDENTITY_SCOPES, ...groups.flatMap((g) => GOOGLE_SCOPES[g])]));

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // always return a refresh_token, even on re-connect
    include_granted_scopes: true,
    scope: scopes,
    state,
  });
}

/** Exchanges an OAuth `code` for tokens and persists/merges them onto the singleton connection row. */
export async function exchangeCodeAndStore(code: string) {
  const oauth2Client = await getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();

  const existing = await prisma.googleOAuthConnection.findUnique({ where: { id: 'singleton' } });

  // Google only returns a refresh_token on the very first consent (or when
  // prompt=consent forces re-issue). Keep the previous one if this response omitted it.
  const refreshToken = tokens.refresh_token || existing?.refreshToken || '';
  const mergedScope = Array.from(
    new Set([...(existing?.scope || '').split(' ').filter(Boolean), ...(tokens.scope || '').split(' ').filter(Boolean)])
  ).join(' ');

  await prisma.googleOAuthConnection.upsert({
    where: { id: 'singleton' },
    update: {
      connectedEmail: profile.email || existing?.connectedEmail || '',
      accessToken: tokens.access_token || '',
      refreshToken,
      scope: mergedScope,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
    create: {
      id: 'singleton',
      connectedEmail: profile.email || '',
      accessToken: tokens.access_token || '',
      refreshToken,
      scope: mergedScope,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    },
  });

  return profile.email || '';
}

/** Returns an OAuth2Client pre-loaded with the stored connection, or null if never connected. */
export async function getAuthenticatedClient() {
  const conn = await prisma.googleOAuthConnection.findUnique({ where: { id: 'singleton' } });
  if (!conn || !conn.refreshToken) return null;

  const oauth2Client = await getOAuthClient();
  oauth2Client.setCredentials({
    access_token: conn.accessToken || undefined,
    refresh_token: conn.refreshToken,
    expiry_date: conn.expiryDate ? conn.expiryDate.getTime() : undefined,
  });

  // Persist rotated access tokens so we're not re-hitting the refresh endpoint on every call.
  oauth2Client.on('tokens', (tokens) => {
    if (!tokens.access_token) return;
    prisma.googleOAuthConnection
      .update({
        where: { id: 'singleton' },
        data: {
          accessToken: tokens.access_token,
          expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      })
      .catch(() => {});
  });

  return oauth2Client;
}

export async function getConnectionStatus() {
  const conn = await prisma.googleOAuthConnection.findUnique({ where: { id: 'singleton' } });
  if (!conn || !conn.refreshToken) {
    return { connected: false, email: '', scopes: [] as string[] };
  }
  return {
    connected: true,
    email: conn.connectedEmail,
    scopes: conn.scope.split(' ').filter(Boolean),
  };
}

export async function disconnectGoogle() {
  const conn = await prisma.googleOAuthConnection.findUnique({ where: { id: 'singleton' } });
  if (conn?.accessToken) {
    try {
      const oauth2Client = await getOAuthClient();
      await oauth2Client.revokeToken(conn.accessToken);
    } catch {
      // Token may already be invalid/expired on Google's side — ignore and clear locally regardless.
    }
  }
  await prisma.googleOAuthConnection.deleteMany({ where: { id: 'singleton' } });
}
