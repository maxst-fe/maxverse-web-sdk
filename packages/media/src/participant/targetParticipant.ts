import { LocalParticipant, Participant, Track, TrackPublication } from 'livekit-client';

type TrackPublicationStatus = TrackPublication | undefined;
type TrackSource = 'video' | 'audio' | 'screenShare';

export class TargetParticipantFactory {
  static create = async (participant: Participant) => {
    const [videoTrackPublication, audioTrackPublication, screenShareTrackPublication] = await Promise.all([
      participant.getTrack(Track.Source.Camera),
      participant.getTrack(Track.Source.Microphone),
      participant.getTrack(Track.Source.ScreenShare),
    ]);

    return new TargetParticipant(
      participant,
      videoTrackPublication,
      audioTrackPublication,
      screenShareTrackPublication
    );
  };
}

export class TargetParticipant {
  #participant: Participant;
  #videoTrackPublication: TrackPublicationStatus;
  #audioTrackPublication: TrackPublicationStatus;
  #screenShareTrackPublication: TrackPublicationStatus;

  constructor(
    participant: Participant,
    videoTrackPublication: TrackPublicationStatus,
    audioTrackPublication: TrackPublicationStatus,
    screenShareTrackPublication: TrackPublicationStatus
  ) {
    this.#participant = participant;
    this.#videoTrackPublication = videoTrackPublication;
    this.#audioTrackPublication = audioTrackPublication;
    this.#screenShareTrackPublication = screenShareTrackPublication;
  }

  get sid() {
    return this.#participant.sid;
  }

  get identity() {
    return this.#participant.identity;
  }

  get name() {
    return this.#participant.name;
  }

  get isLocal() {
    return this.#participant instanceof LocalParticipant;
  }

  get isVideoEnabled() {
    const isSubscribed = this.#videoTrackPublication?.isSubscribed ?? false;
    const isValidTrack = this.#videoTrackPublication?.videoTrack ?? false;

    return isSubscribed && isValidTrack && this.#participant.isCameraEnabled;
  }

  get isAudioEnabled() {
    const isSubscribed = this.#audioTrackPublication?.isSubscribed ?? false;
    const isValidTrack = this.#audioTrackPublication?.audioTrack ?? false;

    return isSubscribed && isValidTrack && this.#participant.isMicrophoneEnabled;
  }

  get isScreenShareEnabled() {
    const isSubscribed = this.#screenShareTrackPublication?.isSubscribed ?? false;
    const isValidTrack = this.#screenShareTrackPublication?.videoTrack ?? false;

    return isSubscribed && isValidTrack;
  }

  attachTrackToElement = (element: HTMLMediaElement, trackSource: TrackSource) => {
    if (element instanceof HTMLVideoElement && this.isVideoEnabled) {
      if (this.isVideoEnabled && trackSource === 'video') {
        this.#videoTrackPublication?.videoTrack?.attach(element);
      }
      if (this.isScreenShareEnabled && trackSource === 'audio') {
        this.#screenShareTrackPublication?.videoTrack?.attach(element);
      }
    }
    if (this.isAudioEnabled && element instanceof HTMLAudioElement) {
      if (trackSource === 'audio') {
        this.#audioTrackPublication?.audioTrack?.attach(element);
      }
    }
  };

  detachTrackFromElement = (element: HTMLMediaElement, trackSource: TrackSource) => {
    if (element instanceof HTMLVideoElement) {
      if (trackSource === 'video') {
        this.#videoTrackPublication?.videoTrack?.detach(element);
      }
      if (trackSource === 'screenShare') {
        this.#screenShareTrackPublication?.videoTrack?.detach(element);
      }
    }
    if (element instanceof HTMLAudioElement) {
      if (trackSource === 'audio') {
        this.#audioTrackPublication?.audioTrack?.detach(element);
      }
    }
  };
}
