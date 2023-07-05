import { Room, Track } from 'livekit-client';

class LocalTrackController {
  #room: Room;
  #isLocalVideoEnabled: boolean;
  #isLocalAudioEnabled: boolean;
  #videoDeviceId: string | undefined;
  #audioDeviceId: string | undefined;

  constructor(
    room: Room,
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    videoDeviceId: string | undefined,
    audioDeviceId: string | undefined
  ) {
    this.#room = room;
    this.#isLocalVideoEnabled = isVideoEnabled;
    this.#isLocalAudioEnabled = isAudioEnabled;
    this.#videoDeviceId = videoDeviceId;
    this.#audioDeviceId = audioDeviceId;
  }

  toggleCam = () => {
    const isEnabled = this.#room.localParticipant.getTrack(Track.Source.Camera)?.isMuted ?? true;
    this.#room.localParticipant.setCameraEnabled(isEnabled);
  };

  toggleMic = () => {
    const isEnabled = this.#room.localParticipant.getTrack(Track.Source.Microphone)?.isMuted ?? true;
    this.#room.localParticipant.setMicrophoneEnabled(isEnabled);
  };

  toggleScreenShare = () => {
    const isEnabled = this.#room.localParticipant.isScreenShareEnabled ?? true;
    this.#room.localParticipant.setScreenShareEnabled(!isEnabled);
  };

  initializeLocalTracks = async () => {
    if (this.#room.options.videoCaptureDefaults && this.#videoDeviceId) {
      this.#room.options.videoCaptureDefaults.deviceId = this.#videoDeviceId;
    }
    if (this.#room.options.audioCaptureDefaults && this.#audioDeviceId) {
      this.#room.options.audioCaptureDefaults.deviceId = this.#audioDeviceId;
    }

    await this.#room.localParticipant.setCameraEnabled(this.#isLocalVideoEnabled);
    await this.#room.localParticipant.setMicrophoneEnabled(this.#isLocalAudioEnabled);
  };
}

export default LocalTrackController;
