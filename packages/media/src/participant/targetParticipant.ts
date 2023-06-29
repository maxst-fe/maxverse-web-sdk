import { LocalParticipant, Participant, RemoteParticipant } from 'livekit-client';

export class TargetParticipantFactory {
  static createTargetParticipant = (participant: Participant) => {
    if (!(participant instanceof (LocalParticipant || RemoteParticipant))) {
      return;
    }

    return new TargetParticipant(participant);
  };
}

export class TargetParticipant {
  #participant: Participant;

  constructor(participant: Participant) {
    this.#participant = participant;
  }
}
