import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define authentication paths and public paths
  const authPaths = ['/sign-in', '/sign-up', '/forgot-password'];
  const publicPaths = [...authPaths, '/errors/503'];
  const isAuthPath = authPaths.includes(pathname);
  const isPublicPath = publicPaths.includes(pathname);

  // Get the user session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect logged-in users away from auth pages to dashboard/home
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect non-logged in users to sign-in for protected routes
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Maintenance mode logic remains the same
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    if (pathname === '/errors/503') {
      return NextResponse.next();
    }

    // Pengecualian untuk asset yang mungkin dibutuhkan halaman maintenance
    if (
      pathname.startsWith('/_next/') ||
      pathname.includes('/favicon.ico') ||
      pathname.startsWith('/images/')
    ) {
      return NextResponse.next();
    }

    // Redirect ke halaman 503
    const url = request.nextUrl.clone();
    url.pathname = '/errors/503';

    // Tambahkan header yang tepat
    const response = NextResponse.rewrite(url);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Retry-After', '3600'); // Coba lagi setelah 1 jam
    return response;
  }

  return NextResponse.next();
}

// Tentukan pada rute mana middleware ini berjalan
export const config = {
  runtime: 'nodejs',
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
