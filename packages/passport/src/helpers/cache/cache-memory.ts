import { CacheEntry, ICache, MaybePromise } from './shared';

export class InMemoryCache {
  public capsuledCache: ICache = (function () {
    const cache: Record<string, unknown> = {};

    return {
      get<T = CacheEntry>(key: string): MaybePromise<T | undefined> {
        const value = cache[key] as T;

        if (!value) {
          return;
        }

        return value;
      },
      set<T = CacheEntry>(key: string, value: T) {
        cache[key] = value;
      },
      remove(key: string) {
        delete cache[key];
      },
      getAllKeys(): string[] {
        return Object.keys(cache);
      },
    };
  })();
}
