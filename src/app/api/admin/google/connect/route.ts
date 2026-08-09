import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { randomBytes } from 'crypto';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { buildConsentUrl, GOOGLE_SCOPES, GoogleModuleGroup } from '@/lib/google-oauth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const requested = (req.nextUrl.searchParams.get('groups') || 'core')
    .split(',')
    .map((g) => g.trim()) as GoogleModuleGroup[];
  const validGroups = requested.filter((g) => g in GOOGLE_SCOPES);

  if (validGroups.length === 0) {
    return NextResponse.redirect(new URL('/admin/integrations?error=invalid_module', req.url));
  }

  let consentUrl: string;
  try {
    const state = randomBytes(16).toString('hex');
    const cookieStore = await cookies();
    cookieStore.set('google_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });
    consentUrl = await buildConsentUrl(validGroups, state);
  } catch (err: any) {
    const url = new URL('/admin/integrations', req.url);
    url.searchParams.set('error', err.message || 'oauth_not_configured');
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(consentUrl);
}
