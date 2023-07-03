import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  ParticipantEvent,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  Track,
  TrackPublication,
} from 'livekit-client';
import { sequenceHandler } from '../helper';
import {
  OnAudioSwitched,
  OnLocalTrackPublished,
  OnTrackSubscribed,
  OnVideoSwitched,
  ParticipantHandler,
} from '../types';
import { TargetParticipant, TargetParticipantFactory } from './targetParticipant';

class ParticipantEventContainer {
  #room: Room;
  #handler: ParticipantHandler;

  constructor(room: Room, handler: ParticipantHandler) {
    this.#room = room;
    this.#handler = handler;
  }

  bindParticipantEvents = (participant: Participant) => {
    if (participant instanceof LocalParticipant) {
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
      });
  };

  #onLocalTrackUpdate = (localTrackPublication: LocalTrackPublication) => {
    const targetParticipant = TargetParticipantFactory.createTargetParticipant(this.#room.localParticipant);
    const { videoTrack, audioTrack, source } = localTrackPublication;

    if (videoTrack && source === Track.Source.Camera) {
      sequenceHandler<OnLocalTrackPublished, [TargetParticipant]>(this.#handler.onLocalVideoTrackPublished, [
        targetParticipant,
      ]);
    }
    if (audioTrack && source === Track.Source.Microphone) {
      sequenceHandler<OnLocalTrackPublished, [TargetParticipant]>(this.#handler.onLocalAudioTrackPublished, [
        targetParticipant,
      ]);
    }
  };

  #onTrackSubscribed = (
    participant: Participant,
    _remoteTrack: RemoteTrack,
    remoteTrackPublication: RemoteTrackPublication
  ) => {
    const { source } = remoteTrackPublication;

    const targetParticipant = TargetParticipantFactory.createTargetParticipant(participant);

    if (source === Track.Source.Camera) {
      sequenceHandler<OnTrackSubscribed, [TargetParticipant]>(this.#handler.onVideoTrackSubscribed, [
        targetParticipant,
      ]);
    }
    if (source === Track.Source.Microphone) {
      sequenceHandler<OnTrackSubscribed, [TargetParticipant]>(this.#handler.onAudioTrackSubscribed, [
        targetParticipant,
      ]);
    }
  };

  #onTrackSwitched = (participant: Participant, trackPublication: TrackPublication) => {
    const targetParticipant = TargetParticipantFactory.createTargetParticipant(participant);
    const { videoTrack, audioTrack, source } = trackPublication;

    if (videoTrack && source === Track.Source.Camera) {
      sequenceHandler<OnVideoSwitched, [TargetParticipant]>(this.#handler.onVideoSwitched, [targetParticipant]);
    }
    if (audioTrack && source === Track.Source.Microphone) {
      sequenceHandler<OnAudioSwitched, [TargetParticipant]>(this.#handler.onAudioSwitched, [targetParticipant]);
    }
  };
}

export default ParticipantEventContainer;
