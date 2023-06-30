import { LocalParticipant, Participant, Track } from 'livekit-client';

export class TargetParticipantFactory {
  static createTargetParticipant = (participant: Participant) => {
    return new TargetParticipant(participant);
  };
}

export class TargetParticipant {
  #participant: Participant;

  constructor(participant: Participant) {
    this.#participant = participant;
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

  get #videoTrackPublication() {
    return this.#participant.getTrack(Track.Source.Camera);
  }

  get #audioTrackPublication() {
    return this.#participant.getTrack(Track.Source.Microphone);
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

  attachElement = (element: HTMLMediaElement) => {
    if (element instanceof HTMLVideoElement && this.isVideoEnabled) {
      this.#videoTrackPublication?.videoTrack?.attach(element);
    }
    if (element instanceof HTMLAudioElement && this.isAudioEnabled) {
      this.#videoTrackPublication?.audioTrack?.attach(element);
    }
  };
}
