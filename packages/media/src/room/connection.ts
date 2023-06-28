import { Room } from 'livekit-client';
import { InitialConnectionStatus } from '../types';

class Connection {
  #room: Room;
  #url: string;

  constructor(room: Room) {
    this.#room = room;
    this.#url = 'wss://media.maxverse.io';
  }

  prepareConnection = async (url?: string): Promise<InitialConnectionStatus> => {
    url = url || this.#url;

    try {
      await this.#room.prepareConnection(url);

      return InitialConnectionStatus.PREPARE_CONNECTION_SUCCESS;
    } catch (e) {
      throw new Error('prepare connection fail');
    }
  };

  connectToRoom = async (token: string, url?: string): Promise<InitialConnectionStatus> => {
    url = url || this.#url;

    try {
      await this.#room.connect(url, token);

      return InitialConnectionStatus.CONNECTION_SUCCESS;
    } catch (e) {
      throw new Error('connection fail');
    }
  };

  disConnectRoom = async () => {
    this.#room.disconnect();
  };
}

export default Connection;
