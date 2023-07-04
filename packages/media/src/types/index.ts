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

export type OnLocalTrackPublished = (targetParticipant: TargetParticipant) => void;
export type OnTrackSubscribed = (targetParticipant: TargetParticipant) => void;
export type OnVideoSwitched = (targetParticipant: TargetParticipant) => void;
export type OnAudioSwitched = (targetParticipant: TargetParticipant) => void;

export interface RoomHandler {
  onParticipantConnected?: OnParticipantConnected;
  onParticipantDisconnected?: OnParticipantDisconnected;
  onConnectionStateChanged?: OnConnectionStateChanged;
}

export interface ParticipantHandler {
  onLocalVideoTrackPublished?: OnLocalTrackPublished;
  onLocalAudioTrackPublished?: OnLocalTrackPublished;
  onLocalScreenShareTrackPublished?: OnLocalTrackPublished;
  onLocalScreenShareTrackUnpublished?: OnLocalTrackPublished;
  onVideoTrackSubscribed?: OnTrackSubscribed;
  onAudioTrackSubscribed?: OnTrackSubscribed;
  onScreenShareTrackSubscribed?: OnTrackSubscribed;
  onScreenShareTrackUnsubscribed?: OnTrackSubscribed;
  onVideoSwitched?: OnVideoSwitched;
  onAudioSwitched?: OnAudioSwitched;
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

export interface ParticipantInfo {
  identity: string;
  name: string;
  isLocal: boolean;
  joinedAt: Date | undefined;
  lastSpokeAt: Date;
}
