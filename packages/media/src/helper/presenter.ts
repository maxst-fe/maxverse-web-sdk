import { Participant, Room } from "livekit-client";

class Presenter {
  #room: Room;

  constructor(room: Room) {
    this.#room = room;
  }

  get #allParticipant(): Participant[] {
    return [
      this.#room.localParticipant,
      ...Array.from(this.#room.participants.values()),
    ];
  }

  find = (userId: string) => {
    const presenter = this.#allParticipant.find((participant) => {
      return participant.identity === userId;
    });

    return presenter;
  };
}

export default Presenter;
