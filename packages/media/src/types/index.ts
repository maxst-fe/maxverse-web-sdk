import { Room, RoomOptions } from "livekit-client";
import { ParticipantEventContainer } from "../participant";
import { RoomEventContainer } from "../room";

export type RoomFactory = (roomOptions?: RoomOptions) => Room;

export type ParticipantEventContainerFactory = (
  participantHandler: ParticipantHandler
) => ParticipantEventContainer;

export type RoomEventContainerFactory = (
  isVideoEnabled: boolean,
  isAudioEnalbed: boolean,
  roomHandler: RoomHandler
) => RoomEventContainer;

export type ControlTrackToElement = (
  element: HTMLMediaElement,
  delay?: number
) => void;

export interface ElementInfo {
  sid: string;
  template?: string;
}

export interface ParticipantUI {
  container: ElementInfo;
  solid_video: ElementInfo;
  main_video: ElementInfo;
  placeholder: ElementInfo;
  default_screen: ElementInfo;
}

export interface ButtonStatus {
  enabled: ElementInfo;
  disabled: ElementInfo;
}

export interface ControllerUI {
  video_button: ButtonStatus;
  audio_button: ButtonStatus;
  screen_share_button: ButtonStatus;
}

export interface SectionUI {
  participants: ElementInfo;
  controllers: ElementInfo;
}

export interface View {
  section: SectionUI;
  participant: ParticipantUI;
  controller: ControllerUI;
}

export interface Config extends RoomOptions {
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
}

export type OnParticipantConnected = (
  sid: string,
  isLocalParticipant: boolean,
  participantDeviceReadyStatus: ParticipantDeviceReadyStatus
) => void;
export type OnParticipantDisconnected = (sid: string) => void;
export type OnConnectionStateChanged = (
  currentConnectionInfo: CurrentConnectionInfo
) => void;

export type OnLocalTrackPublished = (
  sid: string,
  attachTrack: ControlTrackToElement
) => void;
export type OnTrackSubscribed = (
  sid: string,
  attachTrack: ControlTrackToElement
) => void;
export type OnVideoSwitched = (
  sid: string,
  isMuted: boolean,
  isLocalParticipant: boolean,
  switchTrack: ControlTrackToElement
) => void;
export type OnAudioSwitched = (
  sid: string,
  isMuted: boolean,
  isLocalParticipant: boolean,
  switchTrack: ControlTrackToElement
) => void;

export interface RoomHandler {
  onParticipantConnected?: OnParticipantConnected;
  onParticipantDisconnected?: OnParticipantDisconnected;
  onConnectionStateChanged?: OnConnectionStateChanged;
}

export interface ParticipantHandler {
  onLocalVideoTrackPublished?: OnLocalTrackPublished;
  onLocalAudioTrackPublished?: OnLocalTrackPublished;
  onVideoTrackSubscribed?: OnTrackSubscribed;
  onAudioTrackSubscribed?: OnTrackSubscribed;
  onVideoSwitched?: OnVideoSwitched;
  onAudioSwitched?: OnAudioSwitched;
}

export enum DeviceReadyStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
}
export enum InitialConnectionStatus {
  CONNECTION_SUCCESS = "CONNECTION_SUCCESS",
  CONNECTION_FAIL = "CONNECTION_FAIL",
  PREPARE_CONNECTION_SUCCESS = "PREPARE_CONNECTION_SUCCESS",
  PREPARE_CONNECTION_FAIL = "PREPARE_CONNECTION_FAIL",
}

export enum ConnectionState {
  Disconnected = "disconnected",
  Connecting = "connecting",
  Connected = "connected",
  Reconnecting = "reconnecting",
}

export interface CurrentConnectionInfo {
  roomId: string;
  status: ConnectionState;
}

export type ParticipantDeviceReadyStatus = Record<
  "video" | "audio",
  DeviceReadyStatus
>;

export interface ParticipantInfo {
  identity: string;
  name: string;
  isLocal: boolean;
  joinedAt: Date | undefined;
  lastSpokeAt: Date;
}
