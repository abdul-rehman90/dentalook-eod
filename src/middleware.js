import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth-token')?.value;

  if (token && ['/login'].includes(pathname)) {
    return NextResponse.redirect(new URL('/clinics-reporting', req.url));
  }

  // Redirect to login if not authenticated and trying to access protected pages
  if (!token && !['/login'].includes(pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/clinics-reporting',
    '/submission/:path*',
    '/review/:path*'
  ]
};
