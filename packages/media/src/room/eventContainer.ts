import { LocalParticipant, Participant, Room, RoomEvent, Track } from 'livekit-client';
import {
  ConnectionState,
  CurrentConnectionInfo,
  DeviceReadyStatus,
  OnConnectionStateChanged,
  OnParticipantConnected,
  OnParticipantDisconnected,
  ParticipantDeviceReadyStatus,
  RoomHandler,
} from '../types';

class RoomEventContainer {
  #isLocalVideoEnabled: boolean;
  #isLocalAudioEnabled: boolean;
  #room: Room;
  #handler: RoomHandler;

  constructor(isVideoEnabled: boolean, isAudioEnabled: boolean, room: Room, handler: RoomHandler) {
    this.#isLocalVideoEnabled = isVideoEnabled;
    this.#isLocalAudioEnabled = isAudioEnabled;
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

  #takeDeviceReadyStatus = (isDeviceEnabled: boolean): DeviceReadyStatus => {
    return isDeviceEnabled ? DeviceReadyStatus.COMPLETE : DeviceReadyStatus.INCOMPLETE;
  };

  #checkisLocalParticipant = (participant: Participant) => {
    return participant instanceof LocalParticipant;
  };

  #checkParticipantDeviceReadyStatus = (participant: Participant): ParticipantDeviceReadyStatus => {
    if (this.#checkisLocalParticipant(participant)) {
      return {
        video: this.#takeDeviceReadyStatus(this.#isLocalVideoEnabled),
        audio: this.#takeDeviceReadyStatus(this.#isLocalAudioEnabled),
      };
    }
    const videoTrackPub = participant.getTrack(Track.Source.Camera);
    const audioTrackPub = participant.getTrack(Track.Source.Microphone);

    const isVideoEnabled = Boolean(videoTrackPub) && !videoTrackPub?.isMuted;
    const isAudioEnabled = Boolean(audioTrackPub) && !audioTrackPub?.isMuted;

    return {
      video: this.#takeDeviceReadyStatus(isVideoEnabled),
      audio: this.#takeDeviceReadyStatus(isAudioEnabled),
    };
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  #sequenceHandler = <T extends Function, S>(handler: T | undefined, ...args: S[]) => {
    if (handler) {
      handler.apply(undefined, ...args);
    }
  };

  onParticipantConnected = (participant: Participant) => {
    const participantDeviceReadyStatus = this.#checkParticipantDeviceReadyStatus(participant);

    this.#sequenceHandler<OnParticipantConnected, [string, boolean, ParticipantDeviceReadyStatus]>(
      this.#handler.onParticipantConnected,
      [participant.sid, this.#checkisLocalParticipant(participant), participantDeviceReadyStatus]
    );
  };

  onParticipantDisconnected = (participant: Participant) => {
    this.#sequenceHandler<OnParticipantDisconnected, [string]>(this.#handler.onParticipantDisconnected, [
      participant.sid,
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
