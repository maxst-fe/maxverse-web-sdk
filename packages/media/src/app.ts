import { LocalParticipant, Participant, RemoteParticipant, Room, RoomOptions } from 'livekit-client';
import { LocalTrackController } from './helper/index';
import { ParticipantEventContainer } from './participant';
import { Connection, RoomEventContainer } from './room';
import type { Config, InitialConnectionStatus, ParticipantHandler, RoomFactory, RoomHandler } from './types';
import { Cache, DI } from './utils/index';

const cache = new Cache();
const di = new DI();

const cacheStrategy = <T>(key: string, callback: () => T): T => {
  const value = cache.getValue(key);
  if (value) {
    return value;
  }
  const newValue: T = callback();
  cache.setValue(key, newValue);
  return newValue;
};

di.register('roomFactory', [], () => {
  return (roomOptions: RoomOptions) => {
    const room: Room = cacheStrategy<Room>('room', () => new Room(roomOptions));
    return room;
  };
});
di.register('localTrackControllerFactory', ['roomFactory'], (roomFactory: RoomFactory) => {
  return (
    isVideoEnabled: boolean,
    isAudioEnabeld: boolean,
    videoDeviceId: string | undefined,
    audioDeviceId: string | undefined
  ) => {
    return new LocalTrackController(roomFactory(), isVideoEnabled, isAudioEnabeld, videoDeviceId, audioDeviceId);
  };
});
di.register('participantEventContainerFactory', ['roomFactory'], (roomFactory: RoomFactory) => {
  return (participantHandler: ParticipantHandler): ParticipantEventContainer => {
    const room: Room = roomFactory();
    const participantEventContainer: ParticipantEventContainer = cacheStrategy<ParticipantEventContainer>(
      'participantEventContainer',
      () => new ParticipantEventContainer(room, participantHandler)
    );

    return participantEventContainer;
  };
});
di.register('roomEventContainerFactory', ['roomFactory'], (roomFactory: RoomFactory) => {
  return (roomHandler: RoomHandler) => {
    const room: Room = roomFactory();

    const roomEventContainer: RoomEventContainer = cacheStrategy<RoomEventContainer>(
      'roomEventContainer',
      () => new RoomEventContainer(room, roomHandler)
    );

    return roomEventContainer;
  };
});
di.register('connectionFactory', ['roomFactory'], (roomFactory: RoomFactory) => {
  return (roomOptions: RoomOptions) => {
    const room: Room = roomFactory(roomOptions);
    console.log(room);
    const connection: Connection = new Connection(room);
    return connection;
  };
});

export class LiveRoom {
  #currentRoom: Room;
  #connection: Connection;
  #localTrackController: LocalTrackController;

  constructor(config: Config) {
    const { isVideoEnabled, isAudioEnabled, videoDeviceId, audioDeviceId, ...roomOptions } = config;

    this.#currentRoom = di.get('roomFactory')(roomOptions);
    this.#connection = di.get('connectionFactory')(roomOptions);
    this.#localTrackController = di.get('localTrackControllerFactory')(
      isVideoEnabled,
      isAudioEnabled,
      videoDeviceId,
      audioDeviceId
    );
  }

  get #localParticipant(): LocalParticipant {
    return this.#currentRoom.localParticipant;
  }

  get #remoteParticipants(): RemoteParticipant[] {
    return Array.from(this.#currentRoom.participants.values());
  }

  get #allParticipants(): Participant[] {
    return [this.#localParticipant, ...this.#remoteParticipants];
  }

  #findParticipant(sid: string): Participant | undefined {
    return this.#allParticipants.find(participant => participant.sid === sid);
  }

  public prepareConnection = async (url?: string) => {
    return await this.#connection.prepareConnection(url);
  };

  public connectRoom = async (token: string, url?: string): Promise<InitialConnectionStatus> => {
    return await this.#connection.connectToRoom(token, url);
  };

  public toggleCam = () => {
    this.#localTrackController.toggleCam();
  };

  public toggleMic = () => {
    this.#localTrackController.toggleMic();
  };

  public bindRoomEvents = (handler: RoomHandler) => {
    if (!this.#currentRoom) {
      return;
    }

    (di.get('roomEventContainerFactory')(handler) as RoomEventContainer).bindRoomEvents();
  };

  public initializeCurrentRoomStatus = (handler: RoomHandler) => {
    this.#allParticipants.forEach(participant =>
      (di.get('roomEventContainerFactory')(handler) as RoomEventContainer).initializeCurrentRoomStatus(participant)
    );
  };

  public bindParticipantEvents = (sid: string, handler: ParticipantHandler) => {
    const participant = this.#findParticipant(sid);

    if (!participant) {
      return;
    }

    (di.get('participantEventContainerFactory')(handler) as ParticipantEventContainer).bindParticipantEvents(
      participant
    );
  };

  public initializeLocalTracks = async () => {
    await this.#localTrackController.initializeLocalTracks();
  };

  public disConnectRoom = () => {
    this.#connection.disConnectRoom();
  };
}
