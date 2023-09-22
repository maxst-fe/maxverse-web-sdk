import { TokenBody } from '../../api/types';
import {
  CACHE_KEY_AUTHENTICATED_SUFFIX,
  CACHE_KEY_ID_TOKEN_SUFFIX,
  CACHE_KEY_PREFIX,
  CACHE_KEY_REFRESH_TOKEN_SUFFIX,
} from '../../constants';
import { Claims } from '../../types';
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

  getIdToken() {
    const idTokenEntry = this.#cache.get<IdTokenEntry>(this.#idTokenPrefix);

    if (!idTokenEntry) {
      return;
    }

    return { id_token: idTokenEntry.id_token, claims: idTokenEntry.claims };
  }

  setIdToken(id_token: string, claims: Claims) {
    this.#cache.set(this.#idTokenPrefix, {
      id_token,
      claims,
    });
  }

  getRefreshToken() {
    const refreshTokenEntry = this.#cache.get<RefreshTokenEntry>(this.#refreshTokenPrefix);

    if (!refreshTokenEntry) {
      return;
    }

    if (this.#checkIsExpires(refreshTokenEntry.refresh_expires_at)) {
      return;
    }

    return refreshTokenEntry.refresh_token;
  }

  setRefreshToken(refresh_token: string, refresh_expires_in: string) {
    const refresh_expires_at = this.#calcExpires(refresh_expires_in);

    this.#cache.set(this.#refreshTokenPrefix, {
      refresh_token,
      refresh_expires_at,
    });
  }

  get() {
    const authEntry = this.#cache.get(this.#authPrefix);

    if (!authEntry) {
      return;
    }

    if (this.#checkIsExpires(authEntry.expires_at)) {
      this.remove();
      return;
    }

    return authEntry;
  }

  set(entry: Omit<TokenBody, 'id_token' | 'refresh_token' | 'refresh_expires_in'>) {
    const expires_at = this.#calcExpires(entry.expires_in);

    this.#cache.set(this.#authPrefix, {
      token: entry.token,
      expires_at,
      token_type: entry.token_type,
      session_state: entry.session_state,
      scope: entry.scope,
    });
  }

  remove() {
    const keys = this.#cache.getAllKeys();

    keys
      .filter(key => key.includes(this.#clientid))
      .forEach(key => {
        this.#cache.remove(key);
      });
  }

  #calcExpires(expires_in: string) {
    return nowTime() + Number(expires_in) * 1000;
  }

  #checkIsExpires(expires: number) {
    return expires <= nowTime();
  }
}
