import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';

// Step 2: Google re-fetches the page and checks for the meta tag saved in step 1, then adds this
// account as a verified owner. Also adds the site to Search Console so it starts showing up there.
export async function POST(req: NextRequest) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: 'Google account not connected yet.' }, { status: 400 });
  }

  const { siteUrl } = await req.json();
  if (!siteUrl) {
    return NextResponse.json({ error: 'siteUrl is required' }, { status: 400 });
  }

  try {
    const siteVerification = google.siteVerification({ version: 'v1', auth });
    await siteVerification.webResource.insert({
      verificationMethod: 'META',
      requestBody: { site: { type: 'SITE', identifier: siteUrl } },
    });

    // Best-effort: register the now-verified property with Search Console too.
    // Not fatal if it's already added or this specific call fails.
    try {
      const searchConsole = google.searchconsole({ version: 'v1', auth });
      await searchConsole.sites.add({ siteUrl });
    } catch {
      // Ignore — ownership verification above is what actually matters.
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err.message?.includes('Not able to verify')
      ? 'Google could not find the verification tag on your homepage yet — it can take a few minutes to go live. Wait a moment and try again.'
      : err.message || 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
