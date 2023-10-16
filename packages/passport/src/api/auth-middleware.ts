/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest, RefreshTokenAliveBody, Reply, TokenBody } from '../api/types';
import { buildQueryParams } from '../helpers/common/index';
import { EntireAccessTokenOptions, LogoutOptions, RefreshTokenOptions } from '../types';
import { sendMessage } from '../worker/worker.utils';
import { AuthClient } from './auth';

export const switchFetch = async (
  baseUrl: string,
  params: string,
  req: AuthRequest,
  worker?: SharedWorker,
  headers?: { [key: string]: string }
): Promise<unknown> => {
  if (worker) {
    return await oauthWithWorker(baseUrl, params, req, worker, headers);
  }
  return await oauthWithoutWorker(baseUrl, params, req, headers);
};

export const oauthFetch = async <T = Reply<TokenBody | string>>(
  baseUrl: string,
  options: EntireAccessTokenOptions | RefreshTokenOptions | LogoutOptions,
  req: AuthRequest,
  worker?: SharedWorker,
  headers?: { [key: string]: string }
): Promise<T> => {
  const params = buildQueryParams(options);

  try {
    const data = (await switchFetch(baseUrl, params, req, worker, headers)) as T;
    return data;
  } catch (error: any) {
    throw error;
  }
};

export const oauthWithWorker = async (
  baseUrl: string,
  params: string,
  req: AuthRequest,
  worker: SharedWorker,
  headers?: { [key: string]: string }
) => {
  try {
    const data = await sendMessage({ baseUrl, params, req, headers }, worker);

    return data;
  } catch (error: any) {
    throw error.error_message;
  }
};

export const oauthWithoutWorker = async (
  baseUrl: string,
  params: string,
  req: AuthRequest,
  headers?: { [key: string]: string }
): Promise<unknown> => {
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
    if (req === 'token' || req === 'refresh_token') {
      const data = await client.postToken(params);

      body = data;
    }

    if (req === 'logout') {
      const data = await client.postLogout(params);

      body = data;
    }

    return {
      status: 'SUCCESS',
      body,
    };
  } catch (error: any) {
    throw error.message;
  }
};

export const checkRefreshTokenAlive = async (req: 'check_refresh_token_alive', worker: SharedWorker) => {
  try {
    const data = (await sendMessage({ req }, worker)) as Reply<RefreshTokenAliveBody>;

    return data.body;
  } catch (error) {
    throw error;
  }
};
