import { NextRequest, NextResponse } from 'next/server';

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for NextAuth session cookie
    const sessionToken =
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // If a session token exists, let the request through.
    // The admin (protected)/layout.tsx does the ADMIN role check server-side.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
