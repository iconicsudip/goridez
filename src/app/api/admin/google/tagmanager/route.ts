import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';

// Lists the GTM containers (and their public GTM-XXXX IDs) visible to the connected Google account.
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected yet.' }, { status: 400 });
  }

  try {
    const tagmanager = google.tagmanager({ version: 'v2', auth });
    const { data: accountsData } = await tagmanager.accounts.list();

    const containers: { publicId: string; name: string; accountName: string }[] = [];

    for (const account of accountsData.account || []) {
      if (!account.path) continue;
      const { data: containersData } = await tagmanager.accounts.containers.list({ parent: account.path });
      for (const container of containersData.container || []) {
        if (!container.publicId) continue;
        containers.push({
          publicId: container.publicId,
          name: container.name || 'Untitled container',
          accountName: account.name || '',
        });
      }
    }

    return NextResponse.json({ containers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list Tag Manager containers' }, { status: 500 });
  }
}
