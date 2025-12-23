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

  const publicAuthRoutes = ['/login', '/forgot-password', '/reset-password'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicAuthRoute = publicAuthRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Redirect to login if not authenticated and trying to access protected pages
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Redirect authenticated users away from public auth routes
  if (token && role && isPublicAuthRoute) {
    return NextResponse.redirect(
      `${origin}${role === 'AC' ? '/collection-tracker' : '/clinics-reporting'}`
    );
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
    '/forgot-password',
    '/reset-password',
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
