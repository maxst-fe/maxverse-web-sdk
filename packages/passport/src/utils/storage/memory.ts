/* eslint-disable no-unused-vars */
export interface CapsuledCache {
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
