import { NextRequest, NextResponse } from 'next/server';

const loginRoute = '/login';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isLoginRoute = loginRoute === pathname;

  if (isLoginRoute && !token) {
    const loginUrl = new URL(loginRoute, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
