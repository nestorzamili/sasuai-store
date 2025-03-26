import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const authPaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
  ];
  const publicPaths = [...authPaths, '/errors/503'];
  const isAuthPath = authPaths.includes(pathname);
  const isPublicPath = publicPaths.includes(pathname);

  const sessionCookie = getSessionCookie(request, {
    cookieName: 'session_token',
    cookiePrefix: 'better-auth',
    useSecureCookies: process.env.NODE_ENV === 'production',
  });

  if (sessionCookie && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    if (pathname === '/errors/503') {
      return NextResponse.next();
    }

    if (
      pathname.startsWith('/_next/') ||
      pathname.includes('/favicon.ico') ||
      pathname.startsWith('/images/')
    ) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = '/errors/503';

    const response = NextResponse.rewrite(url);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Retry-After', '3600');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
