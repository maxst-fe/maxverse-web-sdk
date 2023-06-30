import {
  AudioTrack,
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  ParticipantEvent,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  Track,
  TrackPublication,
  VideoTrack,
} from 'livekit-client';
import {
  ControlTrackToElement,
  OnAudioSwitched,
  OnLocalTrackPublished,
  OnTrackSubscribed,
  OnVideoSwitched,
  ParticipantHandler,
} from '../types';

class ParticipantEventContainer {
  #room: Room;
  #handler: ParticipantHandler;

  constructor(room: Room, handler: ParticipantHandler) {
    this.#room = room;
    this.#handler = handler;
  }

  bindParticipantEvents = (participant: Participant) => {
    if (this.#checkisLocalParticipant(participant)) {
      participant
        .on(ParticipantEvent.LocalTrackPublished, this.#onLocalTrackUpdate)
        .on(ParticipantEvent.LocalTrackUnpublished, this.#onLocalTrackUpdate);
    }
    participant
      .on(
        ParticipantEvent.TrackSubscribed,
        (remoteTrack: RemoteTrack, remoteTrackPublication: RemoteTrackPublication) => {
          this.#onTrackSubscribed(participant, remoteTrack, remoteTrackPublication);
        }
      )
      .on(ParticipantEvent.TrackMuted, (trackPublication: TrackPublication) => {
        this.#onTrackSwitched(participant, trackPublication);
      })
      .on(ParticipantEvent.TrackUnmuted, (trackPublication: TrackPublication) => {
        this.#onTrackSwitched(participant, trackPublication);
      })
      .on(ParticipantEvent.IsSpeakingChanged, () => {})
      .on(ParticipantEvent.ConnectionQualityChanged, () => {});
  };

  // eslint-disable-next-line @typescript-eslint/ban-types
  #sequenceHandler = <T extends Function, S>(handler: T | undefined, ...args: S[]) => {
    if (handler) {
      handler.apply(undefined, ...args);
    }
  };

  #checkisLocalParticipant = (participant: Participant) => {
    return participant instanceof LocalParticipant;
  };

  #attachTrack = (track: VideoTrack | AudioTrack | RemoteTrack) => (element: HTMLMediaElement) => {
    track.attach(element);
  };

  #switchTrack = (track: VideoTrack | AudioTrack, isMuted: boolean) => (element: HTMLMediaElement) => {
    isMuted ? track.detach(element) : track.attach(element);
  };

  #onLocalTrackUpdate = (localTrackPublication: LocalTrackPublication) => {
    const { sid } = this.#room.localParticipant;
    const { videoTrack, audioTrack, source } = localTrackPublication;

    if (videoTrack && source === Track.Source.Camera) {
      this.#sequenceHandler<OnLocalTrackPublished, [string, ControlTrackToElement]>(
        this.#handler.onLocalVideoTrackPublished,
        [sid, this.#attachTrack(videoTrack)]
      );
    }
    if (audioTrack && source === Track.Source.Microphone) {
      this.#sequenceHandler<OnLocalTrackPublished, [string, ControlTrackToElement]>(
        this.#handler.onLocalAudioTrackPublished,
        [sid, this.#attachTrack(audioTrack)]
      );
    }
  };

  #onTrackSubscribed = (
    participant: Participant,
    remoteTrack: RemoteTrack,
    remoteTrackPublication: RemoteTrackPublication
  ) => {
    const { sid } = participant;
    const { source } = remoteTrackPublication;

    if (!remoteTrack || remoteTrack.isMuted) {
      return;
    }

    if (source === Track.Source.Camera) {
      this.#sequenceHandler<OnTrackSubscribed, [string, ControlTrackToElement]>(this.#handler.onVideoTrackSubscribed, [
        sid,
        this.#attachTrack(remoteTrack),
      ]);
    }
    if (source === Track.Source.Microphone) {
      this.#sequenceHandler<OnTrackSubscribed, [string, ControlTrackToElement]>(this.#handler.onAudioTrackSubscribed, [
        sid,
        this.#attachTrack(remoteTrack),
      ]);
    }
  };

  #onTrackSwitched = (participant: Participant, trackPublication: TrackPublication) => {
    const { videoTrack, audioTrack, source, isSubscribed } = trackPublication;

    if (!isSubscribed) {
      return;
    }
    const { sid } = participant;

    if (videoTrack && source === Track.Source.Camera) {
      const isMuted = videoTrack.isMuted;

      this.#sequenceHandler<OnVideoSwitched, [string, boolean, boolean, ControlTrackToElement]>(
        this.#handler.onVideoSwitched,
        [sid, isMuted, this.#checkisLocalParticipant(participant), this.#switchTrack(videoTrack, isMuted)]
      );
    }
    if (audioTrack && source === Track.Source.Microphone) {
      const isMuted = audioTrack.isMuted;

      this.#sequenceHandler<OnAudioSwitched, [string, boolean, boolean, ControlTrackToElement]>(
        this.#handler.onAudioSwitched,
        [sid, isMuted, this.#checkisLocalParticipant(participant), this.#switchTrack(audioTrack, isMuted)]
      );
    }
  };
}

export default ParticipantEventContainer;
