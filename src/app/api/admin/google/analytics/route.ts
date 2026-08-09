import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';

// Lists the GA4 properties (and their web Measurement IDs) visible to the connected Google account.
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected yet.' }, { status: 400 });
  }

  try {
    const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth });
    const { data } = await analyticsAdmin.accountSummaries.list({ pageSize: 200 });

    const properties: { propertyId: string; displayName: string; measurementId: string; accountName: string }[] = [];

    for (const account of data.accountSummaries || []) {
      for (const prop of account.propertySummaries || []) {
        if (!prop.property) continue;
        let measurementId = '';
        try {
          const { data: streams } = await analyticsAdmin.properties.dataStreams.list({ parent: prop.property });
          const webStream = streams.dataStreams?.find((s) => s.webStreamData);
          measurementId = webStream?.webStreamData?.measurementId || '';
        } catch {
          // No accessible data streams on this property — still list it, just without a measurement ID.
        }

        properties.push({
          propertyId: prop.property.split('/')[1] || '',
          displayName: prop.displayName || 'Untitled property',
          measurementId,
          accountName: account.displayName || '',
        });
      }
    }

    return NextResponse.json({ properties });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list Analytics properties' }, { status: 500 });
  }
}
