import { Claims } from '../../types';

export interface CacheEntry {
  token: string;
  expires_at: number;
  token_type: string;
  session_state: string;
  scope: string;
}

export interface IdTokenEntry {
  id_token: string;
  claims: Claims;
}

export interface RefreshTokenEntry {
  refresh_token: string;
  refresh_expires_at: number;
}

export type MaybePromise<T> = Promise<T> | T;

export interface ICache {
  get<T = CacheEntry>(key: string): MaybePromise<T | undefined>;
  set<T = CacheEntry>(key: string, entry: T): MaybePromise<void>;
  remove(key: string): MaybePromise<void>;
  getAllKeys(): MaybePromise<string[]>;
}
