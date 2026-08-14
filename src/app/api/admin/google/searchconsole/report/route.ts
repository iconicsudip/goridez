import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';

export async function GET(req: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected.' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'traffic'; // 'traffic', 'queries'
  const siteUrl = searchParams.get('siteUrl');

  if (!siteUrl) {
    return NextResponse.json({ error: 'siteUrl parameter is required' }, { status: 400 });
  }

  // Format dates: YYYY-MM-DD
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);
  const startDateStr = startDate.toISOString().split('T')[0];

  try {
    const webmasters = google.webmasters({ version: 'v3', auth });

    // Find the correct property URL that matches this domain
    const sitesRes = await webmasters.sites.list();
    const verifiedSites = sitesRes.data.siteEntry || [];
    
    // Try to find an exact match, or a domain match
    const targetDomain = new URL(siteUrl).hostname.replace('www.', '');
    let matchedSiteUrl = siteUrl;

    const match = verifiedSites.find(site => {
      const sUrl = site.siteUrl || '';
      return sUrl === siteUrl || 
             sUrl === `sc-domain:${targetDomain}` || 
             sUrl.includes(targetDomain);
    });

    if (match && match.siteUrl) {
      matchedSiteUrl = match.siteUrl;
    } else if (verifiedSites.length > 0) {
      // Fallback to the first available property if no exact match is found
      matchedSiteUrl = verifiedSites[0].siteUrl || siteUrl;
    }

    if (type === 'traffic') {
      const response = await webmasters.searchanalytics.query({
        siteUrl: matchedSiteUrl,
        requestBody: {
          startDate: startDateStr,
          endDate,
          dimensions: ['date'],
        }
      });
      return NextResponse.json(response.data);
    } 
    else if (type === 'queries') {
      const response = await webmasters.searchanalytics.query({
        siteUrl: matchedSiteUrl,
        requestBody: {
          startDate: startDateStr,
          endDate,
          dimensions: ['query'],
          rowLimit: 10
        }
      });
      return NextResponse.json(response.data);
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
  } catch (err: any) {
    console.error('Search Console API Error:', err);
    
    // The connected Google account has no Search Console access to this property (a per-property
    // grant made in Search Console itself, separate from the OAuth connection). Flag it distinctly
    // so the dashboard can tell "no access yet" apart from "genuinely zero search traffic" —
    // returning bare {rows:[]} here would silently render as 0 impressions/clicks, which reads as
    // real (alarming) data instead of a permissions gap.
    if (err.code === 403 || err.status === 403) {
      return NextResponse.json({ rows: [], totals: [], noAccess: true });
    }
    
    return NextResponse.json({ error: err.message || 'Failed to fetch Search Console report' }, { status: 500 });
  }
}
