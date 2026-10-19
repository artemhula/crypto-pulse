import {
  DEFAULT_JWT_ACCESS_SECRET,
  JWT_ACCESS_SECRET,
} from './auth.constants.js';

export interface JwtConfigSource {
  get<T = string>(key: string): T | undefined;
}

export function buildJwtModuleOptions(configService: JwtConfigSource) {
  return {
    secret: configService.get<string>(JWT_ACCESS_SECRET) || DEFAULT_JWT_ACCESS_SECRET,
  };
}
