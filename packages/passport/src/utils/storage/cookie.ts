import { getCookie, getCookies, removeCookie, setCookie } from 'typescript-cookie';

interface CookieOptions {
  expires?: string;
  domain?: string;
}

export class CookieStorage {
  public set(key: string, value: unknown, options?: CookieOptions): void {
    let cookieAttributes = {};

    if ('https' === window.location.protocol) {
      cookieAttributes = {
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

    setCookie(key, JSON.stringify(value), cookieAttributes);
  }

  public get<T>(key: string): T | undefined {
    const value = getCookie(key);

    if (typeof value === 'undefined') {
      return;
    }

    return <T>JSON.parse(value);
  }

  public getAll() {
    return getCookies();
  }

  public remove(key: string, options?: CookieOptions) {
    let cookieAttributes = {};

    if (options?.domain) {
      cookieAttributes = { ...cookieAttributes, domain: options.domain };
    }

    removeCookie(key, cookieAttributes);
  }
}
