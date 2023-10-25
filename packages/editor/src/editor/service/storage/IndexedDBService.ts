import * as THREE from 'three';
import { ObjectLoaderService } from '../loader';

export interface IIndexedDBService {
  init(): void;

  getData(key: number): Promise<IDBRequest<any>>;

  getDataAll(): Promise<IDBRequest<any>>;

  patch(data: any, id: number | string): void;

  save(saveData: any): void;

  loadAllObjects(scene: THREE.Scene): Promise<void>;
}

class IndexedDBService implements IIndexedDBService {
  public init() {
    const indexedDB = window.indexedDB;
    const openRequest = indexedDB.open('EditorDB');

    openRequest.onupgradeneeded = e => {
      const target = e.target as IDBOpenDBRequest;

      const db = target.result;
      db.createObjectStore('states', { keyPath: 'id', autoIncrement: true });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    openRequest.onsuccess = _e => {
      const db = openRequest.result;

      const transaction = db.transaction('states', 'readwrite');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const objectStore = transaction.objectStore('states');
    };
  }

  public async getData(key: number): Promise<IDBRequest<any>> {
    const openRequest = indexedDB.open('EditorDB');

    return new Promise(resolve => {
      openRequest.onsuccess = e => {
        const target = e.target as IDBOpenDBRequest;
        const db = target.result;
        const transaction = db.transaction('states', 'readonly');
        const objectStore = transaction.objectStore('states');

        resolve(objectStore.get(key));
      };
    });
  }

  public async getDataAll(): Promise<IDBRequest<any>> {
    const openRequest = indexedDB.open('EditorDB');

    return new Promise(resolve => {
      openRequest.onsuccess = e => {
        const target = e.target as IDBOpenDBRequest;
        const db = target.result;
        const transaction = db.transaction('states', 'readonly');
        const objectStore = transaction.objectStore('states');

        resolve(objectStore.getAll());
      };
    });
  }

  public patch(data: any, id: number | string) {
    const openRequest = indexedDB.open('EditorDB');

    openRequest.onsuccess = e => {
      const target = e.target as IDBOpenDBRequest;
      const db = target.result;
      const transaction = db.transaction('states', 'readwrite');
      const objectStore = transaction.objectStore('states');

      const objectStoreTitleRequest = objectStore.get(id);

      objectStoreTitleRequest.onsuccess = () => {
        const storeData = objectStoreTitleRequest.result;

        if (!storeData) {
          return;
        }
        storeData.transform = data.transform;

        objectStore.put(storeData);
      };
    };
  }

  public save(saveData: any) {
    const openRequest = indexedDB.open('EditorDB');

    openRequest.onsuccess = e => {
      const target = e.target as IDBOpenDBRequest;
      const db = target.result;
      const transaction = db.transaction('states', 'readwrite');
      const objectStore = transaction.objectStore('states');

      objectStore.add(saveData);
    };
  }

  public async loadAllObjects(scene: THREE.Scene) {
    const requestDB = await this.getDataAll().then(res => res);

    requestDB.onsuccess = async e => {
      const target = e.target as IDBRequest;

      target.result.forEach((data: any) => {
        const id = data.id;
        const source = data.source;
        const transform = data.transform;

        new ObjectLoaderService().objectLoadAsFolder(source).then(objectGroup => {
          if (!objectGroup) {
            return;
          }

          objectGroup.uuid = id;

          try {
            if (transform && objectGroup) {
              objectGroup.applyMatrix4(transform);
            }
          } catch (e) {
            console.log(e);
          }

          scene.add(objectGroup);
        });
      });
    };
  }
}

export default IndexedDBService;
