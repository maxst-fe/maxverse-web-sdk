import { Participant } from 'livekit-client';
import Presenter from './presenter';

export enum MetadataSort {
  PRESENTER = 'presenter',
  UNKNOWN = 'unknown',
}
export type MetadataValue = {
  [MetadataSort.PRESENTER]: { userId: string };
};
export type Metadata = Record<MetadataSort, unknown>;

class DataChannelContainer {
  #presenter: Presenter;

  constructor(presenter: Presenter) {
    this.#presenter = presenter;
  }

  #parse = <T extends Metadata | undefined>(data: string) => {
    return JSON.parse(data) as T;
  };

  #checkSort = (data: Metadata, sort: MetadataSort) => {
    return Object.hasOwn(data, sort);
  };

  onFetchMetaDataHandler = (metadata: string): { type: MetadataSort; payload?: Participant } => {
    const parsedMetadata = this.#parse(metadata);

    if (!parsedMetadata) {
      console.error('not found valid metadata');
      return { type: MetadataSort.UNKNOWN };
    }

    if (this.#checkSort(parsedMetadata, MetadataSort.PRESENTER)) {
      const { userId } = parsedMetadata.presenter as MetadataValue[MetadataSort.PRESENTER];

      const presenter = this.#presenter.find(userId);

      if (!presenter) {
        console.error('do not found presenter');
        return { type: MetadataSort.UNKNOWN };
      }

      return { type: MetadataSort.PRESENTER, payload: presenter };
    }

    return { type: MetadataSort.UNKNOWN };
  };
}

export default DataChannelContainer;
