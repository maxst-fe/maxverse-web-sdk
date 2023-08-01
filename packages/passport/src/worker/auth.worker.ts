/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthClient } from '../api/auth';
import { RequestTokenResult } from '../types/index';
import { CacheInMemoryManager, InMemoryStorage } from './cache.worker';
import { Message } from './worker.types';
import { calcRefreshTokenExpires } from './worker.utils';

const onMessage = async ({ data: { baseUrl, params, req }, ports: [port] }: MessageEvent<Message>) => {
  const inMemoryStorage = new InMemoryStorage();
  const cacheManager = new CacheInMemoryManager(inMemoryStorage);

  const client = new AuthClient({
    baseUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  let json: RequestTokenResult | string | object = {};

  try {
    if (req === 'token') {
      const data = await client.postAccessToken(params);

      const refresh_expires_in = calcRefreshTokenExpires(data.refresh_expires_in);

      cacheManager.save<string>('refresh_token', data.refresh_token);
      cacheManager.save<number>('refresh_expires_in', refresh_expires_in);

      json = data;
    }

    if (req === 'refresh_token') {
      const refresh_token = await cacheManager.getRefreshToken();

      cacheManager.deprecateRefreshTokenInfo();

      const data = await client.postRefreshToken(`${params}&refresh_token=${refresh_token}`);

      cacheManager.save('refresh_token', data.refresh_token);
      cacheManager.save('refresh_expires_in', data.refresh_expires_in);

      json = data;
    }

    if (req === 'logout') {
      const refresh_token = await cacheManager.getRefreshToken();

      cacheManager.deprecateRefreshTokenInfo();

      const data = await client.postLogout(`${params}&refresh_token=${refresh_token}`);

      json = data;
    }

    port.postMessage({
      status: 'SUCCESS',
      json,
    });
  } catch (error: any) {
    port.postMessage({
      status: 'FAIL',
      json: {
        error: error.error,
        error_message: error.message,
      },
    });
  }
};

addEventListener('message', onMessage);
