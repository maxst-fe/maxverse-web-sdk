import { TRANSACTION_STORAGE_KEY_PREFIX } from '../../constants';
import { Transaction } from '../../types';
import { SessionStorage } from '../../utils';

export class TransactionManager {
  #storageKey: string;
  #storage: SessionStorage;

  constructor(storage: SessionStorage, clientId: string) {
    this.#storageKey = `${TRANSACTION_STORAGE_KEY_PREFIX}.${clientId}`;
    this.#storage = storage;
  }

  public create(transaction: Transaction) {
    this.#storage.set(this.#storageKey, transaction);
  }

  public get(): Transaction | undefined {
    return this.#storage.get(this.#storageKey);
  }

  public remove() {
    this.#storage.remove(this.#storageKey);
  }
}
