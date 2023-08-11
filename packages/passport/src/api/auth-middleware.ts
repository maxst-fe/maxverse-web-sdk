/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildQueryParams } from '../helpers/common/index';
import { AuthRequest, EntireAccessTokenOptions, LogoutOptions, RefreshTokenOptions } from '../types/index';
import { CheckRfTokenBody, LogoutBody, Reply, TokenBody } from '../worker/worker.types';
import { sendMessage } from '../worker/worker.utils';

export const oauthToken = async (
  baseUrl: string,
  options: EntireAccessTokenOptions | RefreshTokenOptions,
  req: AuthRequest,
  worker: SharedWorker
) => {
  const params = buildQueryParams(options);

  try {
    const data = (await sendMessage({ baseUrl, params, req }, worker)) as Reply<TokenBody>;

    return data.body;
  } catch (error) {
    throw error;
  }
};

export const deprecateSession = async (
  baseUrl: string,
  options: Omit<LogoutOptions, 'refresh_token'>,
  req: AuthRequest,
  worker: SharedWorker,
  headers: { [key: string]: string }
) => {
  const params = buildQueryParams(options);

  try {
    const data = (await sendMessage({ baseUrl, params, req, headers }, worker)) as Reply<LogoutBody>;

    return data.status;
  } catch (error) {
    throw error;
  }
};

export const checkRefreshToken = async (req: AuthRequest, worker: SharedWorker) => {
  try {
    const data = (await sendMessage({ req }, worker)) as Reply<CheckRfTokenBody>;

    return data.body;
  } catch (error) {
    throw error;
  }
};
