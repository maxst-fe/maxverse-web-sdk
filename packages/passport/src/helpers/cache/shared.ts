import { Claims } from '../../types';
import { CookieOptions } from './cache-cookie';

export interface CacheEntry {
  token: string;
  expires_at?: number;
  token_type: string;
  session_state: string;
  scope: string;
}

export interface IdTokenEntry {
  id_token: string;
  claims: Claims;
  expires_at?: number;
}

export interface RefreshTokenEntry {
  refresh_token: string;
  refresh_expires_at: number;
}

export interface ICache {
  get<T = CacheEntry>(key: string): T | undefined;
  set<T = CacheEntry>(key: string, entry: T, options?: CookieOptions): void;
  remove(key: string, options?: CookieOptions): void;
  getAllKeys(): string[];
}
