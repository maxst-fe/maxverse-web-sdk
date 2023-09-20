import { TokenBody } from '../../api/types';
import {
  CACHE_KEY_AUTHENTICATED_SUFFIX,
  CACHE_KEY_ID_TOKEN_SUFFIX,
  CACHE_KEY_PREFIX,
  CACHE_KEY_REFRESH_TOKEN_SUFFIX,
} from '../../constants';
import { NOT_FOUND_REFRESH_TOKEN_ENTRY, REFRESH_TOKEN_EXPIRED } from '../../constants/error';
import { ICache, IdTokenEntry, RefreshTokenEntry } from '../cache/shared';
import { nowTime } from '../common';

export class CacheManager {
  #clientid: string;
  #authPrefix: string;
  #idTokenPrefix: string;
  #refreshTokenPrefix: string;
  #cache: ICache;

  constructor(cache: ICache, clientId: string) {
    const PREFIX = `${CACHE_KEY_PREFIX}.${clientId}_`;

    this.#clientid = clientId;
    this.#cache = cache;

    this.#authPrefix = `${PREFIX}${CACHE_KEY_AUTHENTICATED_SUFFIX}`;
    this.#idTokenPrefix = `${PREFIX}${CACHE_KEY_ID_TOKEN_SUFFIX}`;
    this.#refreshTokenPrefix = `${PREFIX}${CACHE_KEY_REFRESH_TOKEN_SUFFIX}`;
  }

  async getIdToken() {
    const idTokenEntry = await this.#cache.get<IdTokenEntry>(this.#idTokenPrefix);

    if (!idTokenEntry) {
      return;
    }

    return { id_token: idTokenEntry.id_token, claims: idTokenEntry.claims };
  }

  async setIdToken(id_token: string, claims: string) {
    await this.#cache.set(this.#idTokenPrefix, {
      id_token,
      claims,
    });
  }

  async getRefreshToken() {
    const refreshTokenEntry = await this.#cache.get<RefreshTokenEntry>(this.#refreshTokenPrefix);

    if (!refreshTokenEntry) {
      throw new Error(NOT_FOUND_REFRESH_TOKEN_ENTRY);
    }

    if (this.#checkIsExpires(refreshTokenEntry.refresh_expires_at)) {
      throw new Error(REFRESH_TOKEN_EXPIRED);
    }

    return refreshTokenEntry.refresh_token;
  }

  async setRefreshToken(refresh_token: string, refresh_expires_in: string) {
    const refresh_expires_at = this.#calcExpires(refresh_expires_in);

    await this.#cache.set(this.#refreshTokenPrefix, {
      refresh_token,
      refresh_expires_at,
    });
  }

  async get() {
    const authEntry = await this.#cache.get(this.#authPrefix);

    if (!authEntry) {
      return;
    }

    if (this.#checkIsExpires(authEntry.expires_at)) {
      await this.remove();
      return;
    }

    return authEntry;
  }

  async set(entry: Omit<TokenBody, 'id_token' | 'refresh_token' | 'refresh_expires_in'>) {
    const expires_at = this.#calcExpires(entry.expires_in);

    await this.#cache.set(this.#authPrefix, {
      token: entry.token,
      expires_at,
      token_type: entry.token_type,
      session_state: entry.session_state,
      scope: entry.scope,
    });
  }

  async remove() {
    const keys = await this.#cache.getAllKeys();

    await keys
      .filter(key => key.includes(this.#clientid))
      .reduce(async (memo, key) => {
        await memo;
        await this.#cache.remove(key);
      }, Promise.resolve());
  }

  #calcExpires(expires_in: string) {
    return nowTime() + Number(expires_in);
  }

  #checkIsExpires(expires: number) {
    return expires <= nowTime();
  }
}
