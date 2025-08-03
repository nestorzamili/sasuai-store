import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const AUTH_PATHS = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
];
const PUBLIC_PATHS = [...AUTH_PATHS, '/errors/503', '/errors/403'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (process.env.MAINTENANCE_MODE === 'true' && pathname !== '/errors/503') {
    const url = request.nextUrl.clone();
    url.pathname = '/errors/503';
    const response = NextResponse.rewrite(url);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Retry-After', '3600');
    return response;
  }

  if (pathname === '/sign-up' && process.env.ENABLE_SIGNUP !== 'true') {
    return NextResponse.redirect(new URL('/errors/403', request.url));
  }

  const sessionCookie = getSessionCookie(request);
  const isAuthPath = AUTH_PATHS.includes(pathname);
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  if (sessionCookie && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!sessionCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)',
  ],
};
