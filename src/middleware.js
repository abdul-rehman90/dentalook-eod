import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname, origin } = req.nextUrl;
  const token = req.cookies.get('auth-token')?.value;
  const role = req.cookies.get('role')?.value;

  const protectedRoutes = [
    '/review',
    '/calendar',
    '/dashboard',
    '/submission',
    '/monthly-schedule',
    '/clinics-reporting',
    '/clinic-adjustment',
    '/collection-tracker'
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (token && pathname === '/login') {
    return NextResponse.redirect(
      `${origin}${role === 'AC' ? '/collection-tracker' : '/clinics-reporting'}`
    );
  }

  // Redirect to login if not authenticated and trying to access protected pages
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // AC role restrictions - only allow collection-tracker
  if (
    token &&
    role === 'AC' &&
    isProtectedRoute &&
    !pathname.startsWith('/collection-tracker')
  ) {
    return NextResponse.redirect(`${origin}/collection-tracker`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/calendar',
    '/dashboard',
    '/review/:path*',
    '/monthly-schedule',
    '/clinics-reporting',
    '/clinic-adjustment',
    '/submission/:path*',
    '/collection-tracker'
  ]
};
