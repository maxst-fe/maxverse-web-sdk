import { CACHE_KEY_PREFIX, DEFAULT_PASSPORT_PREFIX_POS } from '../../constants/index';
import { CookieStorage } from '../../utils/index';

export class CacheCookieManager {
  #storageKey: string;
  #storage: CookieStorage;
  #cookieDomain?: string;

  constructor(storage: CookieStorage, clientId: string, cookieDomain?: string) {
    this.#storageKey = `${CACHE_KEY_PREFIX}.${clientId}`;
    this.#storage = storage;
    this.#cookieDomain = cookieDomain;
  }

  public save(identifier: string, value: string, expires?: string) {
    this.#storage.set(`${this.#storageKey}_${identifier}`, value, {
      expires,
      domain: this.#cookieDomain,
    });
  }

  public get(identifier: string) {
    const value = this.#storage.get<string>(`${this.#storageKey}_${identifier}`);
    return value ? value : undefined;
  }

  public clearAll() {
    const cacheKeys = Object.keys(this.#storage.getAll());

    cacheKeys.forEach(cacheKey => {
      if (cacheKey.split('_')[DEFAULT_PASSPORT_PREFIX_POS] === this.#storageKey) {
        this.#storage.remove(cacheKey);
      }
    });
  }
}
