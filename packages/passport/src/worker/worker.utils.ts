import { Message } from './worker.types';

export const sendMessage = (message: Message, targetWorker: Worker) =>
  new Promise(function (resolve, reject) {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
      messageChannel.port1.close();
    };

    targetWorker.postMessage(message, [messageChannel.port2]);
  });

export const checkRefreshTokenExpires = (expires: number) => {
  const currentTime = new Date().getTime();

  return expires >= currentTime;
};

export const calcRefreshTokenExpires = (expires: string) => {
  const currentTime = new Date().getTime();

  return currentTime + Number(expires);
};
