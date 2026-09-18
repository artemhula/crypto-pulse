import { NextRequest, NextResponse } from 'next/server';

const loginRoute = '/login';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isLoginRoute = loginRoute === pathname;

  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isLoginRoute && !token) {
    const loginUrl = new URL(loginRoute, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
