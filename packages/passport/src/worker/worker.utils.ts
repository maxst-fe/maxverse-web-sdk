import { Message } from './worker.types';

export const sendMessage = (message: Message, targetWorker: SharedWorker) =>
  new Promise(function (resolve, reject) {
    targetWorker.port.onmessage = function (event) {
      if (event.data.status === 'FAIL') {
        reject(new Error(event.data.json.error_message));
      } else {
        resolve(event.data);
      }
    };

    targetWorker.port.postMessage(message);
  });

export const checkRefreshTokenExpires = (expires: number) => {
  const currentTime = new Date().getTime();

  return expires >= currentTime;
};

export const calcRefreshTokenExpires = (expires: string) => {
  const currentTime = new Date().getTime();

  return currentTime + Number(expires);
};
