import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdmin } from '@/lib/admin-guard';
import { getAuthenticatedClient } from '@/lib/google-oauth';
import { prisma } from '@/lib/prisma';

// Step 1: ask Google for a META verification token, save it so it renders live as
// <meta name="google-site-verification"> on every page (see layout.tsx), ready for step 2 to confirm.
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
    const { data } = await siteVerification.webResource.getToken({
      requestBody: {
        verificationMethod: 'META',
        site: { type: 'SITE', identifier: siteUrl },
      },
    });

    const token = data.token;
    if (!token) {
      return NextResponse.json({ error: 'Google did not return a verification token.' }, { status: 500 });
    }

    await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: { googleSearchConsoleVerification: token },
      create: { id: 'singleton', googleSearchConsoleVerification: token },
    });

    return NextResponse.json({ token });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to start verification' }, { status: 500 });
  }
}
