import { NextResponse, type NextRequest } from 'next/server';

const LOGIN = '/login';
const ACCESS = 'access_token';
const REFRESH = 'refresh_token';
const AUTH = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

/** Renew a little early so a render never races the expiry boundary. */
const SKEW_MS = 60_000;

/** Reads `exp` without verifying. Not a security boundary — the API is. */
const expiresAt = (jwt: string): number => {
  const [, payload] = jwt.split('.');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64)).exp * 1000;
};

export async function proxy(request: NextRequest) {
  const access = request.cookies.get(ACCESS)?.value;
  const refresh = request.cookies.get(REFRESH)?.value;
  const onLogin = request.nextUrl.pathname === LOGIN;

  const valid = access && Date.now() < expiresAt(access) - SKEW_MS;
  if (valid) {
    return onLogin
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next();
  }

  // Renewal lives here because this is the only point in the request that can
  // still write cookies for the render that is about to read them. It only
  // runs when the access token is missing or nearly expired, so the fast path
  // above stays a pure cookie read.
  const res = refresh
    ? await fetch(`${AUTH}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: request.headers.get('cookie') ?? '' },
        cache: 'no-store',
      })
    : null;

  const renewed = res?.ok ? ((await res.json()).accessToken as string) : null;

  let response: NextResponse;
  if (renewed) {
    response = onLogin
      ? NextResponse.redirect(new URL('/', request.url))
      : NextResponse.next({
          request: {
            headers: new Headers({
              ...Object.fromEntries(request.headers),
              // Hand the rotated token to the render that follows.
              Cookie: [
                ...request.cookies
                  .getAll()
                  .filter((cookie) => cookie.name !== ACCESS)
                  .map((cookie) => `${cookie.name}=${cookie.value}`),
                `${ACCESS}=${renewed}`,
              ].join('; '),
            }),
          },
        });
  } else {
    response = onLogin
      ? NextResponse.next()
      : NextResponse.redirect(new URL(LOGIN, request.url));
  }

  // Replayed verbatim, including on failure: the auth service clears the
  // cookies when it rejects a session, and dropping those headers would leave
  // the browser retrying a dead refresh token on every request.
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
