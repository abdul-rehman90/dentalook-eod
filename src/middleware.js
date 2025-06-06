import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('auth-token');
  // if (token) {
  //   return NextResponse.next();
  // }
  // return NextResponse.redirect(new URL('/login', req.url));
}

// export const config = {
//   matcher: ['/clinics-reporting', '/submission/:path*', '/review/:path*']
// };
