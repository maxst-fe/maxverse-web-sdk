import Editor from '../app';
import { IIndexedDBService } from '../service/storage';

export type Services = {
  IndexedDBService: IIndexedDBService;
};

class EditorStorage {
  #Editor: Editor;
  #Services: Services;

  constructor(editor: Editor, services: Services) {
    this.#Editor = editor;
    this.#Services = services;
  }

  public init() {
    const { scene } = this.#Editor;
    this.#Services.IndexedDBService.init();
    this.#Services.IndexedDBService.loadAllObjects(scene);
  }

  public getDataAll() {
    return this.#Services.IndexedDBService.getDataAll();
  }

  public patch(data: any, id: number | string) {
    return this.#Services.IndexedDBService.patch(data, id);
  }

  public save(data: any, id?: number | string) {
    const saveData = { id, source: data, transform: null };
    this.#Services.IndexedDBService.save(saveData);
  }
}

export default EditorStorage;
