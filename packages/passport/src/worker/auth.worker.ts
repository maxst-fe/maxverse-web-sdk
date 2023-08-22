/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthClient } from '../api/auth';
import { CacheInMemoryManager, InMemoryStorage } from './cache.worker';
import { Message } from './worker.types';
import { calcRefreshTokenExpires } from './worker.utils';

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
      if (req === 'check_refresh_token') {
        const refresh_token = await cacheManager.getRefreshToken();

        body = Boolean(refresh_token);
      }

      if (req === 'token') {
        const data = await client.postAccessToken(params);

        const refresh_expires_in = calcRefreshTokenExpires(data.refresh_expires_in);

        cacheManager.save<string>('refresh_token', data.refresh_token);
        cacheManager.save<number>('refresh_expires_in', refresh_expires_in);

        body = data;
      }

      if (req === 'refresh_token') {
        const refresh_token = await cacheManager.getRefreshToken();

        const data = await client.postRefreshToken(`${params}&refresh_token=${refresh_token}`);

        cacheManager.deprecateRefreshTokenInfo();

        const refresh_expires_in = calcRefreshTokenExpires(data.refresh_expires_in);

        cacheManager.save('refresh_token', data.refresh_token);
        cacheManager.save('refresh_expires_in', refresh_expires_in);

        body = data;
      }

      if (req === 'logout') {
        const refresh_token = await cacheManager.getRefreshToken();

        const data = await client.postLogout(`${params}&refresh_token=${refresh_token}`);

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
