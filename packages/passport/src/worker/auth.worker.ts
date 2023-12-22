/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthClient } from '../api/auth';
import { TokenBody } from '../api/types';
import { REFRESH_TOKEN_ACTIVE } from '../constants/index';
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
      if (req === 'check_refresh_token_active') {
        await cacheManager.getRefreshToken();
        const refresh_expires_at = cacheManager.get<number>('refresh_expires_at');

        body = `${REFRESH_TOKEN_ACTIVE}${refresh_expires_at}`;
      }

      if (req === 'token') {
        const data = await client.postToken(params);

        const refresh_expires_at = calcRefreshTokenExpires(data.refresh_expires_in);

        cacheManager.save<string>('refresh_token', data.refresh_token);
        cacheManager.save<number>('refresh_expires_at', refresh_expires_at);

        delete (data as Partial<TokenBody>)['refresh_token'];
        delete (data as Partial<TokenBody>)['refresh_expires_in'];

        body = data;
      }

      if (req === 'refresh_token') {
        const refresh_token = await cacheManager.getRefreshToken();

        const data = await client.postToken(`${params}&refresh_token=${refresh_token}`);

        cacheManager.deprecateRefreshTokenInfo();

        const refresh_expires_at = calcRefreshTokenExpires(data.refresh_expires_in);

        cacheManager.save('refresh_token', data.refresh_token);
        cacheManager.save('refresh_expires_at', refresh_expires_at);

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
          error,
        },
      });
    }
  });
};
