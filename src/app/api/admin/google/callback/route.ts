import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { exchangeCodeAndStore } from '@/lib/google-oauth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  const redirectTo = new URL('/admin/integrations', req.url);

  const error = req.nextUrl.searchParams.get('error');
  if (error) {
    redirectTo.searchParams.set('error', error);
    return NextResponse.redirect(redirectTo);
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('google_oauth_state')?.value;
  cookieStore.delete('google_oauth_state');

  if (!code || !state || !expectedState || state !== expectedState) {
    redirectTo.searchParams.set('error', 'invalid_state');
    return NextResponse.redirect(redirectTo);
  }

  try {
    await exchangeCodeAndStore(code);
    redirectTo.searchParams.set('connected', '1');
  } catch (err: any) {
    redirectTo.searchParams.set('error', err.message || 'token_exchange_failed');
  }

  return NextResponse.redirect(redirectTo);
}
