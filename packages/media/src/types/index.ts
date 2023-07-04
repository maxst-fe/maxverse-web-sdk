import { RoomOptions } from 'livekit-client';
import { TargetParticipant } from '../participant/targetParticipant';

export interface Config extends RoomOptions {
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
}

export type OnParticipantConnected = (targetParticipant: TargetParticipant) => void;
export type OnParticipantDisconnected = (targetParticipant: TargetParticipant) => void;
export type OnConnectionStateChanged = (currentConnectionInfo: CurrentConnectionInfo) => void;

export type OnLocalTrackUpdated = (targetParticipant: TargetParticipant) => void;
export type OnRemoteTrackUpdated = (targetParticipant: TargetParticipant) => void;
export type OnTrackSwitched = (targetParticipant: TargetParticipant) => void;

export interface RoomHandler {
  onParticipantConnected?: OnParticipantConnected;
  onParticipantDisconnected?: OnParticipantDisconnected;
  onConnectionStateChanged?: OnConnectionStateChanged;
}

export interface ParticipantHandler {
  onLocalVideoUpdated?: OnLocalTrackUpdated;
  onLocalAudioUpdated?: OnLocalTrackUpdated;
  onLocalScreenShareUpdated?: OnLocalTrackUpdated;
  onRemoteVideoUpdated?: OnRemoteTrackUpdated;
  onRemoteAudioUpdated?: OnRemoteTrackUpdated;
  onRemoteScreenShareUpdated?: OnRemoteTrackUpdated;
  onVideoSwitched?: OnTrackSwitched;
  onAudioSwitched?: OnTrackSwitched;
}

export enum InitialConnectionStatus {
  CONNECTION_SUCCESS = 'CONNECTION_SUCCESS',
  CONNECTION_FAIL = 'CONNECTION_FAIL',
  PREPARE_CONNECTION_SUCCESS = 'PREPARE_CONNECTION_SUCCESS',
  PREPARE_CONNECTION_FAIL = 'PREPARE_CONNECTION_FAIL',
}

export enum ConnectionState {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Reconnecting = 'reconnecting',
}

export interface CurrentConnectionInfo {
  roomId: string;
  status: ConnectionState;
}
