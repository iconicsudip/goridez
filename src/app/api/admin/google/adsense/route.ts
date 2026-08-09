import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';

// Lists the AdSense accounts (and their ca-pub-XXXX publisher IDs) visible to the connected Google account.
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected yet.' }, { status: 400 });
  }

  try {
    const adsense = google.adsense({ version: 'v2', auth });
    const { data } = await adsense.accounts.list();

    const accounts = (data.accounts || []).map((acc) => {
      // Resource name looks like "accounts/pub-1234567890123456"
      const publisherId = acc.name?.split('/')[1] || '';
      return { publisherId, displayName: acc.displayName || publisherId };
    });

    return NextResponse.json({ accounts });
  } catch (err: any) {
    const message = err.message?.includes('403')
      ? 'This Google account has no AdSense account, or AdSense access hasn’t been granted yet.'
      : err.message || 'Failed to list AdSense accounts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
