/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildQueryParams } from '../helpers/common/index';
import {
  AuthRequest,
  EntireAccessTokenOptions,
  LogoutOptions,
  RefreshTokenOptions,
  RequestTokenResult,
} from '../types/index';
import { Reply } from '../worker/worker.types';
import { sendMessage } from '../worker/worker.utils';

export const oauthToken = async (
  baseUrl: string,
  options: EntireAccessTokenOptions | RefreshTokenOptions,
  req: AuthRequest,
  worker: Worker
) => {
  const params = buildQueryParams(options);

  try {
    const { json } = (await sendMessage({ baseUrl, params, req }, worker)) as Reply<RequestTokenResult>;

    return json;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const deprecateSession = async (
  baseUrl: string,
  options: Omit<LogoutOptions, 'refresh_token'>,
  req: AuthRequest,
  worker: Worker
) => {
  const params = buildQueryParams(options);

  try {
    const { json } = (await sendMessage({ baseUrl, params, req }, worker)) as Reply<string>;

    return json;
  } catch (error: any) {
    throw new Error(error);
  }
};
