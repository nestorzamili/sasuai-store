import { NextRequest, NextResponse } from 'next/server';
import type { auth } from '@/lib/auth';
import { betterFetch } from '@better-fetch/fetch';

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth/verify-email')) {
    return NextResponse.next();
  }

  // Check if sign-up is disabled
  if (pathname === '/sign-up' && process.env.ENABLE_SIGNUP !== 'true') {
    return NextResponse.redirect(new URL('/errors/403', request.url));
  }

  const authPaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
  ];
  const publicPaths = [...authPaths, '/errors/503', '/errors/403'];
  const adminPaths = ['/users'];
  const isAdminPath = adminPaths.includes(pathname);
  const isAuthPath = authPaths.includes(pathname);
  const isPublicPath = publicPaths.includes(pathname);

  try {
    // Only run this in a browser environment (runtime) with a valid request
    const { data: session } = await betterFetch<Session>(
      '/api/auth/get-session',
      {
        baseURL:
          process.env.NODE_ENV === 'production'
            ? process.env.BETTER_AUTH_URL // Use the explicit URL from env in production
            : request.nextUrl.origin, // Use origin in development
        headers: {
          cookie: request.headers.get('cookie') || '',
        },
      },
    );

    if (session && isAuthPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (session && isAdminPath && session.user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/errors/403', request.url));
    }

    if (!session && !isPublicPath) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  } catch (error) {
    console.error('Session fetch error:', error);
    // If we can't verify the session, redirect to sign-in for protected routes
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
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
