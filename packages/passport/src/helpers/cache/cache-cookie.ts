import { getCookie, getCookies, removeCookie, setCookie } from 'typescript-cookie';
import { CacheEntry, ICache } from './shared';

interface CookieOptions {
  domain?: string;
}

export class CookieCache implements ICache {
  public get<T>(key: string): T | undefined {
    const value = getCookie(key);

    if (typeof value === 'undefined') {
      return;
    }

    return <T>JSON.parse(value);
  }

  public set<T = CacheEntry>(key: string, value: T) {
    let cookieAttributes = {};

    if ('https' === window.location.protocol) {
      cookieAttributes = {
        secure: true,
        sameSite: 'none',
      };
    }

    setCookie(key, JSON.stringify(value), cookieAttributes);
  }

  public remove(key: string, options?: CookieOptions) {
    let cookieAttributes = {};

    if (options?.domain) {
      cookieAttributes = { ...cookieAttributes, domain: options.domain };
    }

    removeCookie(key, cookieAttributes);
  }

  public getAllKeys() {
    return Object.keys(getCookies());
  }
}
