import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    const { pathname } = request.nextUrl;

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
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
