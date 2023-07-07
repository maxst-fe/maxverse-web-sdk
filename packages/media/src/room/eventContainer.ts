import { Participant, Room, RoomEvent } from "livekit-client";
import { sequenceHandler } from "../helper";
import {
  TargetParticipant,
  TargetParticipantFactory,
} from "../participant/targetParticipant";
import {
  ConnectionState,
  CurrentConnectionInfo,
  OnConnectionStateChanged,
  OnParticipantConnected,
  OnParticipantDisconnected,
  OnPresenterUpdated,
  RoomHandler,
} from "../types";
import DataChannelContainer, { MetadataSort } from "./dataChannelContainer";

class RoomEventContainer {
  #room: Room;
  #handler: RoomHandler;
  #dataChannelContainer: DataChannelContainer;

  constructor(
    room: Room,
    dataChannelContainer: DataChannelContainer,
    handler: RoomHandler
  ) {
    this.#room = room;
    this.#dataChannelContainer = dataChannelContainer;
    this.#handler = handler;
  }

  bindRoomEvents = () => {
    this.#room
      .on(RoomEvent.ParticipantConnected, this.onParticipantConnected)
      .on(RoomEvent.ParticipantDisconnected, this.onParticipantDisconnected)
      .on(RoomEvent.ConnectionStateChanged, this.onConnectionStateChanged)
      .on(RoomEvent.RoomMetadataChanged, this.onRoomMetadataChanged);
  };

  initializeCurrentRoomStatus = (participant: Participant) => {
    this.onParticipantConnected(participant);
  };

  onParticipantConnected = async (participant: Participant) => {
    const targetParticipant = await TargetParticipantFactory.create(
      participant
    );

    sequenceHandler<OnParticipantConnected, [TargetParticipant]>(
      this.#handler.onParticipantConnected,
      [targetParticipant]
    );
  };

  onParticipantDisconnected = async (participant: Participant) => {
    const targetParticipant = await TargetParticipantFactory.create(
      participant
    );

    sequenceHandler<OnParticipantDisconnected, [TargetParticipant]>(
      this.#handler.onParticipantDisconnected,
      [targetParticipant]
    );
  };

  onConnectionStateChanged = async (connectionState: ConnectionState) => {
    const currentConnectionInfo: CurrentConnectionInfo = {
      roomId: this.#room.name,
      status: connectionState,
    };

    sequenceHandler<OnConnectionStateChanged, [CurrentConnectionInfo]>(
      this.#handler.onConnectionStateChanged,
      [currentConnectionInfo]
    );
  };

  onRoomMetadataChanged = async (metadata: string) => {
    const data = this.#dataChannelContainer.onFetchMetaDataHandler(metadata);

    if (data.type === MetadataSort.PRESENTER) {
      const targetParticipant = await TargetParticipantFactory.create(
        data.payload as Participant
      );
      console.log(targetParticipant);
      sequenceHandler<OnPresenterUpdated, [TargetParticipant]>(
        this.#handler.onPresenterUpdated,
        [targetParticipant]
      );
    }
  };
}

export default RoomEventContainer;
