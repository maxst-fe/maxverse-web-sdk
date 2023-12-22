/* eslint-disable no-unused-vars */
import { NOT_FOUND_REFRESH_TOKEN, NOT_FOUND_REFRESH_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRED } from '../constants/error';
import { AuthenticationError } from '../errors';
import { Identifier } from './worker.types';
import { checkRefreshTokenExpires } from './worker.utils';

interface CapsuledCache {
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | undefined;
  remove(key: string): void;
}

export class InMemoryStorage {
  public capsuledCache = (function () {
    const cache: Record<string, unknown> = {};

    return {
      set<T>(key: string, value: T) {
        cache[key] = value;
      },
      get<T>(key: string): T | undefined {
        const value = cache[key] as T;

        if (!value) {
          return;
        }

        return value;
      },
      remove(key: string) {
        delete cache[key];
      },
    };
  })();
}

export class CacheInMemoryManager {
  #storage: CapsuledCache;

  constructor(storage: InMemoryStorage) {
    this.#storage = storage.capsuledCache;
  }

  get<T extends string | number>(identifier: Identifier) {
    return this.#storage.get<T>(identifier);
  }

  public save<T extends string | number>(identifier: Identifier, value: T) {
    this.#storage.set<T>(identifier, value);
  }

  public async getRefreshToken() {
    const refresh_token = this.get<string>('refresh_token');
    const refresh_expires_at = this.get<number>('refresh_expires_at');

    if (!refresh_expires_at) {
      throw new AuthenticationError(NOT_FOUND_REFRESH_TOKEN_EXPIRES);
    }

    if (!refresh_token) {
      throw new AuthenticationError(NOT_FOUND_REFRESH_TOKEN);
    }

    const isExpires = await checkRefreshTokenExpires(refresh_expires_at);

    if (isExpires) {
      throw new AuthenticationError(REFRESH_TOKEN_EXPIRED);
    }

    return refresh_token;
  }

  public deprecateRefreshTokenInfo() {
    this.#storage.remove('refresh_token');
    this.#storage.remove('refresh_expires_at');
  }
}
