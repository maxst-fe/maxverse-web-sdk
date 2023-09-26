/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthClient } from '../api/auth';
import { TokenBody } from '../api/types';
import { CacheInMemoryManager, InMemoryStorage } from './cache.worker';
import { Message } from './worker.types';

declare const self: SharedWorkerGlobalScope;

const inMemoryStorage = new InMemoryStorage();
const cacheManager = new CacheInMemoryManager(inMemoryStorage);

self.onconnect = function (e: MessageEvent) {
  const port = e.ports[0];
  port.start();

  port.addEventListener('message', async function ({ data }: { data: Message }) {
    const { baseUrl, params, req, headers } = data;

    const targetHeaders = {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const client = new AuthClient({
      baseUrl,
      headers: targetHeaders,
    });

    let body: unknown;

    try {
      if (req === 'check_refresh_token_alive') {
        const refresh_token = await cacheManager.getRefreshToken();

        body = Boolean(refresh_token);
      }

      if (req === 'token') {
        const data = await client.postToken(params);

        cacheManager.save<string>('refresh_token', data.refresh_token);

        delete (data as Partial<TokenBody>)['refresh_token'];

        body = data;
      }

      if (req === 'refresh_token') {
        const refresh_token = await cacheManager.getRefreshToken();

        const data = await client.postToken(`${params}&refresh_token=${refresh_token}`);

        cacheManager.deprecateRefreshTokenInfo();

        cacheManager.save('refresh_token', data.refresh_token);

        delete (data as Partial<TokenBody>)['refresh_token'];

        body = data;
      }

      if (req === 'logout') {
        const data = await client.postLogout(params);

        cacheManager.deprecateRefreshTokenInfo();

        body = data;
      }

      port.postMessage({
        status: 'SUCCESS',
        body,
      });
    } catch (error: any) {
      port.postMessage({
        status: 'FAIL',
        json: {
          error_message: error.message,
        },
      });
    }
  });
};
