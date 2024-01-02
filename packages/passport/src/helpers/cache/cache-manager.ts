import { TokenBody } from '../../api/types';
import {
  CACHE_KEY_AUTHENTICATED_SUFFIX,
  CACHE_KEY_ID_TOKEN_SUFFIX,
  CACHE_KEY_PREFIX,
  CACHE_KEY_REFRESH_TOKEN_SUFFIX,
} from '../../constants';
import { AuthenticationError } from '../../errors';
import { NOT_FOUND_REFRESH_TOKEN, NOT_FOUND_REFRESH_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRED } from '../../index';
import { Claims } from '../../types';
import { ICache, IdTokenEntry, RefreshTokenEntry } from '../cache/shared';
import { nowTime } from '../common';
import { CookieCache } from './cache-cookie';

export class CacheManager {
  #clientid: string;
  #domain: string | undefined;
  #authPrefix: string;
  #idTokenPrefix: string;
  #refreshTokenPrefix: string;
  #cache: ICache;

  constructor(cache: ICache, clientId: string, domain: string | undefined) {
    const PREFIX = `${CACHE_KEY_PREFIX}.${clientId}_`;

    this.#clientid = clientId;
    this.#cache = cache;
    this.#domain = domain;

    this.#authPrefix = `${PREFIX}${CACHE_KEY_AUTHENTICATED_SUFFIX}`;
    this.#idTokenPrefix = `${PREFIX}${CACHE_KEY_ID_TOKEN_SUFFIX}`;
    this.#refreshTokenPrefix = `${PREFIX}${CACHE_KEY_REFRESH_TOKEN_SUFFIX}`;
  }

  getIdToken() {
    const idTokenEntry = this.#cache.get<IdTokenEntry>(this.#idTokenPrefix);

    const expires_at = idTokenEntry?.expires_at;

    if (!idTokenEntry) {
      return;
    }

    if (!expires_at) {
      if (this.#cache instanceof CookieCache && !idTokenEntry) {
        this.removeIdToken();
        return;
      }

      if (this.#cache instanceof CookieCache && idTokenEntry) {
        return idTokenEntry;
      }
    }

    if (this.#checkIsApochExpires(expires_at)) {
      this.removeIdToken();
      return;
    }

    return { id_token: idTokenEntry.id_token, claims: idTokenEntry.claims };
  }

  setIdToken(id_token: string, claims: Claims) {
    if (this.#cache instanceof CookieCache) {
      const cookie_expires = this.#calcApochExpires(claims.exp);

      this.#cache.set(
        this.#idTokenPrefix,
        {
          id_token,
          claims,
        },
        {
          domain: this.#domain,
          expires: cookie_expires,
        }
      );

      return;
    }

    this.#cache.set(this.#idTokenPrefix, {
      id_token,
      claims,
      expires_at: claims.exp,
    });
  }

  getRefreshToken() {
    const refreshTokenEntry = this.#cache.get<RefreshTokenEntry>(this.#refreshTokenPrefix);

    const refresh_expires_at = refreshTokenEntry?.refresh_expires_at;

    if (!refresh_expires_at) {
      if (this.#cache instanceof CookieCache && !refreshTokenEntry) {
        this.remove();
        throw new AuthenticationError(NOT_FOUND_REFRESH_TOKEN);
      }

      if (this.#cache instanceof CookieCache && refreshTokenEntry) {
        return refreshTokenEntry.refresh_token;
      }

      throw new AuthenticationError(NOT_FOUND_REFRESH_TOKEN_EXPIRES);
    }

    if (this.#checkIsSecondPerMinuteExpires(refresh_expires_at)) {
      this.remove();
      throw new AuthenticationError(REFRESH_TOKEN_EXPIRED);
    }

    return refreshTokenEntry.refresh_token;
  }

  setRefreshToken(refresh_token: string, refresh_expires_in: number) {
    if (this.#cache instanceof CookieCache) {
      const cookie_expires = this.#calcSecondPerMinutesExpiresCookie(refresh_expires_in);
      this.#cache.set(
        this.#refreshTokenPrefix,
        {
          refresh_token,
        },
        { domain: this.#domain, expires: cookie_expires }
      );

      return;
    }

    const refresh_expires_at = this.#calcSecondPerMiuteExpiresMemory(refresh_expires_in);

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
        this.removeAccessToken();
        return;
      }

      if (this.#cache instanceof CookieCache && authEntry) {
        return authEntry;
      }
    }

    if (this.#checkIsSecondPerMinuteExpires(expires_at)) {
      this.removeAccessToken();
      return;
    }

    return authEntry;
  }

  set(entry: Omit<TokenBody, 'id_token' | 'refresh_token'>) {
    if (this.#cache instanceof CookieCache) {
      const cookie_expires = this.#calcSecondPerMinutesExpiresCookie(entry.expires_in);
      this.#cache.set(
        this.#authPrefix,
        {
          token: entry.access_token,
          token_type: entry.token_type,
          scope: entry.scope,
        },
        { domain: this.#domain, expires: cookie_expires }
      );

      return;
    }

    const expires_at = this.#calcSecondPerMiuteExpiresMemory(entry.expires_in);

    this.#cache.set(this.#authPrefix, {
      token: entry.access_token,
      expires_at,
      token_type: entry.token_type,
      scope: entry.scope,
    });
  }

  removeAccessToken() {
    if (this.#cache instanceof CookieCache) {
      this.#cache.remove(this.#authPrefix, { domain: this.#domain });
      return;
    }
    this.#cache.remove(this.#authPrefix);
  }

  removeIdToken() {
    if (this.#cache instanceof CookieCache) {
      this.#cache.remove(this.#idTokenPrefix, { domain: this.#domain });
      return;
    }
    this.#cache.remove(this.#idTokenPrefix);
  }

  remove() {
    const keys = this.#cache.getAllKeys();

    keys
      .filter(key => key.includes(this.#clientid))
      .forEach(key => {
        if (this.#cache instanceof CookieCache) {
          this.#cache.remove(key, { domain: this.#domain });
        } else {
          this.#cache.remove(key);
        }
      });
  }

  #checkIsApochExpires(expires: number | undefined) {
    if (!expires) {
      return true;
    }

    const currentEpochTime = Math.floor(Date.now() / 1000);

    return currentEpochTime >= expires;
  }

  #calcApochExpires(expires: number) {
    const currentEpochTime = Math.floor(Date.now() / 1000);

    const remainingSeconds = expires - currentEpochTime;

    return remainingSeconds / 86400;
  }

  #checkIsSecondPerMinuteExpires(expires: number | undefined) {
    if (!expires) {
      return true;
    }

    return expires <= nowTime();
  }

  #calcSecondPerMiuteExpiresMemory(expires_in: number) {
    return nowTime() + expires_in * 1000;
  }

  #calcSecondPerMinutesExpiresCookie(expires_in: number) {
    const secondsInOneDay = 24 * 60 * 60;

    return expires_in / secondsInOneDay;
  }
}
