import { createHash } from 'node:crypto';
import { ACCESS_TOKEN_TYPE, REFRESH_TOKEN_TYPE } from './auth.constants';

export interface AccessTokenClaims {
  sub: string;
  email: string;
  typ: typeof ACCESS_TOKEN_TYPE;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenClaims {
  sub: string;
  typ: typeof REFRESH_TOKEN_TYPE;
  iat?: number;
  exp?: number;
}

const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const DURATION_PATTERN = /^(\d+)\s*(ms|s|m|h|d)?$/i;
export const parseDurationToMs = (value: string | number): number => {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`Invalid duration: ${value}`);
    }
    return Math.round(value * 1000);
  }

  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid duration: ${value}`);
  }

  return amount * UNIT_TO_MS[unit];
};

export const formatDuration = (ms: number): `${number}s` =>
  `${Math.floor(ms / 1000)}s` as `${number}s`;

export const isAccessTokenClaims = (
  payload: unknown,
): payload is AccessTokenClaims => {
  if (!payload || typeof payload !== 'object') return false;
  const claims = payload as Partial<AccessTokenClaims>;
  return (
    typeof claims.sub === 'string' &&
    claims.typ === ACCESS_TOKEN_TYPE &&
    typeof claims.exp === 'number'
  );
};

export const isRefreshTokenClaims = (
  payload: unknown,
): payload is RefreshTokenClaims => {
  if (!payload || typeof payload !== 'object') return false;
  const claims = payload as Partial<RefreshTokenClaims>;
  return (
    typeof claims.sub === 'string' &&
    claims.typ === REFRESH_TOKEN_TYPE &&
    typeof claims.exp === 'number'
  );
};

export const hashRefreshToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');
