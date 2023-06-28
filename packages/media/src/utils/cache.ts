/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */

class Cache {
  #cache: Record<string, any>;

  constructor() {
    this.#cache = {};
  }

  #getCacheKey = (key: string) => {
    return JSON.stringify(key);
  };

  hasKey = (key: string) => {
    return this.#cache.hasOwnProperty(this.#getCacheKey(key));
  };

  setValue = (key: string, value: any) => {
    this.#cache[this.#getCacheKey(key)] = value;
  };

  getValue = (key: string) => {
    return this.#cache[this.#getCacheKey(key)];
  };
}

export default Cache;
