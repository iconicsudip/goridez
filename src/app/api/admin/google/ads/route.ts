import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';
import { getGoogleCredentials } from '@/lib/google-credentials';

// Google Ads isn't part of the `googleapis` discovery client — it's called directly over REST.
// Listing accessible accounts additionally requires an approved Developer Token from the
// Google Ads API Center (a separate, manual Google review — see AGENTS notes to the user).
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { adsDeveloperToken: developerToken } = await getGoogleCredentials();
  if (!developerToken) {
    return NextResponse.json(
      { error: 'Google Ads Developer Token not configured yet. Apply for one in the Google Ads API Center, then add it on the Google Integrations admin page.' },
      { status: 501 }
    );
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected yet.' }, { status: 400 });
  }

  try {
    const { token } = await auth.getAccessToken();
    if (!token) throw new Error('Could not obtain an access token for Google Ads.');

    const res = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
      headers: {
        Authorization: `Bearer ${token}`,
        'developer-token': developerToken,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Ads API error (${res.status}): ${body}`);
    }

    const data = await res.json();
    const customers = (data.resourceNames || []).map((rn: string) => rn.split('/')[1]).filter(Boolean);

    return NextResponse.json({ customers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list Google Ads accounts' }, { status: 500 });
  }
}
