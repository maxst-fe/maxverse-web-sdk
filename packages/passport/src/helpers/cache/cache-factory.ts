import { CacheLocation } from '../../index';
import { CookieCache } from './cache-cookie';
import { InMemoryCache } from './cache-memory';
import { ICache } from './shared';

const cacheLocationProvider: Record<string, () => ICache> = {
  memory: () => new InMemoryCache().capsuledCache,
  cookie: () => new CookieCache(),
};

export const cacheFactory = (location: CacheLocation) => {
  return cacheLocationProvider[location];
};
