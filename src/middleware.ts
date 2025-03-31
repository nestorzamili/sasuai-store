import { NextRequest, NextResponse } from 'next/server';
import type { auth } from '@/lib/auth';
import { betterFetch } from '@better-fetch/fetch';

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth/verify-email')) {
    return NextResponse.next();
  }

  const authPaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
  ];
  const publicPaths = [...authPaths, '/errors/503'];
  const adminPaths = ['/users'];
  const isAdminPath = adminPaths.includes(pathname);
  const isAuthPath = authPaths.includes(pathname);
  const isPublicPath = publicPaths.includes(pathname);

  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '', // Forward the cookies from the request
      },
    },
  );

  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (session && isAdminPath && session.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/errors/403', request.url));
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
