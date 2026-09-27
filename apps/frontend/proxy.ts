import { NextResponse, type NextRequest } from 'next/server';

const LOGIN = '/login';
const ACCESS = 'access_token';
const REFRESH = 'refresh_token';
const AUTH = process.env.NEXT_PUBLIC_API_URL ?? '';

const SKEW_MS = 60_000;

const expiresAt = (token: string): number | null => {
  try {
    const [, payload] = token.split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)).exp * 1000;
  } catch {
    return null;
  }
};

const headersWithAccessToken = (
  request: NextRequest,
  accessToken: string,
): Headers => {
  const headers = new Headers(request.headers);

  headers.set(
    'Cookie',
    [
      ...request.cookies
        .getAll()
        .filter((cookie) => cookie.name !== ACCESS)
        .map((cookie) => `${cookie.name}=${cookie.value}`),
      `${ACCESS}=${accessToken}`,
    ].join('; '),
  );

  return headers;
};

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS)?.value;
  const refresh = request.cookies.get(REFRESH)?.value;
  const onLogin = request.nextUrl.pathname === LOGIN;

  const expiry = access ? expiresAt(access) : null;
  if (expiry !== null && Date.now() < expiry - SKEW_MS) {
    return onLogin
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next();
  }

  const res = refresh
    ? await fetch(`${AUTH}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: request.headers.get('cookie') ?? '' },
        cache: 'no-store',
      }).catch(() => null)
    : null;

  const renewed = res?.ok ? ((await res.json()).accessToken as string) : null;

  let response: NextResponse;
  if (renewed) {
    response = onLogin
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next({
          request: { headers: headersWithAccessToken(request, renewed) },
        });
  } else {
    response = onLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL(LOGIN, request.url));
  }

  for (const cookie of res?.headers.getSetCookie() ?? []) {
    response.headers.append('Set-Cookie', cookie);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
