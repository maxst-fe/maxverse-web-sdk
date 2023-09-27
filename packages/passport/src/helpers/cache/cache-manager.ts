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
import { CookieCache } from './cache-cookie';

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

    const refresh_expires_at = refreshTokenEntry?.refresh_expires_at;

    if (!refresh_expires_at) {
      if (this.#cache instanceof CookieCache && !refreshTokenEntry) {
        this.remove();
        return;
      }

      if (this.#cache instanceof CookieCache && refreshTokenEntry) {
        return refreshTokenEntry.refresh_token;
      }
    }

    if (this.#checkIsExpires(refresh_expires_at)) {
      this.remove();
      return;
    }

    return refreshTokenEntry?.refresh_token;
  }

  setRefreshToken(refresh_token: string, refresh_expires_in: string) {
    if (this.#cache instanceof CookieCache) {
      this.#cache.set(
        this.#authPrefix,
        {
          refresh_token,
        },
        { expires: refresh_expires_in }
      );

      return;
    }

    const refresh_expires_at = this.#calcExpires(refresh_expires_in);

    this.#cache.set(this.#refreshTokenPrefix, {
      refresh_token,
      refresh_expires_at,
    });
  }

  get() {
    const authEntry = this.#cache.get(this.#authPrefix);

    const expires_at = authEntry?.expires_at;

    if (!expires_at) {
      if (this.#cache instanceof CookieCache && !authEntry) {
        this.remove();
        return;
      }

      if (this.#cache instanceof CookieCache && authEntry) {
        return authEntry;
      }
    }

    if (this.#checkIsExpires(expires_at)) {
      this.remove();
      return;
    }

    return authEntry;
  }

  set(entry: Omit<TokenBody, 'id_token' | 'refresh_token'>) {
    if (this.#cache instanceof CookieCache) {
      this.#cache.set(
        this.#authPrefix,
        {
          token: entry.access_token,
          token_type: entry.token_type,
          scope: entry.scope,
        },
        { expires: entry.expires_in }
      );

      return;
    }

    const expires_at = this.#calcExpires(entry.expires_in);

    this.#cache.set(this.#authPrefix, {
      token: entry.access_token,
      expires_at,
      token_type: entry.token_type,
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

  #checkIsExpires(expires: number | undefined) {
    if (!expires) {
      return true;
    }

    return expires <= nowTime();
  }
}
