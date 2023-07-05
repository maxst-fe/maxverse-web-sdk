import { Participant, Room, RoomEvent } from 'livekit-client';
import { sequenceHandler } from '../helper';
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

  onParticipantConnected = async (participant: Participant) => {
    const targetParticipant = await TargetParticipantFactory.createTargetParticipant(participant);

    sequenceHandler<OnParticipantConnected, [TargetParticipant]>(this.#handler.onParticipantConnected, [
      targetParticipant,
    ]);
  };

  onParticipantDisconnected = async (participant: Participant) => {
    const targetParticipant = await TargetParticipantFactory.createTargetParticipant(participant);

    sequenceHandler<OnParticipantDisconnected, [TargetParticipant]>(this.#handler.onParticipantDisconnected, [
      targetParticipant,
    ]);
  };

  onConnectionStateChanged = async (connectionState: ConnectionState) => {
    const currentConnectionInfo: CurrentConnectionInfo = {
      roomId: this.#room.name,
      status: connectionState,
    };

    sequenceHandler<OnConnectionStateChanged, [CurrentConnectionInfo]>(this.#handler.onConnectionStateChanged, [
      currentConnectionInfo,
    ]);
  };
}

export default RoomEventContainer;
