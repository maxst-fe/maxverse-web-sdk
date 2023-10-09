import { getCookie, getCookies, removeCookie, setCookie } from 'typescript-cookie';
import { CacheEntry, ICache } from './shared';

export interface CookieOptions {
  domain?: string;
  expires?: string;
}

export class CookieCache implements ICache {
  public get<T>(key: string): T | undefined {
    const value = getCookie(key);

    if (typeof value === 'undefined') {
      return;
    }

    return <T>JSON.parse(value);
  }

  public set<T = CacheEntry>(key: string, value: T, options?: CookieOptions) {
    let cookieAttributes = {};

    if ('https' === window.location.protocol) {
      cookieAttributes = {
        ...cookieAttributes,
        secure: true,
        sameSite: 'none',
      };
    }

    if (options?.expires) {
      const secondsInOneDay = 24 * 60 * 60;

      cookieAttributes = {
        ...cookieAttributes,

        expires: Number(options.expires) / secondsInOneDay,
      };
    }

    if (options?.domain) {
      cookieAttributes = { ...cookieAttributes, domain: options.domain };
    }

    cookieAttributes = { ...cookieAttributes, path: '/' };

    setCookie(key, JSON.stringify(value), cookieAttributes);
  }

  public remove(key: string, options?: CookieOptions) {
    let cookieAttributes = {};

    if (options?.domain) {
      cookieAttributes = { ...cookieAttributes, domain: options.domain };
    }

    cookieAttributes = { ...cookieAttributes, path: '/' };

    removeCookie(key, cookieAttributes);
  }

  public getAllKeys() {
    return Object.keys(getCookies());
  }
}
