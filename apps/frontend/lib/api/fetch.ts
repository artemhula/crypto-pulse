const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const buildUrl = (
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
): URL => {
  const url = new URL(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  return url;
};

const buildBody = (body: unknown): BodyInit | undefined => {
  if (body === undefined || body === null) return undefined;
  if (typeof body === 'string' || body instanceof FormData) return body;
  return JSON.stringify(body);
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { query, body, headers, ...rest } = options;
  const isServer = typeof window === 'undefined';
  const url = buildUrl(path, query);

  const finalHeaders = new Headers(headers);
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (isServer) {
    const { cookies } = await import('next/headers');
    finalHeaders.set('Cookie', (await cookies()).toString());
  }

  const send = () =>
    fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: buildBody(body),
      credentials: isServer ? undefined : 'include',
      cache: 'no-store',
    });

  const res = await send();
  if (res.status === 401 && !isServer) {
    window.location.reload();
  }

  if (!res.ok) {
    throw new ApiError(
      (await res.text()) || `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
