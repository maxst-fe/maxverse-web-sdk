import { AuthenticationError, AUTHENTICATION_ERROR_NAME } from '../errors';
import { Message } from './worker.types';

const checkAuthenticationError = (error: any, errorName: string) => {
  if (errorName === AUTHENTICATION_ERROR_NAME) {
    Object.setPrototypeOf(error, AuthenticationError.prototype);
  }
  return error;
};

export const sendMessage = (message: Partial<Message>, targetWorker: SharedWorker) =>
  new Promise(function (resolve, reject) {
    targetWorker.port.onmessage = function (event) {
      if (event.data.status === 'FAIL') {
        const error = checkAuthenticationError(event.data.json.error, event.data.json.errorName);
        reject(error);
      } else {
        resolve(event.data);
      }
    };

    targetWorker.port.postMessage(message);
  });

export const checkRefreshTokenExpires = (expires: number) => {
  const currentTime = new Date().getTime();

  return expires <= currentTime;
};

export const calcRefreshTokenExpires = (expires: number) => {
  const currentTime = new Date().getTime();

  return currentTime + expires * 1000;
};
