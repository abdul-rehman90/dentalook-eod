import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname, origin } = req.nextUrl;
  const token = req.cookies.get('auth-token')?.value;

  if (token && ['/login'].includes(pathname)) {
    return NextResponse.redirect(`${origin}/clinics-reporting`);
  }

  // Redirect to login if not authenticated and trying to access protected pages
  if (!token && !['/login'].includes(pathname)) {
    return NextResponse.redirect(`${origin}/login`);
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
