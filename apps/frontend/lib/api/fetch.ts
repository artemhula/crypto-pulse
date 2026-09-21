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

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { query, body, headers, ...rest } = options;
  const isServer = typeof window === 'undefined';

  const url = new URL(
    `${API_URL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`,
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }

  const finalHeaders = new Headers(headers);
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (isServer) {
    const { cookies } = await import('next/headers');
    finalHeaders.set('Cookie', (await cookies()).toString());
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body:
      typeof body === 'string' || body instanceof FormData
        ? body
        : body === undefined || body === null
          ? undefined
          : JSON.stringify(body),
    credentials: isServer ? undefined : 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new ApiError(
      (await res.text()) || `Request failed with status ${res.status}`,
      res.status,
    );
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
