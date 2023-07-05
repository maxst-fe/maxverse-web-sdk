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
import { OnLocalTrackUpdated, OnRemoteTrackUpdated, OnTrackSwitched, ParticipantHandler } from '../types';
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
        .on(ParticipantEvent.LocalTrackPublished, this.#onLocalTrackUpdated)
        .on(ParticipantEvent.LocalTrackUnpublished, this.#onLocalTrackUpdated);
    }
    participant
      .on(
        ParticipantEvent.TrackSubscribed,
        (remoteTrack: RemoteTrack, remoteTrackPublication: RemoteTrackPublication) => {
          this.#onRemoteTrackUpdated(participant, remoteTrack, remoteTrackPublication);
        }
      )
      .on(
        ParticipantEvent.TrackUnsubscribed,
        (remoteTrack: RemoteTrack, remoteTrackPublication: RemoteTrackPublication) => {
          this.#onRemoteTrackUpdated(participant, remoteTrack, remoteTrackPublication);
        }
      )
      .on(ParticipantEvent.TrackMuted, (trackPublication: TrackPublication) => {
        this.#onTrackSwitched(participant, trackPublication);
      })
      .on(ParticipantEvent.TrackUnmuted, (trackPublication: TrackPublication) => {
        this.#onTrackSwitched(participant, trackPublication);
      });
  };

  #onLocalTrackUpdated = async (localTrackPublication: LocalTrackPublication) => {
    const { source } = localTrackPublication;

    const targetParticipant = await TargetParticipantFactory.createTargetParticipant(this.#room.localParticipant);

    if (source === Track.Source.Camera) {
      sequenceHandler<OnLocalTrackUpdated, [TargetParticipant]>(this.#handler.onLocalVideoUpdated, [targetParticipant]);
    }
    if (source === Track.Source.Microphone) {
      sequenceHandler<OnLocalTrackUpdated, [TargetParticipant]>(this.#handler.onLocalAudioUpdated, [targetParticipant]);
    }
    if (source === Track.Source.ScreenShare) {
      sequenceHandler<OnLocalTrackUpdated, [TargetParticipant]>(this.#handler.onLocalScreenShareUpdated, [
        targetParticipant,
      ]);
    }
  };

  #onRemoteTrackUpdated = async (
    participant: Participant,
    _remoteTrack: RemoteTrack,
    remoteTrackPublication: RemoteTrackPublication
  ) => {
    const { source } = remoteTrackPublication;

    const targetParticipant = await TargetParticipantFactory.createTargetParticipant(participant);

    if (source === Track.Source.Camera) {
      sequenceHandler<OnRemoteTrackUpdated, [TargetParticipant]>(this.#handler.onRemoteVideoUpdated, [
        targetParticipant,
      ]);
    }
    if (source === Track.Source.Microphone) {
      sequenceHandler<OnRemoteTrackUpdated, [TargetParticipant]>(this.#handler.onRemoteAudioUpdated, [
        targetParticipant,
      ]);
    }
    if (source === Track.Source.ScreenShare) {
      sequenceHandler<OnRemoteTrackUpdated, [TargetParticipant]>(this.#handler.onRemoteScreenShareUpdated, [
        targetParticipant,
      ]);
    }
  };

  #onTrackSwitched = async (participant: Participant, trackPublication: TrackPublication) => {
    const { source } = trackPublication;

    const targetParticipant = await TargetParticipantFactory.createTargetParticipant(participant);

    if (source === Track.Source.Camera) {
      sequenceHandler<OnTrackSwitched, [TargetParticipant]>(this.#handler.onVideoSwitched, [targetParticipant]);
    }
    if (source === Track.Source.Microphone) {
      sequenceHandler<OnTrackSwitched, [TargetParticipant]>(this.#handler.onAudioSwitched, [targetParticipant]);
    }
  };
}

export default ParticipantEventContainer;
