import { Participant, Room, RoomEvent } from 'livekit-client';
import { TargetParticipant, TargetParticipantFactory } from '../participant/targetParticipant';
import {
  ConnectionState,
  CurrentConnectionInfo,
  OnConnectionStateChanged,
  OnParticipantConnected,
  OnParticipantDisconnected,
  RoomHandler,
} from '../types';

class RoomEventContainer {
  #room: Room;
  #handler: RoomHandler;

  constructor(room: Room, handler: RoomHandler) {
    this.#room = room;
    this.#handler = handler;
  }

  bindRoomEvents = () => {
    this.#room
      .on(RoomEvent.ParticipantConnected, this.onParticipantConnected)
      .on(RoomEvent.ParticipantDisconnected, this.onParticipantDisconnected)
      .on(RoomEvent.ConnectionStateChanged, this.onConnectionStateChanged);
  };

  initializeCurrentRoomStatus = (participant: Participant) => {
    this.onParticipantConnected(participant);
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  #sequenceHandler = <T extends Function, S>(handler: T | undefined, ...args: S[]) => {
    if (handler) {
      handler.apply(undefined, ...args);
    }
  };

  onParticipantConnected = (participant: Participant) => {
    const targetParticipant = TargetParticipantFactory.createTargetParticipant(participant);

    this.#sequenceHandler<OnParticipantConnected, [TargetParticipant]>(this.#handler.onParticipantConnected, [
      targetParticipant,
    ]);
  };

  onParticipantDisconnected = (participant: Participant) => {
    const targetParticipant = TargetParticipantFactory.createTargetParticipant(participant);

    this.#sequenceHandler<OnParticipantDisconnected, [TargetParticipant]>(this.#handler.onParticipantDisconnected, [
      targetParticipant,
    ]);
  };

  onConnectionStateChanged = async (connectionState: ConnectionState) => {
    const currentConnectionInfo: CurrentConnectionInfo = {
      roomId: this.#room.name,
      status: connectionState,
    };

    this.#sequenceHandler<OnConnectionStateChanged, [CurrentConnectionInfo]>(this.#handler.onConnectionStateChanged, [
      currentConnectionInfo,
    ]);
  };
}

export default RoomEventContainer;
